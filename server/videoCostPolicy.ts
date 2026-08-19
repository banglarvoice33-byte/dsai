import crypto from "node:crypto";

export type VideoJobTier = "preview" | "standard" | "pro";
export type VideoJobInput = { mode: "text-to-video" | "image-to-video"; prompt: string; durationSeconds: number; width: number; height: number; audio: boolean; sourceChecksum?: string };

const TIER_LIMITS: Record<VideoJobTier, { maxSeconds: number; maxPixels: number; maxConcurrent: number; retryLimit: number; label: string }> = {
  preview: { maxSeconds: 4, maxPixels: 640 * 360, maxConcurrent: 1, retryLimit: 1, label: "low-resolution preview; no public/commercial release" },
  standard: { maxSeconds: 12, maxPixels: 1280 * 720, maxConcurrent: 2, retryLimit: 2, label: "bounded draft; human review required" },
  pro: { maxSeconds: 30, maxPixels: 1920 * 1080, maxConcurrent: 1, retryLimit: 2, label: "provider quota and billing required" },
};

export function buildVideoCacheKey(input: VideoJobInput, tier: VideoJobTier) {
  return crypto.createHash("sha256").update(JSON.stringify({ ...input, prompt: input.prompt.normalize("NFKC").trim(), tier })).digest("hex");
}

export function estimateVideoCostUnits(input: VideoJobInput, tier: VideoJobTier) {
  const limits = TIER_LIMITS[tier];
  const pixelFactor = Math.max(1, (input.width * input.height) / (640 * 360));
  const audioFactor = input.audio ? 1.25 : 1;
  return Math.ceil(Math.max(1, input.durationSeconds) * pixelFactor * audioFactor * (tier === "preview" ? 0.25 : tier === "pro" ? 2 : 1));
}

export function validateVideoJob(input: VideoJobInput, tier: VideoJobTier) {
  const limits = TIER_LIMITS[tier];
  const reasons: string[] = [];
  if (input.durationSeconds < 1 || input.durationSeconds > limits.maxSeconds) reasons.push("duration-budget");
  if (input.width * input.height > limits.maxPixels) reasons.push("resolution-budget");
  if (!input.prompt.trim()) reasons.push("prompt-required");
  if (input.mode === "image-to-video" && !input.sourceChecksum) reasons.push("source-checksum-required");
  if (input.audio && tier === "preview") reasons.push("audio-disabled-in-free-preview");
  return { ok: reasons.length === 0, reasons, tier, policyLabel: limits.label, estimatedCostUnits: estimateVideoCostUnits(input, tier), cacheKey: buildVideoCacheKey(input, tier), retryLimit: limits.retryLimit } as const;
}

export function chooseBatchPolicy(queueLength: number) {
  if (queueLength <= 1) return { mode: "immediate" as const, maxBatch: 1, reason: "single job" };
  if (queueLength <= 10) return { mode: "micro-batch" as const, maxBatch: 4, reason: "amortize worker startup while preserving bounded latency" };
  return { mode: "scheduled-batch" as const, maxBatch: 8, reason: "protect provider quota and worker memory" };
}
