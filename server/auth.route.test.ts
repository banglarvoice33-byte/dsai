import { describe, expect, it } from "vitest";
import { AUTH_RETURN_TO_DEFAULT, sanitizeOAuthReturnTo } from "@shared/const";

describe("DSAI direct auth route", () => {
  it("preserves safe same-origin relative destinations", () => {
    expect(sanitizeOAuthReturnTo("/workspace")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("/workspace?tab=creative")).toBe("/workspace?tab=creative");
    expect(sanitizeOAuthReturnTo("/workspace#recent")).toBe("/workspace#recent");
  });
  it("defaults missing or hostile destinations to the workspace", () => {
    expect(AUTH_RETURN_TO_DEFAULT).toBe("/workspace");
    expect(sanitizeOAuthReturnTo(null)).toBe("/workspace");
    expect(sanitizeOAuthReturnTo(undefined)).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("https://evil.example")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("//evil.example")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("///evil.example")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("/api")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("/api/oauth/callback")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("/\\evil.example")).toBe("/workspace");
    expect(sanitizeOAuthReturnTo("/" + String.fromCharCode(0) + "workspace")).toBe("/workspace");
  });
});
