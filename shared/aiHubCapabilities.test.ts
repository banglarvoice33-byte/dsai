import { describe, expect, it } from "vitest";
import { AI_HUB_CONNECTOR_SETUP_IDS, isAiHubConnectorSetupAvailable } from "./aiHubCapabilities";

describe("AI Hub connector setup capability", () => {
  it("exposes setup only for connectors with an authenticated Work Desk credential lifecycle", () => {
    expect(AI_HUB_CONNECTOR_SETUP_IDS).toEqual(["openrouter", "gemini"]);
    expect(isAiHubConnectorSetupAvailable("openrouter")).toBe(true);
    expect(isAiHubConnectorSetupAvailable("gemini")).toBe(true);
  });

  it.each(["openai-platform", "openai", "xai", "claude", "unknown-provider"])(
    "keeps %s discoverable without exposing Work Desk setup",
    providerId => expect(isAiHubConnectorSetupAvailable(providerId)).toBe(false),
  );
});
