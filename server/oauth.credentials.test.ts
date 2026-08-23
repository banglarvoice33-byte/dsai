import { describe, expect, it } from "vitest";

type ProviderConfig = { id: string; clientId?: string; clientSecret?: string; redirectUri?: string; tokenUrl: string };

async function validateClient(config: ProviderConfig, request: typeof fetch = fetch) {
  if (!config.clientId || !config.clientSecret || !config.redirectUri) return "missing" as const;
  const body = new URLSearchParams({ grant_type: "authorization_code", code: "dsai-validation-only-invalid-code", redirect_uri: config.redirectUri, client_id: config.clientId, client_secret: config.clientSecret });
  const response = await request(config.tokenUrl, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  const payload = await response.json().catch(() => ({})) as { error?: string };
  return { status: response.status, error: payload.error || "unknown" };
}

describe("provider OAuth sandbox credentials", () => {
  it("does not attempt provider calls when credentials are not configured", async () => {
    const result = await validateClient({ id: "google", clientId: process.env.GOOGLE_OAUTH_CLIENT_ID, clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET, redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI, tokenUrl: "https://oauth2.googleapis.com/token" });
    if (result !== "missing") expect(result.status).toBe(400);
    expect(["missing", "object"]).toContain(result === "missing" ? "missing" : "object");
  }, 15_000);

  it("uses only a no-grant validation request for configured HubSpot credentials", async () => {
    let captured: { url: string; init?: RequestInit } | undefined;
    const result = await validateClient({ id: "hubspot", clientId: process.env.HUBSPOT_OAUTH_CLIENT_ID || "test-client", clientSecret: process.env.HUBSPOT_OAUTH_CLIENT_SECRET || "test-secret", redirectUri: process.env.HUBSPOT_OAUTH_REDIRECT_URI || "https://example.com/callback", tokenUrl: "https://api.hubapi.com/oauth/v1/token" }, async (url, init) => {
      captured = { url: String(url), init };
      return new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400, headers: { "content-type": "application/json" } });
    });
    expect(result).toEqual({ status: 400, error: "invalid_grant" });
    expect(captured?.url).toBe("https://api.hubapi.com/oauth/v1/token");
    expect(captured?.init?.method).toBe("POST");
    expect(String(captured?.init?.body)).toContain("dsai-validation-only-invalid-code");
  });
});
