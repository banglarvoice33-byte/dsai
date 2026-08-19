export type MockScanMode = "clean" | "infected" | "error";
export type MockScanResult = { verdict: MockScanMode; provider: "dsai-mock-scanner"; scanId: string; message: string };

export function mockMalwareScan(input: { filename: string; mode: MockScanMode; attempt: number }): MockScanResult {
  const safeName = input.filename.trim().slice(0, 120) || "unnamed-file";
  const mode = input.mode;
  return {
    verdict: mode,
    provider: "dsai-mock-scanner",
    scanId: `mock-${Math.max(1, input.attempt)}-${safeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "file"}`,
    message: mode === "clean" ? "Mock verdict: no threat detected." : mode === "infected" ? "Mock verdict: simulated threat detected; object must remain isolated." : "Mock provider unavailable; retry is required and the file remains quarantined.",
  };
}

export function mockDeleteObject(input: { assetId: number; attempt: number }) {
  return { assetId: input.assetId, provider: "dsai-mock-storage", deleted: true, deletionId: `mock-delete-${input.assetId}-${Math.max(1, input.attempt)}`, message: "Mock object deletion completed; metadata tombstone can be retained." } as const;
}
