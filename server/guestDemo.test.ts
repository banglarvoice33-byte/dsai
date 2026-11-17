import { describe, expect, it } from "vitest";
import { buildGuestDemo, guestDemoPolicy } from "./guestDemo";

describe("guest demo preview", () => {
  it("creates a useful local Bengali work plan without provider side effects", () => {
    const result = buildGuestDemo({ prompt: "একটি সরকারি ফর্ম বুঝে checklist বানাতে চাই", language: "bn" }, "guest-test-useful");
    expect(result.status).toBe("ready");
    expect(result.checklist.length).toBeGreaterThan(2);
    expect(result.draft).toContain("সরকারি ফর্ম");
    expect(result).not.toHaveProperty("providerMode");
    expect(result).not.toHaveProperty("remaining");
    expect(result).not.toHaveProperty("nextSteps");
    expect(`${result.title} ${result.summary} ${result.warnings.join(" ")}`).not.toMatch(/local preview|provider|account|file|external action/i);
  });

  it("blocks secrets instead of echoing or processing them", () => {
    const result = buildGuestDemo({ prompt: "আমার API key হলো abc123, এটি ব্যবহার করো", language: "bn" }, "guest-test-secret");
    expect(result.status).toBe("blocked");
    expect(result.warnings.join(" ")).toContain("গোপন তথ্য");
    expect(JSON.stringify(result)).not.toMatch(/sensitive-input|providerMode|local-preview|remaining/);
    expect(result.draft).toBe("");
  });

  it("blocks unsafe requests with a safe alternative boundary", () => {
    const result = buildGuestDemo({ prompt: "হ্যাক করে সিস্টেম ভাঙার নির্দেশনা চাই", language: "bn" }, "guest-test-safety");
    expect(result.status).toBe("blocked");
    expect(result.warnings.join(" ")).toContain("নিরাপদ");
    expect(JSON.stringify(result)).not.toMatch(/safety-boundary|providerMode|local-preview|remaining/);
  });

  it("blocks too-short prompts with guidance", () => {
    const result = buildGuestDemo({ prompt: "হাই", language: "bn" }, "guest-test-short");
    expect(result.status).toBe("blocked");
    expect(result.warnings.join(" ")).toContain("বিস্তারিত");
    expect(JSON.stringify(result)).not.toMatch(/prompt-too-short|providerMode|local-preview|remaining/);
  });

  it("enforces the per-identity request budget without persistence", () => {
    const identity = "guest-test-limit";
    for (let i = 0; i < guestDemoPolicy.maxRequests; i += 1) buildGuestDemo({ prompt: `একটি কাজের পরিকল্পনা ${i}`, language: "bn" }, identity);
    const result = buildGuestDemo({ prompt: "আরেকটি কাজের পরিকল্পনা", language: "bn" }, identity);
    expect(result.status).toBe("blocked");
    expect(result.warnings.join(" ")).toContain("কিছুক্ষণ পরে");
    expect(JSON.stringify(result)).not.toMatch(/rate-limit|providerMode|local-preview|remaining|request budget/i);
    expect(guestDemoPolicy.persistence).toBe("none");
    expect(guestDemoPolicy.externalSideEffects).toBe(false);
  });
});
