import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { accessOf, gateDecision, isExplicit } from "./routeAccess";

describe("routeAccess", () => {
  it("every <Route path> in App.tsx has an explicit rule", () => {
    const app = readFileSync("client/src/App.tsx", "utf8");
    const paths = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
    expect(paths.filter((p) => !isExplicit(p))).toEqual([]);
  });
  it("services are member-only", () => {
    for (const p of ["/workspace", "/documents", "/ai-hub", "/creative-studio", "/lead-composer"]) expect(accessOf(p)).toBe("member");
  });
  it("admin prefixes cover nested paths and token links stay public", () => {
    expect(accessOf("/admin/payments")).toBe("admin");
    expect(accessOf("/agents/abc")).toBe("admin");
    expect(accessOf("/confirm/abc")).toBe("public");
  });
  it("gate decisions", () => {
    const base = { loading: false, hasError: false };
    expect(gateDecision("member", { ...base, loading: true, user: null })).toBe("loading");
    expect(gateDecision("member", { ...base, user: null })).toBe("login");
    expect(gateDecision("member", { ...base, hasError: true, user: null })).toBe("retry");
    expect(gateDecision("member", { ...base, user: { loginMethod: "supabase-anonymous" } })).toBe("login");
    expect(gateDecision("member", { ...base, user: { role: "user" } })).toBe("allow");
    expect(gateDecision("admin", { ...base, user: { role: "user" } })).toBe("forbidden");
    expect(gateDecision("admin", { ...base, user: { role: "admin" } })).toBe("allow");
    expect(gateDecision("public", { ...base, loading: true, user: null })).toBe("allow");
  });
});
