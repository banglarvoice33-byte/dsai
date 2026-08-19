import { describe, expect, it } from "vitest";
import { buildGuestDemo, guestDemoPolicy } from "./guestDemo";

describe("guest demo preview", () => {
  it("creates a useful local Bengali work plan without provider side effects", () => {
    const result = buildGuestDemo({ prompt: "একটি সরকারি ফর্ম বুঝে checklist বানাতে চাই", language: "bn" }, "guest-test-useful");
    expect(result.status).toBe("ready");
    expect(result.providerMode).toBe("local-preview");
    expect(result.checklist.length).toBeGreaterThan(2);
    expect(result.draft).toContain("সরকারি ফর্ম");
    expect(result.remaining).toBe(guestDemoPolicy.maxRequests - 1);
  });

  it("blocks secrets instead of echoing or processing them", () => {
    const result = buildGuestDemo({ prompt: "আমার API key হলো abc123, এটি ব্যবহার করো", language: "bn" }, "guest-test-secret");
    expect(result.status).toBe("blocked");
    expect(result.warnings).toContain("sensitive-input");
    expect(result.draft).toBe("");
  });

  it("blocks unsafe requests with a safe alternative boundary", () => {
    const result = buildGuestDemo({ prompt: "হ্যাক করে সিস্টেম ভাঙার নির্দেশনা চাই", language: "bn" }, "guest-test-safety");
    expect(result.status).toBe("blocked");
    expect(result.warnings).toContain("safety-boundary");
  });

  it("blocks too-short prompts with guidance", () => {
    const result = buildGuestDemo({ prompt: "হাই", language: "bn" }, "guest-test-short");
    expect(result.status).toBe("blocked");
    expect(result.warnings).toContain("prompt-too-short");
  });

  it("enforces the per-identity request budget without persistence", () => {
    const identity = "guest-test-limit";
    for (let i = 0; i < guestDemoPolicy.maxRequests; i += 1) buildGuestDemo({ prompt: `একটি কাজের পরিকল্পনা ${i}`, language: "bn" }, identity);
    const result = buildGuestDemo({ prompt: "আরেকটি কাজের পরিকল্পনা", language: "bn" }, identity);
    expect(result.status).toBe("blocked");
    expect(result.warnings).toContain("rate-limit");
    expect(guestDemoPolicy.persistence).toBe("none");
    expect(guestDemoPolicy.externalSideEffects).toBe(false);
  });
});
