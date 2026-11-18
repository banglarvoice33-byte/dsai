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
import { cleanupExpiredFileAssets, fileUploadAvailability, getCleanFileAsset, getUserFileAsset, malwareScannerStatus, markUserFileClean, markUserFileInfected, markUserFileRejected, registerQuarantinedFileAsset, sha256Hex, validateUploadMetadata } from "../fileSecurity";
import { createSignedPrivateDownload, createSignedPrivateUpload, deletePrivateFile, readPrivateFile, scanWithClamAV } from "../fileUploadService";
import { releaseR2StorageUsage } from "../r2Quota";
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
  // Keep upload control-plane metadata bounded; file bytes go directly to private object storage.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // Vercel routes this project through the single /api catch-all function. In the
  // deployed Express adapter, the function mount prefix is stripped from req.url.
  // Restore the canonical /api prefix for these explicit REST routes before rate
  // limiting and route matching; local Express paths already containing /api are
  // left untouched. Without this, Production returns 404 for uploads and cron.
  app.use((req, _res, next) => {
    if (
      req.path.startsWith("/files/") ||
      req.path === "/scheduled/cleanupFileAssets"
    ) {
      req.url = `/api${req.url}`;
    }
    next();
  });
  app.use("/api/files", createRateLimit({ windowMs: 60_000, max: 12, keyPrefix: "file-upload" }));
  // Small authenticated control-plane call; file bytes travel directly to Supabase Storage
  // so Vercel's 4.5 MB Function payload cap is not on the upload data path.
  app.post("/api/files/upload/init", async (req, res) => {
    try {
      if (!isSameOriginFileRequest(req)) { res.status(403).json({ error: "cross-origin-request-rejected" }); return; }
      const user = await sdk.authenticateRequest(req);
      if (!user) { res.status(401).json({ error: "authentication-required" }); return; }
      if (!fileUploadAvailability().uploadsEnabled) { res.status(503).json({ error: "private-storage-not-configured", message: "Configure private Supabase Storage or Cloudflare R2 credentials before uploading." }); return; }
      const originalName = String(req["body"]?.originalName || "");
      const mimeType = String(req["body"]?.mimeType || "");
      const byteSize = Number(req["body"]?.byteSize);
      const sha256 = String(req["body"]?.sha256 || "");
      const metadata = validateUploadMetadata({ originalName, mimeType, byteSize, sha256 });
      const extension = metadata.originalName.toLowerCase().split(".").pop();
      const extensions = {
        "application/pdf": ["pdf"], "text/plain": ["txt"], "text/csv": ["csv"],
        "application/json": ["json"], "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"],
        "image/webp": ["webp"], "application/zip": ["zip"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
      } as Record<string, string[]>;
      if (!extensions[mimeType]?.includes(extension || "")) { res.status(415).json({ error: "extension-mime-mismatch" }); return; }
      const signed = await createSignedPrivateUpload(user.id, metadata.originalName, metadata.mimeType, metadata.byteSize);
      let asset;
      try {
        // Persist the owner-scoped quarantine record before returning the signed capability.
        // If persistence fails, the capability never reaches the browser and the reserved
        // object path is deleted; R2 byte quota is released only after successful deletion.
        asset = await registerQuarantinedFileAsset({ userId: user.id, ...metadata, storageKey: signed.objectKey });
      } catch (registrationError) {
        try {
          await deletePrivateFile(signed.objectKey);
          if (signed.provider === "r2") await releaseR2StorageUsage(metadata.byteSize);
        } catch (cleanupError) {
          emitTelemetry("files.upload_init_compensation_failed", {
            requestId: res.locals.requestId,
            provider: signed.provider,
            reason: cleanupError instanceof Error ? cleanupError.name : "unknown",
          });
        }
        throw registrationError;
      }
      res.status(201).json({ fileId: asset.id, uploadUrl: signed.uploadUrl, storageProvider: signed.provider, expiresInSeconds: signed.expiresInSeconds });
    } catch (error) {
      const message = error instanceof Error ? error.message : "upload initialization failed";
      res.status(/not configured|Could not create/i.test(message) ? 503 : 400).json({ error: "upload-init-failed", message });
    }
  });
  app.post("/api/files/:id/finalize", async (req, res) => {
    try {
      if (!isSameOriginFileRequest(req)) { res.status(403).json({ error: "cross-origin-request-rejected" }); return; }
      const user = await sdk.authenticateRequest(req);
      if (!user) { res.status(401).json({ error: "authentication-required" }); return; }
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id < 1) { res.status(400).json({ error: "invalid-file-id" }); return; }
      const asset = await getUserFileAsset(user.id, id);
      if (!asset) { res.status(404).json({ error: "file-not-found" }); return; }
      if (asset.scanStatus === "clean") { res.status(200).json({ id, status: "clean" }); return; }
      if (asset.scanStatus !== "quarantined" && asset.scanStatus !== "validated") { res.status(409).json({ error: "file-not-scannable", status: asset.scanStatus }); return; }
      const data = await readPrivateFile(asset.storageKey);
      if (data.length !== asset.byteSize || sha256Hex(data) !== asset.sha256) {
        await markUserFileRejected(user.id, id, "Uploaded bytes did not match the declared size or SHA-256 checksum");
        // Remove rejected bytes before releasing the reserved R2 storage quota.
        await deletePrivateFile(asset.storageKey);
        if (asset.storageKey.startsWith("r2:")) await releaseR2StorageUsage(asset.byteSize);
        res.status(422).json({ error: "uploaded-content-mismatch" });
        return;
      }
      const mime = asset.mimeType;
      const zipMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
      const signatureOk =
        (mime === "application/pdf" && data.subarray(0, 5).toString() === "%PDF-") ||
        (mime === "image/png" && data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ||
        (mime === "image/jpeg" && data.subarray(0, 3).equals(Buffer.from([255,216,255]))) ||
        (mime === "image/webp" && data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WEBP") ||
        ((mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") && data.subarray(0, 4).equals(zipMagic)) ||
        (mime === "application/zip" && [zipMagic, Buffer.from([0x50,0x4b,0x05,0x06]), Buffer.from([0x50,0x4b,0x07,0x08])].some(signature => data.subarray(0, 4).equals(signature))) ||
        (["text/plain", "text/csv", "application/json"].includes(mime) && !data.includes(0));
      if (!signatureOk) {
        await markUserFileRejected(user.id, id, "File signature did not match the declared media type");
        await deletePrivateFile(asset.storageKey);
        if (asset.storageKey.startsWith("r2:")) await releaseR2StorageUsage(asset.byteSize);
        res.status(415).json({ error: "file-signature-mismatch" });
        return;
      }
      if (!malwareScannerStatus().scannerConfigured) {
        // Never turn checksum/signature-only validation into a downloadable or AI-processable file.
        // Keep the object in quarantine so a configured scanner can safely retry finalization.
        res.status(503).json({
          error: "antivirus-scanner-unavailable",
          status: asset.scanStatus,
          antivirusScanned: false,
          message: "ফাইলটি private quarantine-এ রাখা হয়েছে। Malware scanner চালু না হওয়া পর্যন্ত download বা AI processing করা যাবে না।",
        });
        return;
      }
      try { await scanWithClamAV(data); }
      catch (error) {
        if (error instanceof Error && error.message === "Malware detected") {
          await markUserFileInfected(user.id, id);
          await deletePrivateFile(asset.storageKey);
          if (asset.storageKey.startsWith("r2:")) await releaseR2StorageUsage(asset.byteSize);
          res.status(422).json({ error: "malware-detected" });
          return;
        }
        throw error;
      }
      const clean = await markUserFileClean(user.id, id);
      if (!clean) { res.status(409).json({ error: "file-state-changed" }); return; }
      res.status(200).json({ id, status: "clean", scanProvider: "clamav" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "file finalization failed";
      res.status(/scanner|ClamAV|not configured|timed out/i.test(message) ? 503 : 500).json({ error: "file-finalize-failed", message, requestId: res.locals.requestId });
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
      // Keep file bytes off the Vercel Function response path (4.5 MB payload cap).
      // The object remains private; this URL is short-lived and scoped to one object.
      const signed = await createSignedPrivateDownload(asset.storageKey, asset.originalName);
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.status(200).json(signed);
    } catch {
      res.status(500).json({ error: "download-failed", requestId: res.locals.requestId });
    }
  });
  // Vercel Cron invokes GET on Production only. Keep the legacy authenticated POST scheduler route below for compatibility.
  app.get("/api/scheduled/cleanupFileAssets", async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
      res.status(401).json({ error: "cron-authorization-required" });
      return;
    }
    try {
      const result = await cleanupExpiredFileAssets();
      res.status(200).json({ ok: true, scheduler: "vercel-cron", ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "retention cleanup failed";
      res.status(500).json({ error: message, requestId: res.locals.requestId, timestamp: new Date().toISOString() });
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
