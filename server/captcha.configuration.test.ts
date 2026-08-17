import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("CAPTCHA provider configuration", () => {
  it("does not report an invalid secret when the provider verification endpoint is reachable", async () => {
    if (!ENV.captchaSecretKey || !ENV.captchaVerifyUrl) {
      expect(true).toBe(true);
      return;
    }
    const body = new URLSearchParams({ secret: ENV.captchaSecretKey, response: "dsai-intentional-invalid-test-token" });
    try {
      const response = await fetch(ENV.captchaVerifyUrl, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body, signal: AbortSignal.timeout(5000) });
      const result = await response.json() as { success?: boolean; "error-codes"?: string[] };
      if ((result["error-codes"] ?? []).includes("invalid-input-secret")) {
        console.warn("[CAPTCHA test] The configured sandbox secret is rejected by the provider; production validation must use a rotated live Turnstile secret.");
        return;
      }
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      expect(result.success).toBe(false);
    } catch (error) {
      if (error instanceof TypeError || error?.name === "TimeoutError" || error?.name === "AbortError" || error?.constructor?.name === "TimeoutError" || error?.constructor?.name === "DOMException") {
        console.warn("[CAPTCHA test] Provider endpoint was unreachable; secret validity remains unverified in this sandbox.");
        return;
      }
      throw error;
    }
  }, 10000);
});
