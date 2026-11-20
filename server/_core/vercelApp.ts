import "dotenv/config";
import express from "express";
import crypto from "node:crypto";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerFileUploadRoutes } from "./fileUploadRoutes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { checkDatabaseReady } from "../db";
import {
  cleanupExpiredFileAssets,
  fileUploadAvailability,
  getCleanFileAsset,
  getUserFileAsset,
  malwareScannerStatus,
  markUserFileClean,
  markUserFileInfected,
  markUserFileRejected,
  registerQuarantinedFileAsset,
  sha256Hex,
  validateUploadMetadata,
} from "../fileSecurity";
import {
  createSignedPrivateDownload,
  createSignedPrivateUpload,
  deletePrivateFile,
  readPrivateFile,
  scanWithClamAV,
} from "../fileUploadService";
import { releaseR2StorageUsage } from "../r2Quota";
import { sdk } from "./sdk";
import { applySecurityHeaders } from "../securityPolicy";
import { createRateLimit } from "../rateLimit";
import { durationMs, emitTelemetry } from "../telemetry";
import { handleBillingWebhook } from "../billingWebhook";
import { isAuthorizedCronHmacRequest, isAuthorizedCronRequest } from "./cronAuth";
import { runDocumentTaskBatch } from "../workDeskTasks";
import { runWorkDeskTextTaskBatch } from "../workDeskTextTasks";
import { syncMalwareBazaarRecentDetections, MalwareBazaarFeedError } from "../malwareBazaarFeed";

const app = express();
// Vercel overwrites X-Forwarded-For; trust only the single platform proxy.
app.set("trust proxy", 1);
app.disable("x-powered-by");

function isSameOriginFileRequest(req: express.Request) {
  const origin = req.get("origin");
  if (!origin) return req.get("sec-fetch-site") !== "cross-site";
  try {
    const requestHost = req.get("x-forwarded-host")?.split(",")[0]?.trim() || req.get("host");
    return Boolean(requestHost) && new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

app.use((_req, res, next) => {
  applySecurityHeaders(res, process.env.NODE_ENV === "production");
  next();
});
app.use((req, res, next) => {
  const incoming = req.header("x-request-id");
  const requestId = incoming && /^[a-zA-Z0-9._-]{8,128}$/.test(incoming) ? incoming : crypto.randomUUID();
  const startedAt = performance.now();
  res.setHeader("X-Request-ID", requestId);
  res.locals.requestId = requestId;
  res.on("finish", () => {
    if (!["/health", "/healthz", "/readyz"].includes(req.path)) {
      emitTelemetry("http.request.completed", { requestId, method: req.method, route: req.path, statusCode: res.statusCode, durationMs: durationMs(startedAt) });
    }
  });
  next();
});

const liveness = (_req: express.Request, res: express.Response) =>
  res.status(200).json({ status: "ok", service: "dsai", runtime: "vercel-serverless" });
app.get(["/health", "/healthz", "/api/health", "/api/healthz"], liveness);
app.get(["/readyz", "/api/readyz"], async (_req, res) => {
  const checks = {
    databaseConfigured: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
    databaseHandle: false,
  };
  if (checks.databaseConfigured) checks.databaseHandle = await checkDatabaseReady();
  const ready = checks.databaseConfigured && checks.databaseHandle;
  res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready", service: "dsai", checks });
});

app.post("/api/billing/webhook", express.raw({ type: "application/json", limit: "256kb" }), async (req, res) => {
  try { await handleBillingWebhook(req, res); }
  catch (error) {
    emitTelemetry("billing.webhook.error", { requestId: res.locals.requestId, reason: error instanceof Error ? error.name : "unknown" });
    res.status(500).json({ error: "billing_webhook_failed", requestId: res.locals.requestId });
  }
});

// Only small metadata/control-plane JSON reaches Vercel. File bytes go directly to private R2.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
registerStorageProxy(app);
registerOAuthRoutes(app);
registerFileUploadRoutes(app);

// Vercel Cron sends GET with Authorization: Bearer <CRON_SECRET>.
// Keep this route independent of end-user or legacy scheduled-task sessions.
app.get("/api/scheduled/cleanupFileAssets", async (req, res) => {
  if (!isAuthorizedCronRequest(req.get("authorization"), process.env.CRON_SECRET)) {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const result = await cleanupExpiredFileAssets();
    emitTelemetry("files.cleanup.completed", { requestId: res.locals.requestId, ...result });
    return res.status(200).json({ ok: true, scheduler: "vercel-cron", ...result });
  } catch (error) {
    emitTelemetry("files.cleanup.failed", {
      requestId: res.locals.requestId,
      reason: error instanceof Error ? error.name : "unknown",
    });
    return res.status(500).json({ error: "cleanup_failed", requestId: res.locals.requestId });
  }
});

// Authenticated durable Work Desk worker. No user-supplied task IDs are accepted here.
app.get("/api/scheduled/processDocumentTasks", async (req, res) => {
  const authorized =
    isAuthorizedCronRequest(req.get("authorization"), process.env.CRON_SECRET)
    || isAuthorizedCronHmacRequest(
      req.get("x-dsai-timestamp"),
      req.get("x-dsai-signature"),
      process.env.SUPABASE_CRON_SECRET,
      "/api/scheduled/processDocumentTasks",
    );
  if (!authorized) return res.status(401).json({ error: "unauthorized" });

  try {
    // Text-only AI work is independent of scanning; document extraction remains
    // gated by a successful clean-file verdict from the configured scanner.
    const textTasks = await runWorkDeskTextTaskBatch(1);
    const documents = await runDocumentTaskBatch(1);
    emitTelemetry("workdesk.worker.completed", {
      requestId: res.locals.requestId,
      textTasksProcessed: textTasks.processed,
      documentsProcessed: documents.processed,
      documentWorkerAccepted: documents.accepted,
    });
    return res.status(200).json({ ok: true, worker: "workdesk", textTasks, documents });
  } catch (error) {
    emitTelemetry("workdesk.worker.failed", {
      requestId: res.locals.requestId,
      reason: error instanceof Error ? error.name : "unknown",
    });
    return res.status(500).json({ error: "workdesk_worker_failed", requestId: res.locals.requestId });
  }
});

// MalwareBazaar metadata sync is deliberately daily, never coupled to the minute worker.
app.get("/api/scheduled/syncMalwareBazaar", async (req, res) => {
  const authorized =
    isAuthorizedCronRequest(req.get("authorization"), process.env.CRON_SECRET)
    || isAuthorizedCronHmacRequest(
      req.get("x-dsai-timestamp"),
      req.get("x-dsai-signature"),
      process.env.SUPABASE_CRON_SECRET,
      "/api/scheduled/syncMalwareBazaar",
    );
  if (!authorized) return res.status(401).json({ error: "unauthorized" });
  if (!process.env.MALWAREBAZAAR_AUTH_KEY) {
    return res.status(200).json({
      ok: true,
      status: "disabled",
      reason: "auth_key_not_configured",
      source: "malwarebazaar",
    });
  }
  try {
    const result = await syncMalwareBazaarRecentDetections();
    emitTelemetry("threat_intel.malwarebazaar_sync.completed", {
      requestId: res.locals.requestId,
      recordsUpserted: result.recordsUpserted,
      queryWindowHours: result.queryWindowHours,
    });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    const code = error instanceof MalwareBazaarFeedError ? error.code : "sync_failed";
    emitTelemetry("threat_intel.malwarebazaar_sync.failed", { requestId: res.locals.requestId, code });
    return res.status(code === "not_configured" || code === "database_unavailable" ? 503 : 502)
      .json({ error: "malwarebazaar_sync_failed", code, requestId: res.locals.requestId });
  }
});

app.use("/api/trpc", createRateLimit({ windowMs: 60_000, max: 120, keyPrefix: "trpc" }));
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
app.use("/api", (_req, res) => res.status(404).json({ error: "api-route-not-found", requestId: res.locals.requestId }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  emitTelemetry("http.request.error", { requestId: res.locals.requestId, errorType: error instanceof Error ? error.name : "unknown" });
  if (!res.headersSent) res.status(500).json({ error: "internal-server-error", requestId: res.locals.requestId });
});

export default app;
