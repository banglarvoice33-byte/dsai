import { describe, expect, it } from "vitest";
import { DSAI_AI_HUB_CATEGORIES } from "./aiHubCatalog";

describe("DSAI AI Hub official destinations", () => {
  it("provides a secure official destination for every directory entry", () => {
    const providers = DSAI_AI_HUB_CATEGORIES.flatMap(category => category.providers);
    expect(providers).toHaveLength(110);
    expect(providers.every(provider => provider.officialUrl && /^https:\/\//.test(provider.officialUrl))).toBe(true);
    expect(new Set(providers.map(provider => provider.id)).size).toBe(providers.length);
  });
});
