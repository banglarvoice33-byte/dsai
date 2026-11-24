import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const adminPage = readFileSync(new URL("../client/src/pages/AdminOverview.tsx", import.meta.url), "utf8");
const routers = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const trpc = readFileSync(new URL("./_core/trpc.ts", import.meta.url), "utf8");

describe("DSAI admin console integration contract", () => {
  it("registers the central admin route and all management modules", () => {
    expect(app).toContain('path="/admin"><AdminOnly><AdminShell /></AdminOnly></Route>');
    expect(app).toContain("<DashboardLayout>");
    for (const route of ["/admin/connectors", "/admin/platform", "/admin/deletion-requests", "/admin/scholarship", "/admin/changelog", "/admin/search-analytics"]) expect(adminPage).toContain(route);
  });

  it("uses the admin-only trace summary procedure and does not render trace steps", () => {
    expect(routers).toContain("    traces: router({");
    expect(routers).toContain("listAdminTraceSummaries");
    expect(adminPage).toContain("latest redacted execution summaries; step payload নয়");
    expect(adminPage).not.toContain("steps.map");
  });

  it("keeps management procedures server-side role protected", () => {
    expect(trpc).toContain("ctx.user.role !== 'admin'");
    expect(routers).toContain("adminProcedure");
  });
});
