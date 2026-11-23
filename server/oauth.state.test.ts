import { describe, expect, it } from "vitest";
import { decodeOAuthState, encodeOAuthState, sanitizeOAuthReturnTo } from "@shared/const";

describe("OAuth state safety contract", () => {
  it("round-trips a nonce and safe return destination", () => {
    const state = encodeOAuthState({ redirectUri: "https://dsai.example/api/oauth/callback", nonce: "nonce-123", returnTo: "/workspace" });
    expect(decodeOAuthState(state)).toEqual({ redirectUri: "https://dsai.example/api/oauth/callback", nonce: "nonce-123", returnTo: "/workspace" });
  });
  it("does not accept malformed state as a valid nonce", () => {
    expect(decodeOAuthState("not-valid-base64").nonce).toBeUndefined();
    expect(decodeOAuthState(btoa(JSON.stringify({ redirectUri: "/callback" }))).nonce).toBeUndefined();
  });
  it("keeps recovery return paths local and rejects protocol-relative or API paths", () => {
    expect(sanitizeOAuthReturnTo("/workspace")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("//evil.example")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("/api/oauth/callback")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo(null)).toBe("/workspace");
  });
});
