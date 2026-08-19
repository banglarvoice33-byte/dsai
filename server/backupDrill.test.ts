import { describe, expect, it } from "vitest";
import { assessRestoreDrill, validateBackupManifest } from "./backupDrill";

const checksum = "a".repeat(64);

describe("backup restore drill", () => {
  it("accepts an encrypted manifest matching the expected schema", () => {
    const result = validateBackupManifest({ backupId: "backup-1", schemaVersion: "2026-08", createdAt: "2026-08-19T00:00:00.000Z", encrypted: true, tables: [{ name: "users", rowCount: 10, checksum }] }, "2026-08");
    expect(result.ok).toBe(true);
  });
  it("rejects unencrypted or mismatched manifests", () => {
    expect(validateBackupManifest({ backupId: "backup-1", schemaVersion: "old", createdAt: "2026-08-19", encrypted: false, tables: [] }, "2026-08").ok).toBe(false);
  });
  it("reports RTO, RPO, and completeness independently", () => {
    const result = assessRestoreDrill({ startedAtMs: 0, completedAtMs: 900, targetRtoMs: 1000, observedMissingTables: [], targetRpoMinutes: 60, backupAgeMinutes: 30 });
    expect(result).toEqual({ durationMs: 900, rtoPassed: true, rpoPassed: true, complete: true });
  });
});
