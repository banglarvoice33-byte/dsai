import { describe, expect, it } from "vitest";
import { buildCreativePreview } from "./creativePipeline";

describe("creative preview pipeline", () => {
  it("creates a blocked image plan when rights and safety are not acknowledged", () => {
    const result = buildCreativePreview({ mode: "text-to-image", prompt: "বাংলা নদীর দৃশ্য", rightsConfirmed: false, safetyAcknowledged: false });
    expect(result.status).toBe("blocked");
    expect(result.providerMode).toBe("provider-gated");
    expect(result.output).toBeNull();
    expect(result.blockedReasons).toEqual(expect.arrayContaining(["rights", "safety", "provider"]));
  });
  it("creates a preview-ready text-video plan with bounded duration", () => {
    const result = buildCreativePreview({ mode: "text-to-video", prompt: "একটি শান্ত বর্ষার দৃশ্য", durationSeconds: 999, rightsConfirmed: true, safetyAcknowledged: true });
    expect(result.status).toBe("blocked");
    expect(result.durationSeconds).toBe(30);
    expect(result.blockedReasons).toContain("provider");
  });
  it("requires a source asset for image-to-video", () => {
    const result = buildCreativePreview({ mode: "image-to-video", prompt: "ধীরে camera push-in", rightsConfirmed: true, safetyAcknowledged: true });
    expect(result.blockedReasons).toContain("sourceAsset");
  });
  it("accepts all non-provider gates without fabricating an asset", () => {
    const result = buildCreativePreview({ mode: "text-to-image", prompt: "একটি বইয়ের প্রচ্ছদ", rightsConfirmed: true, safetyAcknowledged: true });
    expect(result.blockedReasons).toEqual(["provider"]);
    expect(result.output).toBeNull();
  });
});
