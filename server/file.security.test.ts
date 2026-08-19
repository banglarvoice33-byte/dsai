import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FILE_MAX_BYTES, FILE_RETENTION_DAYS, SCAN_MAX_ATTEMPTS, buildDeletionTombstone, malwareScannerStatus, nextScanJobState, normalizeScanVerdict, normalizeUploadName, quarantineStorageKey, scanRetryDelayMs, validateUploadMetadata } from "./fileSecurity";

const server = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");
const routers = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("DSAI file security pipeline", () => {
  it("normalizes names and only accepts bounded, allowlisted metadata", () => {
    expect(normalizeUploadName(" ../report\\final\n.pdf ")).toBe(".._report_final_.pdf");
    expect(() => validateUploadMetadata({ originalName: "x.exe", mimeType: "application/x-msdownload", byteSize: 10, sha256: "a".repeat(64) })).toThrow("Unsupported file type");
    expect(() => validateUploadMetadata({ originalName: "x.pdf", mimeType: "application/pdf", byteSize: FILE_MAX_BYTES + 1, sha256: "a".repeat(64) })).toThrow("safe upload limit");
    expect(() => validateUploadMetadata({ originalName: "x.pdf", mimeType: "application/pdf", byteSize: 10, sha256: "not-a-hash" })).toThrow("SHA-256");
  });

  it("uses a user quarantine namespace and fail-closed scanner status", () => {
    expect(quarantineStorageKey(42, "নথি.pdf", "nonce123")).toMatch(/^42\/quarantine\//);
    expect(malwareScannerStatus().failClosed).toBe(true);
    expect(malwareScannerStatus().mode).toBe("provider-adapter-required");
    expect(FILE_RETENTION_DAYS).toBeGreaterThan(0);
    expect(routers).toContain("Upload remains disabled until a signed malware-scanner adapter is configured.");
  });

  it("normalizes scanner responses and keeps retry/deletion behavior bounded", () => {
    expect(normalizeScanVerdict({ verdict: "clean", provider: "scanner-a", scanId: "scan-1" })).toEqual({ verdict: "clean", provider: "scanner-a", scanId: "scan-1", message: null });
    expect(normalizeScanVerdict({ verdict: "unknown" }).verdict).toBe("error");
    expect(nextScanJobState("clean", 1)).toBe("succeeded");
    expect(nextScanJobState("infected", 1)).toBe("infected");
    expect(nextScanJobState("error", SCAN_MAX_ATTEMPTS)).toBe("dead_letter");
    expect(scanRetryDelayMs(0)).toBeLessThan(scanRetryDelayMs(1));
    expect(buildDeletionTombstone({ assetId: 9, reason: "retention_expired" }).retryable).toBe(true);
  });

  it("protects retention cleanup as cron-only and does not accept attacker body identifiers", () => {
    expect(server).toContain('app.post("/api/files/upload"');
    expect(server).toContain('error: "upload-scanner-required"');
    expect(server).toContain('app.post("/api/scheduled/cleanupFileAssets"');
    expect(server).toContain('if (!user?.isCron || !user.taskUid)');
    expect(server).toContain("cleanupExpiredFileAssets()");
    expect(server).not.toContain("req.body.fileId");
    expect(server).not.toContain("req.body.userId");
  });
});
