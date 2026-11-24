import { describe, expect, it } from "vitest";
import { isAllowedGatewayPath, resolveGatewayPath } from "./gatewayPath.js";

describe("Vercel gateway route metadata", () => {
  it("preserves ordinary request URLs when no internal path is supplied", () => {
    expect(resolveGatewayPath("/api?hello=world", undefined)).toEqual({ ok: true });
  });

  it("rewrites only an explicitly allowed internal path and strips __path", () => {
    expect(resolveGatewayPath("/?__path=%2Fapi%2Fhealth&x=1", "/api/health")).toEqual({
      ok: true, rewrittenUrl: "/api/health?x=1",
    });
  });

  it("rejects duplicate, conflicting, and non-string route metadata", () => {
    expect(resolveGatewayPath("/?__path=%2Fapi%2Fa&__path=%2Fapi%2Fb", undefined)).toMatchObject({ ok: false, error: "ambiguous-route-path" });
    expect(resolveGatewayPath("/?__path=%2Fapi%2Fa", "/api/b")).toMatchObject({ ok: false, error: "ambiguous-route-path" });
    expect(resolveGatewayPath("/", ["/api/a"])).toMatchObject({ ok: false, error: "ambiguous-route-path" });
  });

  it("rejects URL injection, traversal, encoded separators, and non-API paths", () => {
    for (const path of ["/api/a?b=1", "/api/a#x", "/api/../healthz", "/api/%2fadmin", "/api\\admin", "https://evil.example/api/x", "/private"]) {
      expect(isAllowedGatewayPath(path)).toBe(false);
    }
  });
});
