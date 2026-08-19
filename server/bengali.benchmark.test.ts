import { describe, expect, it } from "vitest";
import { BENGALI_BENCHMARK_CASES, normalizeBengaliText, routeBengaliIntent, runBengaliBenchmark } from "./bengaliBenchmark";

describe("DSAI Bengali benchmark evaluator", () => {
  it("normalizes Unicode spacing, zero-width characters, punctuation, and case", () => {
    expect(normalizeBengaliText("  সরকারি\u200d  সেবা—ফর্মটি বুঝি। ")).toBe("সরকারি সেবা-ফর্মটি বুঝি.");
  });
  it("routes product-specific Bengali intents to bounded destinations", () => {
    expect(routeBengaliIntent("সরকারি সেবার ফর্মটি বুঝতে সাহায্য চাই")).toBe("access");
    expect(routeBengaliIntent("একটি বাংলা প্রচার ভিডিওর ধারণা লিখুন")).toBe("creative");
    expect(routeBengaliIntent("source ও evidence দেখে অনিশ্চয়তা চিহ্নিত করুন")).toBe("evidence");
    expect(routeBengaliIntent("ক্ষতিকর কাজের নির্দেশনা দেবেন না")).toBe("safety");
    expect(routeBengaliIntent("বাইরে পাঠানোর আগে একজন মানুষ অনুমোদন করুন")).toBe("handoff");
  });
  it("executes the canonical suite and produces a safe summary", () => {
    const result = runBengaliBenchmark();
    expect(result.sampleCount).toBe(BENGALI_BENCHMARK_CASES.length);
    expect(result.scoreBps).toBe(10000);
    expect(result.status).toBe("passed");
    expect(result.cases.every(item => item.normalizedLength > 0 && item.passed)).toBe(true);
  });
  it("blocks an empty suite rather than treating missing evidence as a pass", () => {
    const result = runBengaliBenchmark([]);
    expect(result.status).toBe("blocked");
    expect(result.scoreBps).toBe(0);
  });
});
