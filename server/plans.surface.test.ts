import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const plans = readFileSync(resolve(root, "client/src/pages/Plans.tsx"), "utf8");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");

describe("simple free plan surface", () => {
  it("exposes a public plans route", () => {
    expect(app).toContain('path="/plans"');
    expect(app).toContain("@/pages/Plans");
  });

  it("shows only the currently available free offer", () => {
    expect(plans).toContain("বিনামূল্যে");
    expect(plans).toContain("কোনো পেইড প্ল্যান বা স্বয়ংক্রিয় চার্জ নেই");
    expect(plans).toContain("বাইরের কোনো ওয়েবসাইট বা সেবা ব্যবহার করলে তাদের নিজস্ব মূল্য ও নিয়ম প্রযোজ্য হতে পারে");
    expect(plans).not.toMatch(/\bPro\b|Enterprise|subscription|billing|payment gateway|checkout|CVV|wallet PIN|refund/i);
  });

  it("does not expose internal payment or provider implementation details", () => {
    expect(plans).not.toMatch(/provider-gated|Provider-side payment validation|API key|database|webhook|Supabase|Cloudflare|Vercel/i);
    expect(plans).not.toMatch(/guaranteed income|guaranteed return|নিশ্চিত আয়|নিশ্চিত লাভ/i);
  });
});
