/**
 * Derive an honest release status from persisted gate counts.
 * Missing or unclassified evidence is never interpreted as a successful release.
 */
export type ReleaseGateStatus = {
  label: string;
  tone: "good" | "warn" | "bad" | "neutral";
};

export function getReleaseGateStatus(counts: {
  total: number;
  passed: number;
  failed: number;
  pending: number;
}): ReleaseGateStatus {
  const { total, passed, failed, pending } = counts;

  if (failed > 0) {
    return { label: "Release gate failure recorded", tone: "bad" };
  }
  if (pending > 0) {
    return { label: "Pending release gates", tone: "warn" };
  }
  if (total === 0) {
    return { label: "No release-gate evidence recorded", tone: "warn" };
  }
  if (passed + failed + pending !== total) {
    return { label: "Release-gate evidence is incomplete", tone: "warn" };
  }
  if (passed === total) {
    return { label: "All recorded release gates passed", tone: "good" };
  }

  return { label: "Release-gate status incomplete", tone: "warn" };
}
