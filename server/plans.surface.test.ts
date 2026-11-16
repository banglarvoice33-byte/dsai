import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const plans = readFileSync(resolve(root, "client/src/pages/Plans.tsx"), "utf8");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");

describe("transparent plan surface", () => {
  it("exposes a public plans route", () => {
    expect(app).toContain('path="/plans"');
    expect(app).toContain("@/pages/Plans");
  });

  it("keeps payment claims transparent without exposing implementation details", () => {
    expect(plans).toContain("live payment confirmation নয়");
    expect(plans).toContain("আপনার অনুমতি ছাড়া কোনো charge নেওয়া হবে না");
    expect(plans).toContain("Card number, CVV, wallet PIN বা OTP DSAI-তে রাখা হবে না।");
    expect(plans).not.toMatch(/provider-gated|Provider-side payment validation|API key|database/i);
    expect(plans).not.toMatch(/guaranteed income|guaranteed return|নিশ্চিত আয়|নিশ্চিত লাভ/i);
  });

  it("shows transparent support and privacy boundaries", () => {
    expect(plans).toContain("eventai@banglarvoice24news.com");
    expect(plans).toContain("CVV");
    expect(plans).toContain("refund");
    expect(plans).toContain("Governance ও ownership policy");
  });
});
