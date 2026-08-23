import { beforeEach, describe, expect, it, vi } from "vitest";
import { multilingualLeadInputSchema } from "@shared/multilingualLead";
import { BUSINESS_MARKETS } from "@shared/businessMarkets";

const { invokeLLM } = vi.hoisted(() => ({ invokeLLM: vi.fn() }));
vi.mock("./_core/llm", () => ({ invokeLLM }));

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

describe("universal multilingual lead composer", () => {
  beforeEach(() => invokeLLM.mockReset());

  it("returns a safe deterministic fallback when the AI provider is unavailable", async () => {
    invokeLLM.mockResolvedValue({ model: "gpt-5-mini", choices: [{ message: { role: "assistant", content: "not-json" } }] });
    const result = await composeMultilingualLead(multilingualLeadInputSchema.parse(baseInput));

    expect(result.source).toBe("fallback");
    expect(result.outboundSendAllowed).toBe(false);
    expect(result.humanReviewRequired).toBe(true);
    expect(result.draft.optOutLine).toContain("unsubscribe");
  });

  it("accepts arbitrary source and target language labels", () => {
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
