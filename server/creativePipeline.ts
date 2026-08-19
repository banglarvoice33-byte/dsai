import { getCreativeAgent, type CreativeMode } from "@shared/creativeAgents";

export type CreativePreviewInput = { mode: CreativeMode; prompt: string; durationSeconds?: number; aspectRatio?: string; sourceAssetId?: string; rightsConfirmed: boolean; safetyAcknowledged: boolean };

export function buildCreativePreview(input: CreativePreviewInput) {
  const agent = getCreativeAgent(input.mode);
  const normalizedPrompt = input.prompt.normalize("NFKC").trim().replace(/\s+/g, " ").slice(0, 4000);
  const durationSeconds = input.mode === "text-to-image" ? 0 : Math.min(30, Math.max(1, input.durationSeconds ?? 5));
  const sourceRequired = input.mode === "image-to-video";
  const checks = {
    promptPresent: normalizedPrompt.length >= 3,
    rights: input.rightsConfirmed,
    safety: input.safetyAcknowledged,
    sourceAsset: !sourceRequired || Boolean(input.sourceAssetId),
    provider: false,
  };
  const blockedReasons = Object.entries(checks).filter(([, passed]) => !passed).map(([key]) => key);
  const estimatedCredits = input.mode === "text-to-image" ? 1 : 2 + durationSeconds;
  return {
    status: blockedReasons.length ? "blocked" as const : "preview-ready" as const,
    providerMode: "provider-gated" as const,
    agentId: agent.id,
    agentName: agent.name,
    mode: input.mode,
    normalizedPrompt,
    durationSeconds,
    estimatedCredits,
    qualityPlan: agent.qualityMetrics,
    supportAgents: agent.supportAgents,
    evidenceRequired: agent.evidence,
    humanGate: agent.humanGate,
    blockedReasons,
    output: null,
  };
}
