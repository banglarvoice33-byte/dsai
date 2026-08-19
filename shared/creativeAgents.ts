export type CreativeMode = "text-to-image" | "text-to-video" | "image-to-video";
export type CreativeReadiness = "provider-gated" | "preview-only" | "implemented";

export type CreativeAgentDefinition = {
  id: string;
  name: string;
  mode: CreativeMode;
  outcome: string;
  readiness: CreativeReadiness;
  supportAgents: Array<{ id: string; role: string; stopCondition: string }>;
  tools: string[];
  evidence: string[];
  humanGate: string;
  qualityMetrics: string[];
  failurePolicy: string[];
};

export const CREATIVE_AGENT_REGISTRY: CreativeAgentDefinition[] = [
  {
    id: "image-composer",
    name: "Alokrekha",
    mode: "text-to-image",
    outcome: "Turn Bengali, Banglish, or English briefs into a reviewable image generation plan and provider-ready prompt contract.",
    readiness: "provider-gated",
    supportAgents: [
      { id: "brief-architect", role: "Normalize intent, subject, composition, aspect ratio, and style constraints.", stopCondition: "Brief remains ambiguous after one clarification cycle." },
      { id: "rights-sentinel", role: "Check public-figure, trademark, reference-image, and user-rights declarations.", stopCondition: "Rights basis is missing or contradictory." },
      { id: "image-quality-judge", role: "Score prompt adherence, text legibility, composition, and Bengali typography risk.", stopCondition: "Required quality dimensions cannot be evaluated." },
    ],
    tools: ["prompt-normalizer", "provider-adapter", "moderation-check", "provenance-manifest", "preview-review"],
    evidence: ["normalized brief", "model/provider version", "safety result", "source-rights note", "output checksum", "review decision"],
    humanGate: "Human approval before commercial/public release or use of user-provided reference assets.",
    qualityMetrics: ["brief adherence", "Bengali text accuracy", "composition score", "safety pass", "cost per accepted asset"],
    failurePolicy: ["retry only transient provider errors", "never retry safety blocks", "return provider-gated instead of fabricating output"],
  },
  {
    id: "motion-director",
    name: "Chalachitro",
    mode: "text-to-video",
    outcome: "Convert a narrative brief into a bounded storyboard, shot list, audio policy, and provider-ready video plan.",
    readiness: "provider-gated",
    supportAgents: [
      { id: "storyboard-planner", role: "Split the brief into shots, camera motion, duration, continuity, and frame targets.", stopCondition: "Duration or shot intent exceeds the configured budget." },
      { id: "safety-audio-sentinel", role: "Check visual, speech, music, and likeness safety boundaries.", stopCondition: "Audio or likeness consent is absent." },
      { id: "continuity-judge", role: "Evaluate temporal consistency, subject identity, motion coherence, and scene transitions.", stopCondition: "Continuity cannot be measured from the preview." },
    ],
    tools: ["storyboard-builder", "provider-adapter", "safety-check", "cost-estimator", "preview-review"],
    evidence: ["storyboard", "duration/frame budget", "audio decision", "provider/model version", "safety result", "review decision"],
    humanGate: "Human approval before rendering long-form, publishing, or generating audio/likeness content.",
    qualityMetrics: ["story adherence", "temporal coherence", "audio policy compliance", "render success", "cost per accepted second"],
    failurePolicy: ["bound duration and retries", "do not silently upscale cost or duration", "preserve failed-job reason and trace"],
  },
  {
    id: "image-animator",
    name: "ChalachitraBindu",
    mode: "image-to-video",
    outcome: "Animate an owned or explicitly licensed image through a motion plan while preserving source provenance and identity safety.",
    readiness: "provider-gated",
    supportAgents: [
      { id: "asset-rights-checker", role: "Verify source asset ownership, consent, MIME, scan state, and retention status.", stopCondition: "Asset is unscanned, expired, or rights are unclear." },
      { id: "motion-planner", role: "Specify camera movement, subject motion, duration, and forbidden transformations.", stopCondition: "Motion request would materially alter identity or exceed the safety scope." },
      { id: "video-quality-judge", role: "Check flicker, warping, identity drift, frame continuity, and output encoding.", stopCondition: "Output cannot pass the required visual checks." },
    ],
    tools: ["asset-intake", "rights-check", "motion-plan", "provider-adapter", "provenance-manifest", "preview-review"],
    evidence: ["source asset checksum", "scan verdict", "rights declaration", "motion plan", "provider/model version", "output checksum", "review decision"],
    humanGate: "Human approval before publishing, likeness-sensitive animation, or use beyond the declared source-asset purpose.",
    qualityMetrics: ["source fidelity", "motion coherence", "identity drift rate", "encoding validity", "rights completeness"],
    failurePolicy: ["reject unsafe or unscanned source assets", "never overwrite the source asset", "retain a reversible preview state"],
  },
];

export function getCreativeAgent(mode: CreativeMode) {
  return CREATIVE_AGENT_REGISTRY.find(agent => agent.mode === mode)!;
}
