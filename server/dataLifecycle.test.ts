import { describe, expect, it } from "vitest";
import { canAdvanceLifecycle, lifecycleEvidenceHash, verifyDeletionEvidence } from "./dataLifecycle";

describe("data lifecycle audit", () => {
  it("allows only explicit lifecycle transitions", () => {
    expect(canAdvanceLifecycle("deletion_requested", "deletion_verified")).toBe(true);
    expect(canAdvanceLifecycle("tombstone_written", "deletion_verified")).toBe(false);
  });
  it("creates deterministic evidence hashes without payload bytes", () => {
    const input = { subjectType: "file", subjectId: "asset-1", action: "tombstone_written" as const, occurredAt: "2026-08-19T00:00:00.000Z" };
    expect(lifecycleEvidenceHash(input)).toBe(lifecycleEvidenceHash(input));
    expect(lifecycleEvidenceHash(input)).toHaveLength(64);
  });
  it("requires both storage and database evidence", () => {
    expect(verifyDeletionEvidence({ storageDeletionConfirmed: true, databaseTombstoneConfirmed: false, lifecycleHash: "hash" }).verified).toBe(false);
    expect(verifyDeletionEvidence({ storageDeletionConfirmed: true, databaseTombstoneConfirmed: true, lifecycleHash: "hash" }).verified).toBe(true);
  });
});
