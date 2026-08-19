import { getCreativeAgent, type CreativeMode } from "@shared/creativeAgents";

export type CreativePreviewInput = {
  mode: CreativeMode;
  prompt: string;
  variationCount?: 2 | 3;
  durationSeconds?: number;
  aspectRatio?: string;
  sourceAssetId?: string;
  rightsConfirmed: boolean;
  safetyAcknowledged: boolean;
};

export function buildCreativePreview(input: CreativePreviewInput) {
  const agent = getCreativeAgent(input.mode);
  const normalizedPrompt = input.prompt.normalize("NFKC").trim().replace(/\s+/g, " ").slice(0, 4000);
  const durationSeconds = input.mode === "text-to-image" ? 0 : Math.min(30, Math.max(1, input.durationSeconds ?? 5));
  const sourceRequired = input.mode === "image-to-video";
  const sourceAssetId = input.sourceAssetId?.trim() || undefined;
  const variationCount = input.mode === "text-to-image" ? (input.variationCount === 3 ? 3 : 2) : 1;
  const checks = {
    promptPresent: normalizedPrompt.length >= 3,
    rights: input.rightsConfirmed,
    safety: input.safetyAcknowledged,
    sourceImage: !sourceRequired || Boolean(sourceAssetId),
    provider: false,
  };
  const blockedReasons = Object.entries(checks).filter(([, passed]) => !passed).map(([key]) => key);
  const estimatedCredits = input.mode === "text-to-image" ? variationCount : 2 + durationSeconds;
  const outputPlan = input.mode === "text-to-image"
    ? Array.from({ length: variationCount }, (_, index) => ({ position: index + 1, direction: index === 0 ? "faithful composition" : index === 1 ? "alternate framing" : "alternate lighting" }))
    : input.mode === "text-to-video"
      ? [{ position: 1, direction: "single prompt storyboard with bounded motion" }]
      : [{ position: 1, direction: "single source image with gentle camera motion" }];
  return {
    status: blockedReasons.length ? "blocked" as const : "preview-ready" as const,
    providerMode: "provider-gated" as const,
    agentId: agent.id,
    agentName: agent.name,
    mode: input.mode,
    normalizedPrompt,
    durationSeconds,
    aspectRatio: input.aspectRatio ?? "16:9",
    variationCount,
    sourceAssetId,
    outputPlan,
    estimatedCredits,
    qualityPlan: agent.qualityMetrics,
    supportAgents: agent.supportAgents,
    evidenceRequired: agent.evidence,
    humanGate: agent.humanGate,
    blockedReasons,
    output: null,
  };
}
