import { describe, expect, it } from "vitest";
import { CREATIVE_AGENT_REGISTRY } from "@shared/creativeAgents";

describe("creative agent registry", () => {
  it("contains one independently governed lead for each requested media mode", () => {
    expect(CREATIVE_AGENT_REGISTRY.map(agent => agent.mode)).toEqual(["text-to-image", "text-to-video", "image-to-video"]);
    expect(new Set(CREATIVE_AGENT_REGISTRY.map(agent => agent.id)).size).toBe(3);
  });
  it("requires support agents, evidence, quality metrics, and human gates", () => {
    for (const agent of CREATIVE_AGENT_REGISTRY) {
      expect(agent.supportAgents.length).toBeGreaterThanOrEqual(3);
      expect(agent.evidence.length).toBeGreaterThanOrEqual(4);
      expect(agent.qualityMetrics.length).toBeGreaterThanOrEqual(3);
      expect(agent.humanGate.length).toBeGreaterThan(20);
      expect(agent.failurePolicy.length).toBeGreaterThanOrEqual(2);
    }
  });
});
