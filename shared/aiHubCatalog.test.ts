import { describe, expect, it } from "vitest";
import { DSAI_AI_HUB_CATEGORIES } from "./aiHubCatalog";

describe("DSAI AI Hub official destinations", () => {
  it("provides a secure official destination for every directory entry", () => {
    const providers = DSAI_AI_HUB_CATEGORIES.flatMap(category => category.providers);
    expect(providers).toHaveLength(140);
    expect(providers.every(provider => provider.officialUrl && /^https:\/\//.test(provider.officialUrl))).toBe(true);
    expect(new Set(providers.map(provider => provider.id)).size).toBe(providers.length);
  });

  it("includes the requested high-priority consumer AI services", () => {
    const ids = new Set(DSAI_AI_HUB_CATEGORIES.flatMap(category => category.providers.map(provider => provider.id)));
    for (const id of [
      "chatgpt", "openai-platform", "claude", "kimi", "deepseek", "meta-ai", "qwen-chat",
      "agnes-ai", "genspark", "manus", "canva", "adobe-firefly", "microsoft-designer",
      "notebooklm", "gamma", "fish-audio", "google-cloud-tts", "suno", "udio", "musicgen",
      "google-vids", "wan-video", "bolt-new", "lovable", "replit", "v0", "netlify",
      "cloudflare-pages", "mureka", "felo", "doubao",
    ]) expect(ids.has(id), `missing provider: ${id}`).toBe(true);
  });

  it("adds dedicated music, app-builder and hosting categories", () => {
    const categoryIds = new Set(DSAI_AI_HUB_CATEGORIES.map(category => category.id));
    for (const id of ["music-audio", "website-builders", "hosting-deployment"]) {
      expect(categoryIds.has(id), `missing category: ${id}`).toBe(true);
    }
  });

  it("keeps free consumer access distinct from API billing notes", () => {
    const providers = DSAI_AI_HUB_CATEGORIES.flatMap(category => category.providers);
    const byId = new Map(providers.map(provider => [provider.id, provider]));
    expect(byId.get("chatgpt")?.freeAccessLabel).toBe("Limited free plan");
    expect(byId.get("openai-platform")?.freeAccessLabel).toBe("Paid API");
    expect(byId.get("openai-platform")?.freeAccessNote).toContain("ChatGPT consumer free access");
    expect(providers.filter(provider => provider.freeAccessLabel).length).toBeGreaterThanOrEqual(25);
    expect(byId.get("suno")?.freeAccessLabel).toContain("50 credits");
    expect(byId.get("netlify")?.freeAccessLabel).toContain("300 credits");
    expect(byId.get("fish-audio")?.freeAccessLabel).toContain("8,000");
  });
});
