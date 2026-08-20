import type { CreativeMode } from "./creativeAgents";

export const MEDIA_JOB_STATUSES = ["queued", "processing", "succeeded", "failed", "cancelled"] as const;
export type MediaJobStatus = (typeof MEDIA_JOB_STATUSES)[number];

export type MediaJobRequest = {
  requestId: string;
  userId: number;
  mode: CreativeMode;
  prompt: string;
  estimatedCredits: number;
  providerConfigured: boolean;
  rightsConfirmed: boolean;
  safetyAcknowledged: boolean;
};

export type MediaJobPlan = {
  requestId: string;
  userId: number;
  mode: CreativeMode;
  status: "queued" | "blocked";
  providerMode: "provider-gated";
  estimatedCredits: number;
  blockedReasons: string[];
  idempotencyKey: string;
};

const transitions: Record<MediaJobStatus, readonly MediaJobStatus[]> = {
  queued: ["processing", "cancelled", "failed"],
  processing: ["succeeded", "failed", "cancelled"],
  succeeded: [],
  failed: [],
  cancelled: [],
};

export function canTransitionMediaJob(from: MediaJobStatus, to: MediaJobStatus) {
  return transitions[from].includes(to);
}

export function normalizeMediaRequestId(requestId: string) {
  const compact = Array.from(requestId.normalize("NFKC").trim()).map(char => {
    const codePoint = char.codePointAt(0) ?? 0;
    const isAsciiLetter = (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
    const isAsciiDigit = char >= "0" && char <= "9";
    return isAsciiLetter || isAsciiDigit || codePoint > 127 || "._:-".includes(char) ? char : "-";
  }).join("");
  return compact.replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 128);
}

export function buildMediaJobPlan(input: MediaJobRequest): MediaJobPlan {
  const requestId = normalizeMediaRequestId(input.requestId);
  const blockedReasons: string[] = [];
  if (!requestId) blockedReasons.push("requestId");
  if (!Number.isInteger(input.userId) || input.userId < 1) blockedReasons.push("userId");
  if (!input.providerConfigured) blockedReasons.push("provider");
  if (!input.rightsConfirmed) blockedReasons.push("rights");
  if (!input.safetyAcknowledged) blockedReasons.push("safety");
  if (!Number.isInteger(input.estimatedCredits) || input.estimatedCredits < 1 || input.estimatedCredits > 1000) blockedReasons.push("credit-cap");
  return {
    requestId,
    userId: input.userId,
    mode: input.mode,
    status: blockedReasons.length ? "blocked" : "queued",
    providerMode: "provider-gated",
    estimatedCredits: Math.min(1000, Math.max(1, Math.floor(input.estimatedCredits || 1))),
    blockedReasons,
    idempotencyKey: `${input.userId}:${requestId}:${input.mode}`,
  };
}
