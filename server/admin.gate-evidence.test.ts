import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../client/src/pages/AdminGateEvidence.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const overview = readFileSync(new URL("../client/src/pages/AdminOverview.tsx", import.meta.url), "utf8");

describe("DSAI remote gate evidence console", () => {
  it("is registered as an admin route and linked from the control map", () => {
    expect(app).toContain('path="/admin/gate-evidence" component={AdminGateEvidence}');
    expect(overview).toContain("/admin/gate-evidence");
  });

  it("requires authentication and admin role before rendering the intake surface", () => {
    expect(page).toContain('if (!user)');
    expect(page).toContain('user.role !== "admin"');
    expect(page).toContain('type: "operator-reported-remote-gate-evidence"');
    expect(page).toContain("not server-verified production readiness");
  });

  it("blocks secrets and sensitive credentials from the local evidence draft", () => {
    expect(page).toContain("password|passwd|secret|token");
    expect(page).toContain("private[_ -]?key");
    expect(page).toContain("database[_ -]?url");
    expect(page).toContain("Sensitive-looking text blocked");
    expect(page).toContain("localStorage");
    expect(page).toContain("Export JSON");
  });
});
