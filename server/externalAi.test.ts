import { describe, expect, it } from "vitest";
import { isExternalAiProviderAllowed } from "./externalAi";

describe("secondary structured AI provider free-only policy", () => {
  it("allows OpenRouter free routing but blocks unverified paid-tier providers", () => {
    expect(isExternalAiProviderAllowed("openrouter", true, false, false)).toBe(true);
    expect(isExternalAiProviderAllowed("groq", true, false, false)).toBe(false);
    expect(isExternalAiProviderAllowed("gemini", true, false, false)).toBe(false);
  });

  it("allows Groq or Gemini only after explicit free-tier confirmation", () => {
    expect(isExternalAiProviderAllowed("groq", true, true, false)).toBe(true);
    expect(isExternalAiProviderAllowed("gemini", true, false, true)).toBe(true);
  });

  it("preserves operator-selected providers outside free-only mode", () => {
    expect(isExternalAiProviderAllowed("groq", false, false, false)).toBe(true);
    expect(isExternalAiProviderAllowed("gemini", false, false, false)).toBe(true);
  });
});
