import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FILE_MAX_BYTES, FILE_RETENTION_DAYS, fileUploadAvailability, malwareScannerStatus, normalizeUploadName, quarantineStorageKey, validateUploadMetadata } from "./fileSecurity";
import { DSAI_R2_LIMITS } from "./r2Quota";

const server = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");
const routers = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const storageService = readFileSync(new URL("./fileUploadService.ts", import.meta.url), "utf8");
const vercelConfig = readFileSync(new URL("../vercel.json", import.meta.url), "utf8");
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

  it("registers the authenticated file routes on the actual Vercel production entrypoint", () => {
    expect(vercelApp).toContain('import { registerFileUploadRoutes } from "./fileUploadRoutes"');
    expect(vercelApp).toContain("registerFileUploadRoutes(app)");
    expect(vercelApp.indexOf("registerFileUploadRoutes(app)")).toBeLessThan(vercelApp.indexOf('app.use("/api/trpc"'));
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
    expect(fileUploadPanel).toContain('file.scanStatus === "clean" && <Button');
    expect(fileUploadPanel).not.toContain('(file.scanStatus === "clean" || file.scanStatus === "validated")');
    expect(fileUploadPanel).toContain('file.scanStatus === "validated") && policy.data?.scannerAvailable');

  });

  it("releases R2 retention quota atomically with expired-file metadata deletion", () => {
    const cleanup = securitySource.slice(securitySource.indexOf("export async function cleanupExpiredFileAssets"));
    expect(cleanup).toContain("db.transaction(async tx =>");
    expect(cleanup).toContain("public.dsai_r2_release_storage");
    expect(cleanup).not.toContain("releaseR2StorageUsage(asset.byteSize)");
  });

  it("protects retention cleanup as cron-only and does not accept attacker body identifiers", () => {
    expect(server).toContain('app.post("/api/files/upload/init"');
    expect(server).toContain("registerQuarantinedFileAsset");
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
    expect(vercelFileRoutes).toContain('antivirus-scanner-unavailable');
    expect(vercelFileRoutes).not.toContain('markUserFileValidated');
    expect(vercelFileRoutes).toContain('asset.scanStatus !== "quarantined" && asset.scanStatus !== "validated"');
    expect(server).toContain("createSignedPrivateUpload");
    expect(server).toContain("markUserFileClean");
    expect(server).toContain('app.get("/api/files/:id/download"');
    expect(server).toContain("createSignedPrivateDownload(asset.storageKey, asset.originalName)");
    expect(server).toContain("res.status(200).json(signed)");
    expect(storageService).toContain("ResponseContentDisposition: disposition");
    expect(storageService).toContain("expiresIn: expiresInSeconds");
    // Match the path fragment rather than requiring quote placement around a template literal.
    expect(storageService).toContain("/storage/v1/object/sign/");
    expect(storageService).toContain('downloadUrl.searchParams.set("download", safeName)');
    expect(server).not.toContain("res.status(200).send(data)");
    expect(server).toContain("scanWithClamAV(data)");
    expect(vercelFileRoutes).not.toContain("markUserFileValidated(user.id, id)");
    expect(server).toContain('mime === "application/zip"');
    expect(server).toContain("app.post(\"/api/files/:id/finalize\"");
    expect(server).toContain('app.get("/api/scheduled/cleanupFileAssets"');
    expect(server).toContain("req.headers.authorization !== `Bearer ${cronSecret}`");
    expect(vercelConfig).toContain('"path": "/api/scheduled/cleanupFileAssets"');
    expect(vercelConfig).toContain('"schedule": "0 3 * * *"');
    expect(server).toContain('app.post("/api/scheduled/cleanupFileAssets"');
    expect(server).toContain("if (!user?.isCron || !user.taskUid)");
    expect(server).toContain("cleanupExpiredFileAssets()");
    expect(server).not.toContain("req.body.fileId");
    expect(server).not.toContain("req.body.userId");
  });
});
