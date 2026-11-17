import { describe, expect, it } from "vitest";
import { buildProviderReferralUrl, DSAI_AI_HUB_CATEGORIES } from "./aiHubPublicCatalog";

describe("public AI Hub catalog", () => {
  it("contains all 140 official provider destinations", () => {
    const providers = DSAI_AI_HUB_CATEGORIES.flatMap(category => category.providers);
    expect(DSAI_AI_HUB_CATEGORIES).toHaveLength(14);
    expect(providers).toHaveLength(140);
    expect(new Set(providers.map(provider => provider.id)).size).toBe(140);
    expect(providers.every(provider => provider.officialUrl && /^https:\/\//.test(provider.officialUrl))).toBe(true);
  });

  it("ships only fields needed to render the public directory", () => {
    for (const category of DSAI_AI_HUB_CATEGORIES) {
      expect(Object.keys(category).sort()).toEqual(["description", "id", "name", "providers"]);
      for (const provider of category.providers) {
        expect(Object.keys(provider).sort()).toEqual(["id", "name", "officialUrl", "purpose"]);
      }
    }
    const payload = JSON.stringify(DSAI_AI_HUB_CATEGORIES);
    expect(payload).not.toMatch(/integrationNote|freeAccessNote|freeAccessLabel|hosted-api|self-hosted|credential-needed|directory-only|live-verified|connector registry|database schema|ClamAV/i);
  });

  it("preserves safe referral attribution and rejects unsafe URLs", () => {
    const url = buildProviderReferralUrl({
      id: "example-provider",
      officialUrl: "https://example.com/start?plan=free#signup",
    });
    expect(url).toBe("https://example.com/start?plan=free&utm_source=dsai&utm_medium=referral&utm_campaign=ai_hub&utm_content=example-provider#signup");
    expect(buildProviderReferralUrl({ id: "bad", officialUrl: "http://example.com" })).toBeUndefined();
    expect(buildProviderReferralUrl({ id: "bad", officialUrl: "https://user:pass@example.com" })).toBeUndefined();
  });
});
