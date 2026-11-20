import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FILE_MAX_BYTES, FILE_RETENTION_DAYS, fileUploadAvailability, malwareScannerStatus, normalizeUploadName, quarantineStorageKey, toUserFileAssetView, validateUploadMetadata } from "./fileSecurity";
import { DSAI_R2_LIMITS } from "./r2Quota";

const server = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");
const vercelServer = readFileSync(new URL("./_core/vercelApp.ts", import.meta.url), "utf8");
const routers = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const storageService = readFileSync(new URL("./fileUploadService.ts", import.meta.url), "utf8");
const vercelConfig = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as { crons?: Array<{ path: string; schedule: string }> };
const securitySource = readFileSync(new URL("./fileSecurity.ts", import.meta.url), "utf8");
const vercelFileRoutes = readFileSync(new URL("./_core/fileUploadRoutes.ts", import.meta.url), "utf8");
const vercelApp = readFileSync(new URL("./_core/vercelApp.ts", import.meta.url), "utf8");
const fileUploadPanel = readFileSync(new URL("../client/src/components/FileUploadPanel.tsx", import.meta.url), "utf8");
const restrictiveRlsMigration = readFileSync(new URL("../supabase/migrations/20261116003434_dsai_restrictive_server_only_rls_policies.sql", import.meta.url), "utf8");
const quarantineConstraintMigration = readFileSync(new URL("../supabase/migrations/20261116004016_dsai_disallow_unscanned_validated_files.sql", import.meta.url), "utf8");

describe("DSAI file security pipeline", () => {
  it("forbids checksum-only validated state at the database boundary", () => {
    expect(quarantineConstraintMigration).toContain('CHECK ("scanStatus" <> \'validated\')');
    expect(securitySource).not.toContain("markUserFileValidated");
    expect(vercelFileRoutes).not.toContain("markUserFileValidated");
  });

  it("keeps the server-only Data API guard restrictive across all live public tables", () => {
    expect((restrictiveRlsMigration.match(/CREATE POLICY dsai_server_only_deny_direct_client_access/g) ?? []).length).toBe(27);
    expect((restrictiveRlsMigration.match(/DROP POLICY IF EXISTS dsai_server_only_deny_direct_client_access/g) ?? []).length).toBe(27);
    expect(restrictiveRlsMigration).toContain("AS RESTRICTIVE FOR ALL TO anon, authenticated");
    expect(restrictiveRlsMigration).toContain("USING (false) WITH CHECK (false)");
    expect(restrictiveRlsMigration).not.toContain("AS PERMISSIVE");
  });

  it("normalizes names and only accepts bounded, allowlisted metadata", () => {
    expect(normalizeUploadName(" ../report\\final\n.pdf ")).toBe(".._report_final_.pdf");
    expect(() => validateUploadMetadata({ originalName: "x.exe", mimeType: "application/x-msdownload", byteSize: 10, sha256: "a".repeat(64) })).toThrow("Unsupported file type");
    expect(() => validateUploadMetadata({ originalName: "x.pdf", mimeType: "application/pdf", byteSize: FILE_MAX_BYTES + 1, sha256: "a".repeat(64) })).toThrow("safe upload limit");
    expect(() => validateUploadMetadata({ originalName: "x.pdf", mimeType: "application/pdf", byteSize: 10, sha256: "not-a-hash" })).toThrow("SHA-256");
    expect(validateUploadMetadata({ originalName: "archive.zip", mimeType: "application/zip", byteSize: 10, sha256: "a".repeat(64) }).mimeType).toBe("application/zip");
  });

  it("enforces less than half of the published R2 free allowance with atomic counters", () => {
    expect(DSAI_R2_LIMITS.storedBytes).toBe(4_500_000_000);
    expect(DSAI_R2_LIMITS.classA).toBe(450_000);
    expect(DSAI_R2_LIMITS.classB).toBe(4_500_000);
    expect(storageService).toContain('reserveR2Usage("class_a"');
    expect(storageService).toContain('reserveR2Usage("stored_bytes"');
    expect(storageService).toContain('reserveR2Usage("class_b"');
    expect(storageService).toContain('IfNoneMatch: "*"');
  });

  it("pins R2 to the DSAI bucket and DSAI/<user>/quarantine namespace", () => {
    expect(storageService).toContain('const DSAI_R2_BUCKET = "dsai-user-file"');
    expect(storageService).toContain('const DSAI_R2_PREFIX = "DSAI"');
    expect(storageService).toContain('bucket !== DSAI_R2_BUCKET || prefix !== DSAI_R2_PREFIX');
    expect(storageService).toContain('`${DSAI_R2_PREFIX}/${userId}/quarantine/');
  });

  it("uses a user quarantine namespace and fail-closed scanner status", () => {
    expect(quarantineStorageKey(42, "নথি.pdf", "nonce123")).toContain("42/quarantine/");
    expect(malwareScannerStatus().failClosed).toBe(true);
    expect(["auto", "r2", "supabase"]).toContain(malwareScannerStatus().mode);
    expect(FILE_RETENTION_DAYS).toBeGreaterThan(0);
    expect(routers).toContain("fileUploadAvailability(scanner)");
    const quarantinedOnly = { ...malwareScannerStatus(), configured: false, scannerConfigured: false, storageConfigured: true };
    expect(fileUploadAvailability(quarantinedOnly)).toMatchObject({
      uploadsEnabled: false,
      scannerAvailable: false,
      unavailableReason: "নিরাপত্তা যাচাই ব্যবস্থা প্রস্তুত নয়। নিরাপদ স্ক্যানার চালু হলে নথি যোগ করা যাবে।",
    });
    expect(fileUploadAvailability(quarantinedOnly)).not.toHaveProperty("storageConfigured");
    expect(fileUploadAvailability(quarantinedOnly)).not.toHaveProperty("storageProvider");
    expect(fileUploadAvailability(quarantinedOnly).scanNotice).toBeNull();
    const fullyScannable = { ...malwareScannerStatus(), configured: true, scannerConfigured: true, storageConfigured: true };
    expect(fileUploadAvailability(fullyScannable)).toMatchObject({
      uploadsEnabled: true,
      scannerAvailable: true,
      unavailableReason: null,
      scanNotice: "নথি ব্যবহারের আগে নিরাপত্তা যাচাই বাধ্যতামূলক।",
    });
    const noStorage = { ...malwareScannerStatus(), configured: false, scannerConfigured: false, storageConfigured: false };
    expect(fileUploadAvailability(noStorage)).toMatchObject({
      uploadsEnabled: false,
      scannerAvailable: false,
      unavailableReason: "নথি সংরক্ষণের ব্যবস্থা প্রস্তুত নয়। পরে আবার চেষ্টা করুন।",
    });
  });

  it("registers the authenticated file routes on the actual Vercel production entrypoint", () => {
    expect(vercelApp).toContain('import { registerFileUploadRoutes } from "./fileUploadRoutes"');
    expect(vercelApp).toContain("registerFileUploadRoutes(app)");
    expect(vercelApp.indexOf("registerFileUploadRoutes(app)")).toBeLessThan(vercelApp.indexOf('app.use("/api/trpc"'));
  });

  it("returns only a user-safe file view without ownership, storage or scanner internals", () => {
    const expires = new Date("2026-12-01T00:00:00.000Z");
    const asset = {
      id: 7,
      originalName: "report.pdf",
      mimeType: "application/pdf",
      byteSize: 128,
      scanStatus: "clean" as const,
      retentionExpiresAt: expires,
      userId: 42,
      storageKey: "r2:DSAI/42/quarantine/report.pdf",
      sha256: "a".repeat(64),
      scanProvider: "clamav",
      scanMessage: "clean",
    };
    const view = toUserFileAssetView(asset);
    expect(view).toEqual({
      id: 7,
      originalName: "report.pdf",
      mimeType: "application/pdf",
      byteSize: 128,
      status: "ready",
      retentionExpiresAt: expires,
    });
    expect(toUserFileAssetView({ id: 8, originalName: "pending.pdf", mimeType: "application/pdf", byteSize: 128, scanStatus: "quarantined", retentionExpiresAt: expires }).status).toBe("pending");
    expect(toUserFileAssetView({ id: 9, originalName: "blocked.pdf", mimeType: "application/pdf", byteSize: 128, scanStatus: "infected", retentionExpiresAt: expires }).status).toBe("unavailable");
  });

  it("supports owner-scoped self-service deletion and transparent retention", () => {
    expect(vercelFileRoutes).toContain('app.delete("/api/files/:id"');
    expect(vercelFileRoutes).toContain("deleteUserFileAsset(user.id, id)");
    expect(securitySource).toContain("eq(fileAssets.id, id), eq(fileAssets.userId, userId)");
    expect(securitySource).toContain("await deletePrivateFile(asset.storageKey)");
    expect(securitySource).toContain("public.dsai_r2_release_storage");
    expect(fileUploadPanel).toContain('method: "DELETE"');
    expect(fileUploadPanel).toContain("retentionExpiresAt.toLocaleDateString");
    expect(fileUploadPanel).toContain("window.confirm");
    expect(fileUploadPanel).toContain("policy.data.unavailableReason");
    expect(fileUploadPanel).toContain("{policy.data.scanNotice}");
    expect(fileUploadPanel).toContain('file.status === "ready" && <Button');
    expect(fileUploadPanel).not.toContain('(file.scanStatus === "clean" || file.scanStatus === "validated")');
    expect(fileUploadPanel).toContain('file.status === "pending" && policy.data?.scannerAvailable');
    expect(fileUploadPanel).not.toContain("file.scanStatus");
    expect(fileUploadPanel).not.toContain("storageProvider");

  });

  it("releases R2 retention quota atomically with expired-file metadata deletion", () => {
    const cleanup = securitySource.slice(securitySource.indexOf("export async function cleanupExpiredFileAssets"));
    expect(cleanup).toContain("db.transaction(async tx =>");
    expect(cleanup).toContain("public.dsai_r2_release_storage");
    expect(cleanup).not.toContain("releaseR2StorageUsage(asset.byteSize)");
  });

  it("releases R2 retention quota atomically with expired-file metadata deletion", () => {
    const cleanup = securitySource.slice(securitySource.indexOf("export async function cleanupExpiredFileAssets"));
    expect(cleanup).toContain("db.transaction(async tx =>");
    expect(cleanup).toContain("public.dsai_r2_release_storage");
    expect(cleanup).not.toContain("releaseR2StorageUsage(asset.byteSize)");
  });

  it("registers the full authenticated upload pipeline in both Node and Vercel runtimes", () => {
    expect(vercelServer).toContain("registerFileUploadRoutes(app)");
    for (const runtime of [server, vercelFileRoutes]) {
      expect(runtime).toContain('app.post("/api/files/upload/init"');
      expect(runtime).toContain('app.post("/api/files/:id/finalize"');
      expect(runtime).toContain('app.get("/api/files/:id/download"');
      expect(runtime).toContain("createSignedPrivateUpload");
      expect(runtime).toContain("createSignedPrivateDownload");
      expect(runtime).toContain("registerQuarantinedFileAsset");
      expect(runtime).toContain("getCleanFileAsset(user.id, id)");
      expect(runtime).toContain("isSameOriginFileRequest");
      expect(runtime).toContain("scanWithClamAV(data)");
    }
    expect(vercelServer).not.toContain('app.post("/api/files/upload",');
    expect(vercelFileRoutes).toContain('app.use("/api/files", createRateLimit');
    expect(vercelFileRoutes).toContain('app.get("/api/scheduled/cleanupFileAssets"');
  });

  it("protects upload ownership, validation, quota, and retention cleanup", () => {
    expect(server).toContain("await deletePrivateFile(signed.objectKey)");
    expect(server).toContain("releaseR2StorageUsage(metadata.byteSize)");
    expect(server).toContain("await markUserFileRejected(user.id, id");
    expect(server).toContain("uploaded-content-mismatch");
    expect(server).toContain('if (asset.storageKey.startsWith("r2:")) await releaseR2StorageUsage(asset.byteSize);');
    expect(server).toContain("file-signature-mismatch");
    expect(securitySource).toContain('scanStatus: "error"');
    expect(server).toContain("markUserFileRejected(user.id, id");
    expect(securitySource).toContain('eq(fileAssets.scanStatus, "clean")');
    expect(securitySource).not.toContain('or(eq(fileAssets.scanStatus, "clean"), eq(fileAssets.scanStatus, "validated"))');
    expect(vercelFileRoutes).toContain('security-check-pending');
    expect(vercelFileRoutes).not.toContain("private Supabase Storage");
    expect(vercelFileRoutes).not.toContain("Cloudflare R2");
    expect(vercelFileRoutes).not.toContain("ClamAV antivirus scanner যুক্ত নেই");
    expect(vercelFileRoutes).not.toContain('storageProvider: signed.provider');
    expect(vercelFileRoutes).not.toContain('scanProvider: "clamav"');
    expect(routers).toContain("map(toUserFileAssetView)");
    expect(routers).not.toContain("        scanner,");
    expect(vercelFileRoutes).not.toContain('markUserFileValidated');
    expect(vercelFileRoutes).toContain('asset.scanStatus !== "quarantined" && asset.scanStatus !== "validated"');
    expect(server).toContain("createSignedPrivateUpload");
    expect(server).toContain("markUserFileClean");
    expect(server).toContain('app.get("/api/files/:id/download"');
    expect(server).toContain("createSignedPrivateDownload(asset.storageKey, asset.originalName)");
    expect(server).toContain("res.status(200).json(signed)");
    expect(storageService).toContain("ResponseContentDisposition: disposition");
    expect(storageService).toContain("expiresIn: expiresInSeconds");
    expect(storageService).toContain("/storage/v1/object/sign/");
    expect(storageService).toContain('downloadUrl.searchParams.set("download", safeName)');
    expect(server).not.toContain("res.status(200).send(data)");
    expect(server).toContain("scanWithClamAV(data)");
    expect(vercelFileRoutes).not.toContain("markUserFileValidated(user.id, id)");
    expect(server).toContain('mime === "application/zip"');
    expect(server).toContain("app.post(\"/api/files/:id/finalize\"");
    expect(server).toContain('app.get("/api/scheduled/cleanupFileAssets"');
    expect(server).toContain("req.headers.authorization !== `Bearer ${cronSecret}`");
    expect(vercelConfig.crons).toContainEqual({ path: "/api/scheduled/cleanupFileAssets", schedule: "0 3 * * *" });
    expect(server).toContain('app.post("/api/scheduled/cleanupFileAssets"');
    expect(server).toContain("if (!user?.isCron || !user.taskUid)");
    expect(server).toContain("cleanupExpiredFileAssets()");
    expect(server).not.toContain("req.body.fileId");
    expect(server).not.toContain("req.body.userId");
    // Production deploys the Vercel adapter, not the long-running Node entrypoint.
    // Guard against regressions where upload handlers exist only in index.ts.
    expect(vercelFileRoutes).toContain('app.post("/api/files/upload/init"');
    expect(vercelFileRoutes).toContain('app.post("/api/files/:id/finalize"');
    expect(vercelFileRoutes).toContain('app.get("/api/files/:id/download"');
    expect(vercelFileRoutes).toContain("registerQuarantinedFileAsset");
    expect(vercelFileRoutes).toContain("createSignedPrivateDownload(asset.storageKey, asset.originalName)");
    expect(vercelFileRoutes).toContain("if (!malwareScannerStatus().scannerConfigured)");
    expect(vercelFileRoutes).toContain('app.get("/api/scheduled/cleanupFileAssets"');
    expect(vercelFileRoutes).toContain("req.headers.authorization !== `Bearer ${cronSecret}`");
    expect(vercelFileRoutes).not.toContain('app.post("/api/files/upload",');
  });
});
