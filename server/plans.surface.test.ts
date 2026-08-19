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

  it("keeps payment and entitlement claims provider-gated", () => {
    expect(plans).toContain("provider-gated");
    expect(plans).toContain("live payment confirmation নয়");
    expect(plans).toContain("Provider-side payment validation ছাড়া plan unlock হবে না");
    expect(plans).not.toMatch(/guaranteed income|guaranteed return|নিশ্চিত আয়|নিশ্চিত লাভ/i);
  });

  it("shows transparent support and privacy boundaries", () => {
    expect(plans).toContain("eventai@banglarvoice24news.com");
    expect(plans).toContain("CVV");
    expect(plans).toContain("refund");
    expect(plans).toContain("Governance ও ownership policy");
  });
});
