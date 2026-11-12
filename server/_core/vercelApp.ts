import "dotenv/config";
import express from "express";
import crypto from "node:crypto";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { checkDatabaseReady } from "../db";
import { cleanupExpiredFileAssets, malwareScannerStatus } from "../fileSecurity";
import { sdk } from "./sdk";
import { applySecurityHeaders } from "../securityPolicy";
import { createRateLimit } from "../rateLimit";
import { durationMs, emitTelemetry } from "../telemetry";
import { handleBillingWebhook } from "../billingWebhook";

const app = express();
app.disable("x-powered-by");
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
app.get(["/health", "/healthz"], liveness);
app.get("/readyz", async (_req, res) => {
  const checks = {
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    oauthConfigured: Boolean(process.env.OAUTH_SERVER_URL && process.env.VITE_APP_ID && process.env.JWT_SECRET),
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
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
registerStorageProxy(app);
registerOAuthRoutes(app);
app.post("/api/files/upload", async (req, res) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user) return res.status(401).json({ error: "authentication-required" });
    if (!malwareScannerStatus().configured) return res.status(503).json({ error: "upload-scanner-required" });
    return res.status(501).json({ error: "upload-adapter-not-enabled" });
  } catch {
    return res.status(401).json({ error: "authentication-required" });
  }
});
app.post("/api/scheduled/cleanupFileAssets", async (req, res) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user?.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const result = await cleanupExpiredFileAssets();
    return res.status(200).json({ ok: true, taskUid: user.taskUid, ...result });
  } catch {
    return res.status(403).json({ error: "cron-only" });
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
