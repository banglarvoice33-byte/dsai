import { describe, expect, it } from "vitest";
import { sanitizeOAuthReturnTo } from "@shared/const";

describe("DSAI direct auth route", () => {
  it("preserves safe same-origin relative destinations", () => {
    expect(sanitizeOAuthReturnTo("/workspace")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("/workspace?tab=creative")).toBe("/workspace?tab=creative");
  });

  it("fails closed for external, protocol-relative, API, escaped, and empty destinations", () => {
    expect(sanitizeOAuthReturnTo("https://evil.example")).toBe("/");
    expect(sanitizeOAuthReturnTo("//evil.example")).toBe("/");
    expect(sanitizeOAuthReturnTo("/api/oauth/callback")).toBe("/");
    expect(sanitizeOAuthReturnTo("/\\evil.example")).toBe("/");
    expect(sanitizeOAuthReturnTo(null)).toBe("/");
  });
});
