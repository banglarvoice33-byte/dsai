import crypto from "node:crypto";

export type LifecycleAction = "retention_scheduled" | "retention_expired" | "deletion_requested" | "deletion_verified" | "deletion_failed" | "tombstone_written";

const transitions: Record<LifecycleAction, LifecycleAction[]> = {
  retention_scheduled: ["retention_expired", "deletion_requested"],
  retention_expired: ["deletion_requested", "deletion_failed"],
  deletion_requested: ["deletion_verified", "deletion_failed"],
  deletion_verified: ["tombstone_written"],
  deletion_failed: ["deletion_requested", "deletion_failed"],
  tombstone_written: [],
};

export function lifecycleEvidenceHash(input: { subjectType: string; subjectId: string; action: LifecycleAction; occurredAt: string }) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function canAdvanceLifecycle(from: LifecycleAction, to: LifecycleAction) {
  return transitions[from].includes(to);
}

export function verifyDeletionEvidence(input: { storageDeletionConfirmed: boolean; databaseTombstoneConfirmed: boolean; lifecycleHash?: string }) {
  if (!input.storageDeletionConfirmed || !input.databaseTombstoneConfirmed || !input.lifecycleHash) return { verified: false as const, reason: "deletion-evidence-incomplete" as const };
  return { verified: true as const };
}
