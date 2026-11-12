import { describe, expect, it } from "vitest";
import { buildCreativePreview } from "./creativePipeline";
import { appRouter } from "./routers";

describe("creative preview pipeline", () => {
  it("creates a blocked image plan when rights and safety are not acknowledged", () => {
    const result = buildCreativePreview({ mode: "text-to-image", prompt: "বাংলা নদীর দৃশ্য", variationCount: 2, rightsConfirmed: false, safetyAcknowledged: false });
    expect(result.status).toBe("blocked");
    expect(result.providerMode).toBe("provider-gated");
    expect(result.output).toBeNull();
    expect(result.variationCount).toBe(2);
    expect(result.outputPlan).toHaveLength(2);
    expect(result.blockedReasons).toEqual(expect.arrayContaining(["rights", "safety", "provider"]));
  });

  it("plans exactly three text-to-image variations without fabricating output", () => {
    const result = buildCreativePreview({ mode: "text-to-image", prompt: "একটি বইয়ের প্রচ্ছদ", variationCount: 3, rightsConfirmed: true, safetyAcknowledged: true });
    expect(result.variationCount).toBe(3);
    expect(result.outputPlan).toHaveLength(3);
    expect(result.blockedReasons).toEqual(["provider"]);
    expect(result.output).toBeNull();
  });

  it("creates a single text-video plan with bounded duration", () => {
    const result = buildCreativePreview({ mode: "text-to-video", prompt: "একটি শান্ত বর্ষার দৃশ্য", durationSeconds: 999, rightsConfirmed: true, safetyAcknowledged: true });
    expect(result.status).toBe("blocked");
    expect(result.durationSeconds).toBe(30);
    expect(result.variationCount).toBe(1);
    expect(result.outputPlan).toHaveLength(1);
    expect(result.blockedReasons).toContain("provider");
  });

  it("requires exactly one source asset for image-to-video", () => {
    const missing = buildCreativePreview({ mode: "image-to-video", prompt: "ধীরে camera push-in", rightsConfirmed: true, safetyAcknowledged: true });
    expect(missing.blockedReasons).toContain("sourceImage");

    const readyPlan = buildCreativePreview({ mode: "image-to-video", prompt: "ধীরে camera push-in", sourceAssetId: "asset-001", rightsConfirmed: true, safetyAcknowledged: true });
    expect(readyPlan.sourceAssetId).toBe("asset-001");
    expect(readyPlan.variationCount).toBe(1);
    expect(readyPlan.outputPlan).toHaveLength(1);
    expect(readyPlan.blockedReasons).toEqual(["provider"]);
  });
});

describe("public creative preview route", () => {
  it("allows a guest to create a bounded plan without enabling provider output", async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const result = await caller.creative.preview({
      mode: "text-to-image",
      prompt: "বাংলা নদীর ধারের documentary দৃশ্য",
      variationCount: 2,
      rightsConfirmed: true,
      safetyAcknowledged: true,
    });
    expect(result.status).toBe("blocked");
    expect(result.providerMode).toBe("provider-gated");
    expect(result.output).toBeNull();
    expect(result.blockedReasons).toEqual(["provider"]);
    expect(result.outputPlan).toHaveLength(2);
  });
});
