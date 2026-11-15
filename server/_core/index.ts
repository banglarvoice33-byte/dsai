import "dotenv/config";
import express, { type Request, type Response } from "express";
import { createServer } from "http";
import net from "net";
import crypto from "node:crypto";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { checkDatabaseReady } from "../db";
import { cleanupExpiredFileAssets, getCleanFileAsset, malwareScannerStatus, registerCleanFileAsset, sha256Hex, validateUploadMetadata } from "../fileSecurity";
import { deletePrivateFile, readPrivateFile, scanWithClamAV, storePrivateFile } from "../fileUploadService";
import { sdk } from "./sdk";
import { serveStatic, setupVite } from "./vite";
import { applySecurityHeaders } from "../securityPolicy";
import { createRateLimit } from "../rateLimit";
import { durationMs, emitTelemetry } from "../telemetry";
import { handleBillingWebhook } from "../billingWebhook";
import { ENV } from "./env";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
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
      if (req.path !== "/health" && req.path !== "/healthz" && req.path !== "/readyz") {
        emitTelemetry("http.request.completed", { requestId, method: req.method, route: req.path, statusCode: res.statusCode, durationMs: durationMs(startedAt) });
      }
    });
    next();
  });
  const livenessHandler = (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", service: "dsai", uptimeSeconds: Math.round(process.uptime()) });
  };
  app.get("/health", livenessHandler);
  app.get("/healthz", livenessHandler);
  app.get("/readyz", async (_req, res) => {
    const checks = { databaseConfigured: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL), databaseHandle: false };
    if (checks.databaseConfigured) {
      checks.databaseHandle = await checkDatabaseReady();
    }
    const ready = Object.values(checks).every(Boolean);
    res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready", service: "dsai", checks });
  });
  app.post("/api/billing/webhook", express.raw({ type: "application/json", limit: "256kb" }), async (req, res) => {
    try { await handleBillingWebhook(req, res); } catch (error) { emitTelemetry("billing.webhook.error", { requestId: res.locals.requestId, provider: "stripe-compatible", reason: error instanceof Error ? error.name : "unknown" }); res.status(500).json({ error: "billing_webhook_failed", requestId: res.locals.requestId }); }
  });
  // Configure body parser with larger size limit for file uploads
  // Upload processing is not live in this release; keep request bodies bounded until a validated storage pipeline exists.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use("/api/files", createRateLimit({ windowMs: 60_000, max: 12, keyPrefix: "file-upload" }));
  app.post("/api/files/upload", express.raw({ type: "application/octet-stream", limit: "10mb" }), async (req, res) => {
    let storageKey: string | undefined;
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user) { res.status(401).json({ error: "authentication-required" }); return; }
      if (!Buffer.isBuffer(req.body)) { res.status(415).json({ error: "expected-binary-body" }); return; }
      const originalName = decodeURIComponent(String(req.header("x-file-name") || ""));
      const mimeType = String(req.header("x-file-mime") || "");
      const sha256 = String(req.header("x-file-sha256") || "");
      const data = req.body as Buffer;
      const metadata = validateUploadMetadata({ originalName, mimeType, byteSize: data.length, sha256 });
      if (sha256Hex(data) !== metadata.sha256) { res.status(400).json({ error: "checksum-mismatch" }); return; }
      const zipMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
      const signatureOk =
        (mimeType === "application/pdf" && data.subarray(0, 5).toString() === "%PDF-") ||
        (mimeType === "image/png" && data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ||
        (mimeType === "image/jpeg" && data.subarray(0, 3).equals(Buffer.from([255,216,255]))) ||
        (mimeType === "image/webp" && data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WEBP") ||
        ((mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") && data.subarray(0, 4).equals(zipMagic)) ||
        (["text/plain", "text/csv", "application/json"].includes(mimeType) && !data.includes(0));
      if (!signatureOk) { res.status(415).json({ error: "file-signature-mismatch" }); return; }
      await scanWithClamAV(data);
      storageKey = await storePrivateFile(user.id, metadata.originalName, metadata.mimeType, data);
      const asset = await registerCleanFileAsset({ userId: user.id, ...metadata, storageKey });
      res.status(201).json({ id: asset.id, name: asset.originalName, size: asset.byteSize, status: asset.scanStatus, createdAt: asset.createdAt });
    } catch (error) {
      if (storageKey) await deletePrivateFile(storageKey).catch(() => undefined);
      const message = error instanceof Error ? error.message : "upload failed";
      const status = /Malware detected/.test(message) ? 422 : /not configured|unavailable|timed out|scanner/i.test(message) ? 503 : /File size|Unsupported file|SHA-256|Invalid|signature/i.test(message) ? 400 : 500;
      res.status(status).json({ error: status === 503 ? "scanner-unavailable" : status === 422 ? "malware-detected" : "upload-failed", message, requestId: res.locals.requestId });
    }
  });
  app.get("/api/files/:id/download", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user) { res.status(401).json({ error: "authentication-required" }); return; }
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id < 1) { res.status(400).json({ error: "invalid-file-id" }); return; }
      const asset = await getCleanFileAsset(user.id, id);
      if (!asset) { res.status(404).json({ error: "file-not-found" }); return; }
      const data = await readPrivateFile(asset.storageKey);
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Length", String(data.length));
      res.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodeURIComponent(asset.originalName));
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "private, no-store");
      res.status(200).send(data);
    } catch {
      res.status(500).json({ error: "download-failed", requestId: res.locals.requestId });
    }
  });
  app.post("/api/scheduled/cleanupFileAssets", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user?.isCron || !user.taskUid) {
        res.status(403).json({ error: "cron-only" });
        return;
      }
      const result = await cleanupExpiredFileAssets();
      res.status(200).json({ ok: true, taskUid: user.taskUid, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "retention cleanup failed";
      if (/session cookie|unauthorized|forbidden|cron/i.test(message)) {
        res.status(403).json({ error: "cron-only" });
        return;
      }
      res.status(500).json({ error: message, requestId: res.locals.requestId, timestamp: new Date().toISOString() });
    }
  });
  // Baseline abuse defense. A shared edge limiter remains required for multi-instance production traffic.
  app.use("/api/trpc", createRateLimit({ windowMs: 60_000, max: 120, keyPrefix: "trpc" }));
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  const host = ENV.isPrivateAlpha ? ENV.privateAlphaBind : undefined;
  server.listen(port, host, () => {
    console.log(`Server running on http://localhost:${port}/${ENV.isPrivateAlpha ? " (private Controlled Alpha; loopback only)" : ""}`);
  });
}

startServer().catch(console.error);
