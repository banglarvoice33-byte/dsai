import { describe, expect, it } from "vitest";
import { advertisingPolicy, isAdsAllowedOnRoute } from "../client/src/components/AdReadiness";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const policy = readFileSync(resolve(root, "client/src/pages/Advertising.tsx"), "utf8");

describe("respectful advertising readiness", () => {
  it("is disabled by default and allows only public routes", () => {
    expect(advertisingPolicy.enabled).toBe(false);
    expect(isAdsAllowedOnRoute("/")).toBe(true);
    expect(isAdsAllowedOnRoute("/learn")).toBe(true);
    expect(isAdsAllowedOnRoute("/auth/login")).toBe(false);
    expect(isAdsAllowedOnRoute("/workspace")).toBe(false);
    expect(isAdsAllowedOnRoute("/admin/payments")).toBe(false);
    expect(isAdsAllowedOnRoute("/plans")).toBe(false);
  });

  it("explains the advertising policy in plain language", () => {
    expect(policy).toContain("বর্তমানে DSAI-তে বিজ্ঞাপন চালু নেই।");
    expect(policy).toContain("বিজ্ঞাপন হিসেবেই চিহ্নিত থাকবে");
    expect(policy).toContain("ব্যক্তিগত কাজ, কথোপকথন বা গুরুত্বপূর্ণ পদক্ষেপের মাঝখানে বিভ্রান্তিকর বিজ্ঞাপন দেখানো হবে না।");
    expect(policy).not.toMatch(/Advertisement|click incentive|ad-free|disabled by default|publisher|provider/i);
  });
});
