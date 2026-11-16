import { afterEach, describe, expect, it, vi } from "vitest";
import { assertForgeProviderAllowed } from "./freeOnlyGuard";

describe("Forge provider free-only billing guard", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("blocks direct Forge calls in free-only mode until billing is explicitly verified", () => {
    vi.stubEnv("AI_FREE_ONLY_MODE", "true");
    vi.stubEnv("AI_FORGE_FREE_TIER_CONFIRMED", "false");

    try {
      assertForgeProviderAllowed("text");
      throw new Error("expected Forge provider guard to reject the call");
    } catch (error) {
      expect(error).toMatchObject({
        code: "PAID_PROVIDER_BLOCKED",
        status: 503,
      });
      expect((error as Error).message).toContain("forge_provider_blocked_by_free_only_mode");
    }
  });

  it("allows Forge only after explicit free-tier confirmation", () => {
    vi.stubEnv("AI_FREE_ONLY_MODE", "true");
    vi.stubEnv("AI_FORGE_FREE_TIER_CONFIRMED", "true");
    expect(() => assertForgeProviderAllowed("text")).not.toThrow();
  });

  it("does not alter behavior when free-only mode is disabled", () => {
    vi.stubEnv("AI_FREE_ONLY_MODE", "false");
    vi.stubEnv("AI_FORGE_FREE_TIER_CONFIRMED", "false");
    expect(() => assertForgeProviderAllowed("image")).not.toThrow();
  });
});
