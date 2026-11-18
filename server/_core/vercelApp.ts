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
app.post("/api/scheduled/cleanupFileAssets", async (req, res) => {
  try {
    const result = await cleanupExpiredFileAssets();
    return res.status(200).json({ ok: true, scheduler: "vercel-cron", ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "retention cleanup failed";
    return res.status(500).json({ error: message, requestId: res.locals.requestId });
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
