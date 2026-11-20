import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { multilingualLeadInputSchema } from "@shared/multilingualLead";
import { BUSINESS_MARKETS } from "@shared/businessMarkets";

const { runAIProvider } = vi.hoisted(() => ({ runAIProvider: vi.fn() }));
vi.mock("./aiProviders", () => ({ runAIProvider }));

import { composeMultilingualLead } from "./multilingualLead";

const baseInput = {
  brief: "আমাদের নতুন কর্মশালা সম্পর্কে Toronto community-কে জানাতে চাই",
  sourceLanguage: "auto",
  targetCountry: "Canada",
  targetLanguage: "English (Canada)",
  tone: "warm" as const,
  channel: "email" as const,
  audience: "community members",
  industry: "Education",
  businessStage: "Growing business",
  leadGoal: "Introduction",
  offer: "a practical community workshop",
  workingRegion: "Toronto and surrounding area",
  consentToDraft: true as const,
};

const validDraft = {
  detectedSourceLanguage: "Bengali",
  targetLanguage: "English (Canada)",
  subject: "A community workshop invitation",
  greeting: "Hello,",
  body: "We would like to invite you to a practical workshop.",
  callToAction: "Reply with a convenient time.",
  optOutLine: "Reply unsubscribe to opt out.",
  qualityNote: "AI-generated draft; review before use.",
};

describe("universal multilingual lead composer", () => {
  beforeEach(() => { runAIProvider.mockReset(); });
  afterEach(() => vi.unstubAllEnvs());

  it("returns an honest unavailable result when the provider is disabled", async () => {
    vi.stubEnv("AI_PROVIDERS_ENABLED", "false");
    const result = await composeMultilingualLead(multilingualLeadInputSchema.parse(baseInput));
    expect(result.source).toBe("unavailable");
    expect(result.reason).toBe("provider_disabled");
    expect(result.message).toContain("কোনো নমুনা");
    expect("draft" in result).toBe(false);
    expect(runAIProvider).not.toHaveBeenCalled();
  });

  it("does not invent a fallback when the AI provider returns invalid JSON", async () => {
    vi.stubEnv("AI_PROVIDERS_ENABLED", "true");
    runAIProvider.mockResolvedValue({ provider: "openrouter", model: "openai/gpt-4o-mini", text: "not-json" });
    const result = await composeMultilingualLead(multilingualLeadInputSchema.parse(baseInput));
    expect(result.source).toBe("unavailable");
    expect(result.reason).toBe("invalid_model_output");
    expect(result.message).toContain("যাচাইযোগ্য খসড়া");
    expect("draft" in result).toBe(false);
  });

  it("returns provider failure honestly without substituting a template", async () => {
    vi.stubEnv("AI_PROVIDERS_ENABLED", "true");
    runAIProvider.mockRejectedValue(new Error("provider timeout"));
    const result = await composeMultilingualLead(multilingualLeadInputSchema.parse(baseInput));
    expect(result.source).toBe("unavailable");
    expect(result.reason).toBe("provider_unavailable");
    expect(result.message).toContain("কোনো খসড়া তৈরি");
    expect("draft" in result).toBe(false);
  });

  it("uses the configured OpenRouter model and validates the generated language", async () => {
    vi.stubEnv("AI_PROVIDERS_ENABLED", "true");
    runAIProvider.mockResolvedValue({ provider: "openrouter", model: "openai/gpt-4o-mini", text: JSON.stringify(validDraft) });
    const result = await composeMultilingualLead(multilingualLeadInputSchema.parse(baseInput), "user-1509");
    expect(result.source).toBe("ai");
    if (result.source !== "ai") throw new Error("Expected a valid AI draft");
    expect(result.model).toBe("openai/gpt-4o-mini");
    expect(result.outboundSendAllowed).toBe(false);
    expect(result.humanReviewRequired).toBe(true);
    expect(runAIProvider).toHaveBeenCalledWith(expect.objectContaining({
      provider: "openrouter",
      requestIdentity: "user-1509",
      responseFormat: { type: "json_object" },
    }));
  });

  it("rejects a model response in the wrong target language", async () => {
    vi.stubEnv("AI_PROVIDERS_ENABLED", "true");
    runAIProvider.mockResolvedValue({ provider: "openrouter", model: "openai/gpt-4o-mini", text: JSON.stringify({ ...validDraft, targetLanguage: "French" }) });
    const result = await composeMultilingualLead(multilingualLeadInputSchema.parse(baseInput));
    expect(result.source).toBe("unavailable");
    expect(result.reason).toBe("invalid_model_output");
  });

  it("accepts arbitrary source and target language labels in user input", () => {
    const parsed = multilingualLeadInputSchema.parse({
      ...baseInput,
      sourceLanguage: "অসমীয়া",
      targetCountry: "Japan",
      targetLanguage: "日本語",
      channel: "social-dm",
    });
    expect(parsed.targetLanguage).toBe("日本語");
    expect(parsed.consentToDraft).toBe(true);
  });

  it("ships 40 complete priority-market defaults for guided business context", () => {
    expect(BUSINESS_MARKETS).toHaveLength(40);
    expect(new Set(BUSINESS_MARKETS.map((market) => market.id)).size).toBe(40);
    expect(BUSINESS_MARKETS.every((market) => market.country && market.defaultLanguage && market.locale && market.currency && market.timeZone)).toBe(true);
  });

  it("requires explicit consent to create a draft", () => {
    expect(() => multilingualLeadInputSchema.parse({ ...baseInput, consentToDraft: false })).toThrow();
  });
});
