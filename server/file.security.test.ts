import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FILE_MAX_BYTES, FILE_RETENTION_DAYS, fileUploadAvailability, malwareScannerStatus, normalizeUploadName, quarantineStorageKey, validateUploadMetadata } from "./fileSecurity";

const server = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");
const routers = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const storageService = readFileSync(new URL("./fileUploadService.ts", import.meta.url), "utf8");

describe("DSAI file security pipeline", () => {
  it("normalizes names and only accepts bounded, allowlisted metadata", () => {
    expect(normalizeUploadName(" ../report\\final\n.pdf ")).toBe(".._report_final_.pdf");
    expect(() => validateUploadMetadata({ originalName: "x.exe", mimeType: "application/x-msdownload", byteSize: 10, sha256: "a".repeat(64) })).toThrow("Unsupported file type");
    expect(() => validateUploadMetadata({ originalName: "x.pdf", mimeType: "application/pdf", byteSize: FILE_MAX_BYTES + 1, sha256: "a".repeat(64) })).toThrow("safe upload limit");
    expect(() => validateUploadMetadata({ originalName: "x.pdf", mimeType: "application/pdf", byteSize: 10, sha256: "not-a-hash" })).toThrow("SHA-256");
  });

  it("pins R2 to the DSAI bucket and DSAI/<user>/quarantine namespace", () => {
    expect(storageService).toContain('const DSAI_R2_BUCKET = "dsai-user-file"');
    expect(storageService).toContain('const DSAI_R2_PREFIX = "DSAI"');
    expect(storageService).toContain('bucket !== DSAI_R2_BUCKET || prefix !== DSAI_R2_PREFIX');
    expect(storageService).toContain('`DSAI/${userId}/quarantine/');
  });

  it("uses a user quarantine namespace and fail-closed scanner status", () => {
    expect(quarantineStorageKey(42, "নথি.pdf", "nonce123")).toMatch(/^42\/quarantine\//);
    expect(malwareScannerStatus().failClosed).toBe(true);
    expect(["auto", "r2", "supabase"]).toContain(malwareScannerStatus().mode);
    expect(FILE_RETENTION_DAYS).toBeGreaterThan(0);
    expect(routers).toContain("fileUploadAvailability(scanner)");
    const quarantinedOnly = { ...malwareScannerStatus(), configured: false, scannerConfigured: false, storageConfigured: true };
    expect(fileUploadAvailability(quarantinedOnly)).toMatchObject({
      uploadsEnabled: true,
      scannerAvailable: false,
      storageConfigured: true,
      unavailableReason: null,
    });
    const fullyScannable = { ...malwareScannerStatus(), configured: true, scannerConfigured: true, storageConfigured: true };
    expect(fileUploadAvailability(fullyScannable)).toMatchObject({
      uploadsEnabled: true,
      scannerAvailable: true,
      storageConfigured: true,
      unavailableReason: null,
      scanNotice: null,
    });
    const noStorage = { ...malwareScannerStatus(), configured: false, scannerConfigured: false, storageConfigured: false };
    expect(fileUploadAvailability(noStorage).uploadsEnabled).toBe(false);
  });

  it("protects retention cleanup as cron-only and does not accept attacker body identifiers", () => {
    expect(server).toContain('app.post("/api/files/upload/init"');
    expect(server).toContain("registerQuarantinedFileAsset");
    expect(server).toContain("createSignedPrivateUpload");
    expect(server).toContain("markUserFileClean");
    expect(server).toContain('app.get("/api/files/:id/download"');
    expect(server).toContain("scanWithClamAV(data)");
    expect(server).toContain("app.post(\"/api/files/:id/finalize\"");
    expect(server).toContain('app.post("/api/scheduled/cleanupFileAssets"');
    expect(server).toContain('if (!user?.isCron || !user.taskUid)');
    expect(server).toContain("cleanupExpiredFileAssets()");
    expect(server).not.toContain("req.body.fileId");
    expect(server).not.toContain("req.body.userId");
  });
});
