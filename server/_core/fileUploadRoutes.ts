import type { Express, Request } from "express";
import crypto from "node:crypto";
import {
  fileUploadAvailability,
  getCleanFileAsset,
  getUserFileAsset,
  deleteUserFileAsset,
  malwareScannerStatus,
  markUserFileClean,
  markUserFileInfected,
  markUserFileRejected,
  registerQuarantinedFileAsset,
  sha256Hex,
  validateUploadMetadata,
  cleanupExpiredFileAssets,
} from "../fileSecurity";
import {
  createSignedPrivateDownload,
  createSignedPrivateUpload,
  deletePrivateFile,
  readPrivateFile,
  scanWithYara,
} from "../fileUploadService";
import { releaseR2StorageUsage } from "../r2Quota";
import { sdk } from "./sdk";
import { createRateLimit } from "../rateLimit";
import { emitTelemetry } from "../telemetry";
import { checkMalwareHashIntelligence, recordYaraScan } from "../malwareHashIntelligence";

/** Register the same authenticated private-file API on Vercel's serverless Express app. */
export function registerFileUploadRoutes(app: Express) {
  function isAuthenticationFailure(error: unknown) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    return /invalid session cookie|invalid or expired (?:supabase access|bearer access) token|authentication required|unauthorized/i.test(message);
  }

  function sendAuthenticationRequired(res: any) {
    return res.status(401).json({
      error: "authentication-required",
      message: "আপনার session মেয়াদোত্তীর্ণ। আবার লগইন করে চেষ্টা করুন।",
      requestId: res.locals.requestId,
    });
  }

  function isSameOriginFileRequest(req: Request) {
    const origin = req.get("origin");
    if (!origin) return req.get("sec-fetch-site") !== "cross-site";
    try {
      const requestHost = req.get("x-forwarded-host")?.split(",")[0]?.trim() || req.get("host");
      return Boolean(requestHost) && new URL(origin).host === requestHost;
    } catch {
      return false;
    }
  }

  app.use("/api/files", createRateLimit({ windowMs: 60_000, max: 12, keyPrefix: "file-upload" }));

  app.post("/api/files/upload/init", async (req, res) => {
    try {
      if (!isSameOriginFileRequest(req)) { res.status(403).json({ error: "cross-origin-request-rejected" }); return; }
      const user = await sdk.authenticateRequest(req);
      if (!user) { res.status(401).json({ error: "authentication-required" }); return; }
      if (!fileUploadAvailability().uploadsEnabled) {
        res.status(503).json({ error: "file-upload-unavailable", message: "নথি যোগ করা বর্তমানে সম্ভব নয়। পরে আবার চেষ্টা করুন।" });
        return;
      }
      const originalName = String(req.body?.originalName || "");
      const mimeType = String(req.body?.mimeType || "");
      const byteSize = Number(req.body?.byteSize);
      const sha256 = String(req.body?.sha256 || "");
      const metadata = validateUploadMetadata({ originalName, mimeType, byteSize, sha256 });
      const extension = metadata.originalName.toLowerCase().split(".").pop();
      const extensions: Record<string, string[]> = {
        "application/pdf": ["pdf"], "text/plain": ["txt"], "text/csv": ["csv"],
        "application/json": ["json"], "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"],
        "image/webp": ["webp"], "application/zip": ["zip"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
      };
      if (!extensions[mimeType]?.includes(extension || "")) { res.status(415).json({ error: "extension-mime-mismatch" }); return; }
      const signed = await createSignedPrivateUpload(user.id, metadata.originalName, metadata.mimeType, metadata.byteSize);
      let asset;
      try {
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
      res.status(201).json({ fileId: asset.id, uploadUrl: signed.uploadUrl, requiredHeaders: signed.provider === "r2" ? { "If-None-Match": "*" } : {}, expiresInSeconds: signed.expiresInSeconds });
    } catch (error) {
      if (isAuthenticationFailure(error)) return sendAuthenticationRequired(res);
      const message = error instanceof Error ? error.message : "upload initialization failed";
      emitTelemetry("files.upload_init_failed", { requestId: res.locals.requestId, reason: error instanceof Error ? error.name : "unknown" });
      res.status(/not configured|Could not create/i.test(message) ? 503 : 400).json({ error: "upload-init-failed", message: "নথি যোগ করা যায়নি। ফাইলের ধরন ও আকার পরীক্ষা করে আবার চেষ্টা করুন।", requestId: res.locals.requestId });
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
      if (asset.scanStatus === "clean") {
        // A previously clean verdict must not bypass the live scanner policy after configuration drift.
        if (!malwareScannerStatus().scannerConfigured) {
          res.status(503).json({
            error: "security-check-pending",
            status: "unavailable",
            message: "নিরাপত্তা যাচাই সেবা বর্তমানে অনুপলব্ধ। নথি ব্যবহার বা ডাউনলোড করা যাবে না।",
          });
          return;
        }
        res.status(200).json({ id, status: "ready" });
        return;
      }
      if (asset.scanStatus !== "quarantined" && asset.scanStatus !== "validated") { res.status(409).json({ error: "file-not-scannable", status: "unavailable" }); return; }
      const data = await readPrivateFile(asset.storageKey);
      if (data.length !== asset.byteSize || sha256Hex(data) !== asset.sha256) {
        await markUserFileRejected(user.id, id, "Uploaded bytes did not match the declared size or SHA-256 checksum");
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
      const hashIntel = await checkMalwareHashIntelligence({ userId: user.id, fileAssetId: id, sha256: asset.sha256 });
      if (hashIntel.blocked) {
        await markUserFileInfected(user.id, id, hashIntel.source === "malwarebazaar" ? "malwarebazaar" : "hash-intel");
        await deletePrivateFile(asset.storageKey);
        if (asset.storageKey.startsWith("r2:")) await releaseR2StorageUsage(asset.byteSize);
        res.status(422).json({ error: "known-malware-hash", source: hashIntel.source });
        return;
      }
      // A hash miss or unavailable reputation service is never a clean verdict.
      // Continue only to the mandatory full-content YARA scan below.
      if (!malwareScannerStatus().scannerConfigured) {
        // Never turn checksum/signature-only validation into a downloadable or AI-processable file.
        // Keep the object in quarantine so a configured scanner can safely retry finalization.
        res.status(503).json({
          error: "security-check-pending",
          status: "pending",
          message: "নথিটি যোগ হয়েছে। নিরাপত্তা যাচাই শেষ হলে এটি ব্যবহার বা ডাউনলোড করা যাবে।",
        });
        return;
      }
      try { await scanWithYara(data); }
      catch (error) {
        if (error instanceof Error && error.message === "Malware detected") {
          await recordYaraScan({ userId: user.id, fileAssetId: id, sha256: asset.sha256, verdict: "malicious" });
          await markUserFileInfected(user.id, id);
          await deletePrivateFile(asset.storageKey);
          if (asset.storageKey.startsWith("r2:")) await releaseR2StorageUsage(asset.byteSize);
          res.status(422).json({ error: "malware-detected" });
          return;
        }
        throw error;
      }
      await recordYaraScan({ userId: user.id, fileAssetId: id, sha256: asset.sha256, verdict: "clean" });
      const clean = await markUserFileClean(user.id, id);
      if (!clean) { res.status(409).json({ error: "file-state-changed" }); return; }
      res.status(200).json({ id, status: "ready" });
    } catch (error) {
      if (isAuthenticationFailure(error)) return sendAuthenticationRequired(res);
      const message = error instanceof Error ? error.message : "file finalization failed";
      emitTelemetry("files.finalize_failed", { requestId: res.locals.requestId, reason: error instanceof Error ? error.name : "unknown" });
      res.status(/scanner|ClamAV|not configured|timed out/i.test(message) ? 503 : 500).json({ error: "security-check-unavailable", message: "নিরাপত্তা যাচাই সম্পন্ন করা যায়নি। পরে আবার চেষ্টা করুন।", requestId: res.locals.requestId });
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
      const signed = await createSignedPrivateDownload(asset.storageKey, asset.originalName);
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.status(200).json(signed);
    } catch (error) {
      if (isAuthenticationFailure(error)) return sendAuthenticationRequired(res);
      emitTelemetry("files.download_failed", {
        requestId: res.locals.requestId,
        reason: error instanceof Error ? error.name : "unknown",
      });
      res.status(500).json({ error: "download-failed", requestId: res.locals.requestId });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      if (!isSameOriginFileRequest(req)) { res.status(403).json({ error: "cross-origin-request-rejected" }); return; }
      const user = await sdk.authenticateRequest(req);
      if (!user) return sendAuthenticationRequired(res);
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id < 1) { res.status(400).json({ error: "invalid-file-id" }); return; }
      const deleted = await deleteUserFileAsset(user.id, id);
      if (!deleted) { res.status(404).json({ error: "file-not-found" }); return; }
      emitTelemetry("files.user_deleted", { requestId: res.locals.requestId, fileId: id });
      res.status(200).json({ ok: true, deleted: true });
    } catch (error) {
      if (isAuthenticationFailure(error)) return sendAuthenticationRequired(res);
      emitTelemetry("files.user_delete_failed", {
        requestId: res.locals.requestId,
        reason: error instanceof Error ? error.name : "unknown",
      });
      res.status(500).json({ error: "file-delete-failed", requestId: res.locals.requestId });
    }
  });

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
      res.status(500).json({ error: message, requestId: res.locals.requestId });
    }
  });
}
