import { afterEach, describe, expect, it, vi } from "vitest";
import { buildCloudflareRequestBody } from "./aiProviders";
import { buildAIProviderFallbackOrder, FREE_PROVIDER_QUOTAS, isCloudflareModelAllowedInFreeOnlyMode, isGeminiModelAllowedInFreeOnlyMode, isProviderAllowedInFreeOnlyMode, shouldContinueProviderFallback, runAIProvider, resolveProviderModel, throwIfRequestAborted } from "./aiProviders";

describe("Cloudflare GLM-4.7-Flash request quality", () => {
  it("uses low reasoning effort and caps completion tokens so the model returns user-facing content", () => {
    const messages = [{ role: "user" as const, content: "বাংলাদেশের রাজধানী কী?" }];
    expect(buildCloudflareRequestBody(messages, 9000)).toEqual({
      messages,
      max_completion_tokens: 2048,
      reasoning_effort: "low",
      temperature: 0.2,
    });
  });

  it("keeps the configured output budget within safe bounds", () => {
    expect(buildCloudflareRequestBody([], 0).max_completion_tokens).toBe(1024);
    expect(buildCloudflareRequestBody([], -5).max_completion_tokens).toBe(1);
    expect(buildCloudflareRequestBody([], 100).max_completion_tokens).toBe(100);
  });
});

describe("AI provider cancellation guard", () => {
  it("rejects an already-cancelled request before quota or provider access", () => {
    const controller = new AbortController();
    controller.abort(new Error("user_cancelled"));
    expect(() => throwIfRequestAborted(controller.signal)).toThrow("request_aborted");
  });

  it("does not reject a live request", () => {
    expect(() => throwIfRequestAborted(new AbortController().signal)).not.toThrow();
  });
});

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
  it("allows OpenRouter free routing but gates Cloudflare until its no-billing boundary is confirmed", () => {
    expect(isProviderAllowedInFreeOnlyMode("openrouter", true)).toBe(true);
    expect(isProviderAllowedInFreeOnlyMode("cloudflare", true, false)).toBe(false);
    expect(isProviderAllowedInFreeOnlyMode("cloudflare", true, true)).toBe(true);
    expect(isProviderAllowedInFreeOnlyMode("xai", true)).toBe(false);
    expect(isProviderAllowedInFreeOnlyMode("openai", true)).toBe(false);
    expect(isProviderAllowedInFreeOnlyMode("gemini", true, false, false)).toBe(false);
    expect(isProviderAllowedInFreeOnlyMode("gemini", true, false, true)).toBe(true);
  });

  it("does not restrict providers when free-only mode is disabled", () => {
    for (const provider of ["openrouter", "cloudflare", "xai", "openai", "gemini"] as const) {
      expect(isProviderAllowedInFreeOnlyMode(provider, false)).toBe(true);
    }
  });
});

describe("AI provider fallback continuation policy", () => {
  it("continues to the next allowlisted provider for all failures in free-only mode", () => {
    for (const status of [400, 401, 402, 403, 408, 409, 422, 429, 500, 503, null]) {
      expect(shouldContinueProviderFallback(status, true)).toBe(true);
    }
  });

  it("preserves stop-on-client-error policy outside free-only mode", () => {
    expect(shouldContinueProviderFallback(400, false)).toBe(false);
    expect(shouldContinueProviderFallback(422, false)).toBe(false);
    expect(shouldContinueProviderFallback(429, false)).toBe(true);
    expect(shouldContinueProviderFallback(503, false)).toBe(true);
    expect(shouldContinueProviderFallback(null, false)).toBe(true);
  });
});


describe("free-only provider quota and model policy", () => {
  it("keeps Gemini under a conservative shared free-tier guard", () => {
    expect(FREE_PROVIDER_QUOTAS.gemini).toEqual({ perMinute: 5, perDay: 50 });
  });

  it("keeps Cloudflare free-only model access explicit rather than accepting every @cf model", () => {
    expect(FREE_PROVIDER_QUOTAS.cloudflare).toEqual({ perMinute: 5, perDay: 20 });
  });
});


describe("Cloudflare free-only model allowlist", () => {
  it("allows only the explicitly approved Workers AI free model", () => {
    expect(isCloudflareModelAllowedInFreeOnlyMode("@cf/zai-org/glm-4.7-flash", true)).toBe(true);
    expect(isCloudflareModelAllowedInFreeOnlyMode("@cf/moonshotai/kimi-k2.6", true)).toBe(false);
    expect(isCloudflareModelAllowedInFreeOnlyMode("@cf/unknown/model", true)).toBe(false);
    expect(isCloudflareModelAllowedInFreeOnlyMode("@cf/moonshotai/kimi-k2.6", false)).toBe(true);
  });
});


describe("Gemini free-only model allowlist", () => {
  it("allows only explicitly priced Free-tier Gemini Flash models", () => {
    expect(isGeminiModelAllowedInFreeOnlyMode("gemini-3.8-flash", true)).toBe(true);
    expect(isGeminiModelAllowedInFreeOnlyMode("gemini-3.1-flash-lite", true)).toBe(true);
    expect(isGeminiModelAllowedInFreeOnlyMode("gemini-3.6-flash", true)).toBe(false);
    expect(isGeminiModelAllowedInFreeOnlyMode("gemini-3.1-pro-preview", true)).toBe(false);
    expect(isGeminiModelAllowedInFreeOnlyMode("gemini-3.8-flash", false)).toBe(true);
  });
});

describe("free-only fallback order and Gemini consent", () => {
  it("does not route user prompts to Gemini without explicit consent", () => {
    expect(buildAIProviderFallbackOrder({
      freeOnlyMode: true,
      geminiFreeQuotaConfirmed: true,
      cloudflareFreeQuotaConfirmed: false,
      allowGemini: false,
    })).toEqual(["openrouter"]);
  });

  it("adds Gemini only when both account Free-tier gate and per-request consent are true", () => {
    expect(buildAIProviderFallbackOrder({
      freeOnlyMode: true,
      geminiFreeQuotaConfirmed: true,
      cloudflareFreeQuotaConfirmed: false,
      allowGemini: true,
    })).toEqual(["openrouter", "gemini"]);
    expect(buildAIProviderFallbackOrder({
      freeOnlyMode: true,
      geminiFreeQuotaConfirmed: false,
      cloudflareFreeQuotaConfirmed: false,
      allowGemini: true,
    })).toEqual(["openrouter"]);
  });

  it("adds Cloudflare only after its separate no-billing gate is confirmed", () => {
    expect(buildAIProviderFallbackOrder({
      freeOnlyMode: true,
      geminiFreeQuotaConfirmed: false,
      cloudflareFreeQuotaConfirmed: true,
      allowGemini: false,
    })).toEqual(["openrouter", "cloudflare"]);
  });
});


describe("OpenRouter Free quota policy", () => {
  it("uses the published Free-model ceiling without increasing per-user limits", () => {
    expect(FREE_PROVIDER_QUOTAS.openrouter).toEqual({ perMinute: 20, perDay: 50 });
  });
});


describe("provider model identity", () => {
  it("reports OpenRouter's concrete upstream model when supplied", () => {
    expect(resolveProviderModel("openrouter", "openrouter/free", "google/gemini-3.8-flash:free")).toBe("google/gemini-3.8-flash:free");
  });

  it("falls back to the requested model when the gateway omits its selected model", () => {
    expect(resolveProviderModel("openrouter", "openrouter/free", undefined)).toBe("openrouter/free");
  });

  it("keeps direct-provider model identity unchanged", () => {
    expect(resolveProviderModel("gemini", "gemini-3.8-flash", "some-other-model")).toBe("gemini-3.8-flash");
  });
});


describe("AI provider status exposure contract", () => {
  it("keeps the user-facing provider status behind authentication and returns no credential material", async () => {
    const { readFileSync } = await import("node:fs");
    const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
    const providerSource = readFileSync(new URL("./aiProviders.ts", import.meta.url), "utf8");
    expect(routerSource).toContain("providerStatus: protectedProcedure.query(() => getAIProviderStatus())");
    expect(providerSource).toContain("configured,");
    expect(providerSource).toContain("enabled: process.env.AI_PROVIDERS_ENABLED");
    expect(providerSource).not.toContain("decrypted_secret: key");
  });
});
