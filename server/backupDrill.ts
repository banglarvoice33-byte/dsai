import crypto from "node:crypto";

export type BackupManifest = { backupId: string; schemaVersion: string; createdAt: string; tables: Array<{ name: string; rowCount: number; checksum: string }>; encrypted: boolean };

export function manifestDigest(manifest: BackupManifest) {
  return crypto.createHash("sha256").update(JSON.stringify(manifest)).digest("hex");
}

export function validateBackupManifest(manifest: BackupManifest, expectedSchemaVersion: string) {
  if (!manifest.backupId || !manifest.createdAt || manifest.schemaVersion !== expectedSchemaVersion) return { ok: false as const, reason: "manifest-version-or-identity-mismatch" as const };
  if (!manifest.encrypted || !manifest.tables.length || manifest.tables.some(table => !table.name || table.rowCount < 0 || !/^[a-f0-9]{64}$/i.test(table.checksum))) return { ok: false as const, reason: "manifest-integrity-invalid" as const };
  return { ok: true as const, digest: manifestDigest(manifest) };
}

export function assessRestoreDrill(input: { startedAtMs: number; completedAtMs: number; targetRtoMs: number; observedMissingTables: string[]; targetRpoMinutes: number; backupAgeMinutes: number }) {
  const durationMs = Math.max(0, input.completedAtMs - input.startedAtMs);
  return { durationMs, rtoPassed: durationMs <= input.targetRtoMs, rpoPassed: input.backupAgeMinutes <= input.targetRpoMinutes, complete: input.observedMissingTables.length === 0 };
}
