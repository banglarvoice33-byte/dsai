import { describe, expect, it } from "vitest";
import { resolveWorkDeskTaskSubmission } from "./workDeskTaskSubmission";

describe("WorkDesk BYOK task idempotency", () => {
  it("preserves the same idempotency key for an unchanged consented Gemini request", () => {
    const first = resolveWorkDeskTaskSubmission(null, { prompt: "Explain this", language: "en", provider: "gemini", providerConsent: true }, () => "idempotency-key-0001");
    const second = resolveWorkDeskTaskSubmission(first, { prompt: "Explain this", language: "en", provider: "gemini", providerConsent: true }, () => "idempotency-key-0002");
    expect(second.idempotencyKey).toBe(first.idempotencyKey);
  });

  it("creates a new idempotency key when Gemini billing consent changes", () => {
    const first = resolveWorkDeskTaskSubmission(null, { prompt: "Explain this", language: "en", provider: "gemini", providerConsent: false }, () => "idempotency-key-0001");
    const second = resolveWorkDeskTaskSubmission(first, { prompt: "Explain this", language: "en", provider: "gemini", providerConsent: true }, () => "idempotency-key-0002");
    expect(second.idempotencyKey).not.toBe(first.idempotencyKey);
    expect(second.providerConsent).toBe(true);
  });

  it("does not reuse a Gemini idempotency key for a different provider", () => {
    const first = resolveWorkDeskTaskSubmission(null, { prompt: "Explain this", language: "en", provider: "gemini", providerConsent: true }, () => "idempotency-key-0001");
    const second = resolveWorkDeskTaskSubmission(first, { prompt: "Explain this", language: "en", provider: "openrouter" }, () => "idempotency-key-0002");
    expect(second.idempotencyKey).not.toBe(first.idempotencyKey);
  });
});
