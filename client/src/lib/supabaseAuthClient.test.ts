import { describe, expect, it } from "vitest";
import { buildSupabaseAuthRedirectUrl } from "./supabaseAuthClient";

describe("Supabase email authentication redirects", () => {
  it("returns email confirmations to the active Production or Preview origin", () => {
    expect(buildSupabaseAuthRedirectUrl("https://dsai-one.vercel.app")).toBe("https://dsai-one.vercel.app/auth/login?returnTo=%2Fworkspace");
    expect(buildSupabaseAuthRedirectUrl("https://dsai-preview.vercel.app", "/workspace?tab=government")).toBe("https://dsai-preview.vercel.app/auth/login?returnTo=%2Fworkspace%3Ftab%3Dgovernment");
  });
  it.each(["https://evil.example", "//evil.example", "/api/oauth/callback", "/\\evil.example"])("sanitizes untrusted destination %s", destination => {
    expect(buildSupabaseAuthRedirectUrl("https://dsai-preview.vercel.app", destination)).toBe("https://dsai-preview.vercel.app/auth/login?returnTo=%2Fworkspace");
  });
  it.each(["javascript:alert(1)", "file:///tmp/dsai", "https://user:pass@example.com", "https://example.com/path"])("rejects invalid callback origin %s", origin => {
    expect(() => buildSupabaseAuthRedirectUrl(origin)).toThrow("Invalid authentication origin.");
  });
});
