import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const script = readFileSync(resolve(root, "scripts/preflight-dsai.mjs"), "utf8");
const guide = readFileSync(resolve(root, "docs/AUTHENTICATION_AND_ADMIN_GUIDE.md"), "utf8");
const bengaliGuide = readFileSync(resolve(root, "DSAI_PRE_LAUNCH_PREFLIGHT_AND_OAUTH_BN.md"), "utf8");

describe("production preflight and OAuth provenance", () => {
  it("checks core startup names without printing secret values", () => {
    for (const key of ["DATABASE_URL", "JWT_SECRET"]) expect(script).toContain(key);
    for (const key of ["VITE_APP_ID", "OAUTH_SERVER_URL", "VITE_OAUTH_PORTAL_URL"]) expect(script).toContain(key);
    expect(script).toContain("Legacy Manus server OAuth / scheduled-task compatibility");
    expect(script).not.toMatch(/const required = .*OAUTH_SERVER_URL/);
    expect(script).toContain("No secret values were printed.");
    expect(script).toContain("mode 600");
  });

  it("documents Supabase as primary and Manus OAuth as optional legacy compatibility", () => {
    expect(guide).toContain("DSAI uses **Supabase Auth as the primary account identity provider**.");
    expect(guide).toContain("Legacy Manus OAuth");
    expect(guide).toContain("Google Calendar");
    expect(guide).toContain("HubSpot/CRM");
    expect(guide).toContain("state/nonce");
    expect(guide).toContain("callback");
    expect(bengaliGuide).toContain("Supabase Auth");
    expect(bengaliGuide).toContain("legacy Manus");
    expect(bengaliGuide).toContain("বাহ্যিক Manus scheduler");
  });
});
