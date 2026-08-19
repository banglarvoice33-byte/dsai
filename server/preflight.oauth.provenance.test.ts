import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const script = readFileSync(resolve(root, "scripts/preflight-dsai.mjs"), "utf8");
const guide = readFileSync(resolve(root, "DSAI_PRE_LAUNCH_PREFLIGHT_AND_OAUTH_BN.md"), "utf8");

describe("production preflight and OAuth provenance", () => {
  it("checks core startup names without printing secret values", () => {
    for (const key of ["DATABASE_URL", "JWT_SECRET", "VITE_APP_ID", "OAUTH_SERVER_URL", "VITE_OAUTH_PORTAL_URL"]) expect(script).toContain(key);
    expect(script).toContain("No secret values were printed.");
    expect(script).toContain("mode 600");
  });

  it("distinguishes Manus account OAuth from optional provider connectors", () => {
    expect(guide).toContain("Manus OAuth");
    expect(guide).toContain("Google Calendar");
    expect(guide).toContain("HubSpot/CRM");
    expect(guide).toContain("Google বা HubSpot credential account login-এর বিকল্প নয়");
    expect(guide).toContain("state/nonce");
    expect(guide).toContain("callback");
  });
});
