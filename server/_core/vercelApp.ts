import "dotenv/config";
import express from "express";
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
import { applySecurityHeaders } from "../securityPolicy";
import { createRateLimit } from "../rateLimit";
import { durationMs, emitTelemetry } from "../telemetry";
import { handleBillingWebhook } from "../billingWebhook";

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
// Vercel overwrites X-Forwarded-For; trust the single platform proxy so req.ip is the client IP.
app.set("trust proxy", 1);
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
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
registerStorageProxy(app);
registerOAuthRoutes(app);
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
        "image/webp": ["webp"],
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
      if (asset.scanStatus !== "quarantined") { res.status(409).json({ error: "file-not-scannable", status: asset.scanStatus }); return; }
      const data = await readPrivateFile(asset.storageKey);
      if (data.length !== asset.byteSize || sha256Hex(data) !== asset.sha256) {
        await markUserFileRejected(user.id, id, "Uploaded bytes did not match the declared size or SHA-256 checksum");
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
        (["text/plain", "text/csv", "application/json"].includes(mime) && !data.includes(0));
      if (!signatureOk) {
        await markUserFileRejected(user.id, id, "File signature did not match the declared media type");
        await deletePrivateFile(asset.storageKey);
        res.status(415).json({ error: "file-signature-mismatch" });
        return;
      }
      // Accept a private quarantined upload even when no scanner host exists yet.
      // The asset remains unavailable to downloads and downstream processing until ClamAV is configured.
      if (!malwareScannerStatus().scannerConfigured) {
        res.status(202).json({ id, status: "quarantined", scanStatus: "pending", message: "Upload received in private quarantine; download remains locked until malware scanning is configured." });
        return;
      }
      try { await scanWithClamAV(data); }
      catch (error) {
        if (error instanceof Error && error.message === "Malware detected") {
          await markUserFileInfected(user.id, id);
          await deletePrivateFile(asset.storageKey);
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
