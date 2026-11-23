import { describe, expect, it } from "vitest";
import { AI_HUB_CONNECTOR_SETUP_IDS, isAiHubConnectorSetupAvailable } from "./aiHubCapabilities";

describe("AI Hub connector setup capability", () => {
  it("exposes setup only for the verified Free-only OpenRouter route", () => {
    expect(AI_HUB_CONNECTOR_SETUP_IDS).toEqual(["openrouter"]);
    expect(isAiHubConnectorSetupAvailable("openrouter")).toBe(true);
  });

  it.each(["gemini", "openai-platform", "openai", "xai", "unknown-provider"])(
    "keeps %s discoverable without exposing credential setup",
    providerId => expect(isAiHubConnectorSetupAvailable(providerId)).toBe(false),
  );
});
