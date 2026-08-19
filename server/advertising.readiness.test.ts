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

  it("documents consent, labels, no-ad zones, and no click incentives", () => {
    expect(policy).toContain("Advertisement");
    expect(policy).toContain("consent");
    expect(policy).toContain("click incentive");
    expect(policy).toContain("ad-free");
    expect(policy).toContain("disabled by default");
  });
});
