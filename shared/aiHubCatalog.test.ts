import { describe, expect, it } from "vitest";
import { DSAI_AI_HUB_CATEGORIES } from "./aiHubCatalog";

describe("DSAI AI Hub official destinations", () => {
  it("provides a secure official destination for every directory entry", () => {
    const providers = DSAI_AI_HUB_CATEGORIES.flatMap(category => category.providers);
    expect(providers).toHaveLength(125);
    expect(providers.every(provider => provider.officialUrl && /^https:\/\//.test(provider.officialUrl))).toBe(true);
    expect(new Set(providers.map(provider => provider.id)).size).toBe(providers.length);
  });

  it("includes the requested high-priority consumer AI services", () => {
    const ids = new Set(DSAI_AI_HUB_CATEGORIES.flatMap(category => category.providers.map(provider => provider.id)));
    for (const id of [
      "chatgpt", "openai-platform", "claude", "kimi", "deepseek", "meta-ai", "qwen-chat",
      "agnes-ai", "genspark", "manus", "canva", "adobe-firefly", "microsoft-designer",
      "notebooklm", "gamma",
    ]) expect(ids.has(id), `missing provider: ${id}`).toBe(true);
  });

  it("keeps free consumer access distinct from API billing notes", () => {
    const providers = DSAI_AI_HUB_CATEGORIES.flatMap(category => category.providers);
    const byId = new Map(providers.map(provider => [provider.id, provider]));
    expect(byId.get("chatgpt")?.freeAccessLabel).toBe("Limited free plan");
    expect(byId.get("openai-platform")?.freeAccessLabel).toBe("Paid API");
    expect(byId.get("openai-platform")?.freeAccessNote).toContain("ChatGPT consumer free access");
    expect(providers.filter(provider => provider.freeAccessLabel).length).toBeGreaterThanOrEqual(15);
  });
});
