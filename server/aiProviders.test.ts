import { afterEach, describe, expect, it, vi } from "vitest";
import { runAIProvider } from "./aiProviders";

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
