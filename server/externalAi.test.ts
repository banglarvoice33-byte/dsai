import { describe, expect, it } from "vitest";
import { isExternalAiProviderAllowed } from "./externalAi";

describe("secondary structured AI provider free-only policy", () => {
  it("blocks all direct environment-key adapters in free-only mode", () => {
    expect(isExternalAiProviderAllowed("openrouter", true)).toBe(false);
    expect(isExternalAiProviderAllowed("groq", true)).toBe(false);
    expect(isExternalAiProviderAllowed("gemini", true)).toBe(false);
  });

  it("allows direct environment adapters only when free-only mode is explicitly disabled", () => {
    expect(isExternalAiProviderAllowed("groq", false)).toBe(true);
    expect(isExternalAiProviderAllowed("gemini", false)).toBe(true);
    expect(isExternalAiProviderAllowed("openrouter", false)).toBe(true);
  });
});
