import { describe, expect, it } from "vitest";
import { DSAI_AI_HUB_CATEGORIES } from "./aiHubPublicCatalog";
import { filterAIHubCategories } from "./aiHubSearch";

describe("AI Hub keyword search", () => {
  it("keeps the complete catalog and all 14 categories available", () => {
    expect(DSAI_AI_HUB_CATEGORIES).toHaveLength(14);
    expect(DSAI_AI_HUB_CATEGORIES.reduce((sum, category) => sum + category.providers.length, 0)).toBe(140);
  });

  it.each([
    ["chatgpt", "chatgpt"],
    ["ছবি", "image-design"],
    ["video", "video"],
    ["কোড", "coding"],
    ["জেমিনি", "gemini"],
    ["speech to text", "google-stt"],
  ])("finds %s through curated aliases", (query, expectedId) => {
    const providers = filterAIHubCategories(DSAI_AI_HUB_CATEGORIES, query).flatMap(category => category.providers);
    expect(providers.some(provider => provider.id === expectedId)).toBe(true);
  });

  it("combines category and keyword filters without mutating the source catalog", () => {
    const before = JSON.stringify(DSAI_AI_HUB_CATEGORIES);
    const results = filterAIHubCategories(DSAI_AI_HUB_CATEGORIES, "gemini", "llm-chat");
    expect(results.flatMap(category => category.providers).map(provider => provider.id)).toContain("gemini");
    expect(results.some(category => category.id !== "llm-chat")).toBe(false);
    expect(JSON.stringify(DSAI_AI_HUB_CATEGORIES)).toBe(before);
  });



  it.each([
    ["chobi", "image-design"],
    ["gobeshona", "research-search"],
    ["gaan", "music-audio"],
    ["nothi", "document-ocr"],
    ["onubad", "translation"],
    ["lekha", "llm-chat"],
  ])("supports curated Banglish query %s", (query, expectedCategory) => {
    const results = filterAIHubCategories(DSAI_AI_HUB_CATEGORIES, query);
    expect(results.some(category => category.id === expectedCategory)).toBe(true);
  });

  it("returns no false matches for an unknown query", () => {
    expect(filterAIHubCategories(DSAI_AI_HUB_CATEGORIES, "no-such-platform").flatMap(category => category.providers)).toHaveLength(0);
  });
});
