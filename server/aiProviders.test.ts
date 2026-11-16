import { afterEach, describe, expect, it, vi } from "vitest";
import { isProviderAllowedInFreeOnlyMode, runAIProvider } from "./aiProviders";

describe("AI provider fail-closed defaults", () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each(["openrouter", "xai", "openai", "gemini", "cloudflare"] as const)(
    "%s rejects calls while the global provider flag is disabled",
    async provider => {
      vi.stubEnv("AI_PROVIDERS_ENABLED", "false");
      vi.stubEnv("DATABASE_URL", "");
      await expect(runAIProvider({
        provider,
        messages: [{ role: "user", content: "health check" }],
      })).rejects.toMatchObject({ code: "AI_PROVIDERS_DISABLED", status: 503 });
    },
  );

  it("rejects unknown/missing configuration before network access", async () => {
    vi.stubEnv("AI_PROVIDERS_ENABLED", "true");
    vi.stubEnv("DATABASE_URL", "");
    await expect(runAIProvider({
      provider: "openai",
      messages: [{ role: "user", content: "health check" }],
    })).rejects.toThrow("database is not configured");
  });
});

describe("AI provider free-only routing policy", () => {
  it("allows only OpenRouter free routing and Cloudflare Workers AI", () => {
    expect(isProviderAllowedInFreeOnlyMode("openrouter", true)).toBe(true);
    expect(isProviderAllowedInFreeOnlyMode("cloudflare", true)).toBe(true);
    expect(isProviderAllowedInFreeOnlyMode("xai", true)).toBe(false);
    expect(isProviderAllowedInFreeOnlyMode("openai", true)).toBe(false);
    expect(isProviderAllowedInFreeOnlyMode("gemini", true)).toBe(false);
  });

  it("does not restrict providers when free-only mode is disabled", () => {
    for (const provider of ["openrouter", "cloudflare", "xai", "openai", "gemini"] as const) {
      expect(isProviderAllowedInFreeOnlyMode(provider, false)).toBe(true);
    }
  });
});
