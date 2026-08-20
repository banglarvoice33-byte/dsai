import { describe, expect, it } from "vitest";
import { buildMediaJobPlan, canTransitionMediaJob, normalizeMediaRequestId } from "@shared/mediaJobContract";

describe("media job contract", () => {
  it("blocks provider-gated work until provider, rights, and safety gates pass", () => {
    const plan = buildMediaJobPlan({ requestId: " demo/1 ", userId: 7, mode: "text-to-video", prompt: "একটি দৃশ্য", estimatedCredits: 12, providerConfigured: false, rightsConfirmed: true, safetyAcknowledged: true });
    expect(plan.status).toBe("blocked");
    expect(plan.blockedReasons).toContain("provider");
    expect(plan.idempotencyKey).toBe("7:demo-1:text-to-video");
  });

  it("queues only a bounded, fully acknowledged job", () => {
    const plan = buildMediaJobPlan({ requestId: "req-2", userId: 8, mode: "image-to-video", prompt: "একটি দৃশ্য", estimatedCredits: 500, providerConfigured: true, rightsConfirmed: true, safetyAcknowledged: true });
    expect(plan.status).toBe("queued");
    expect(plan.estimatedCredits).toBe(500);
  });

  it("normalizes request ids deterministically", () => {
    expect(normalizeMediaRequestId("  বাংলা / job 01  ")).toBe("বাংলা-job-01");
    expect(normalizeMediaRequestId("a".repeat(200))).toHaveLength(128);
  });

  it("allows only safe forward transitions", () => {
    expect(canTransitionMediaJob("queued", "processing")).toBe(true);
    expect(canTransitionMediaJob("processing", "succeeded")).toBe(true);
    expect(canTransitionMediaJob("succeeded", "processing")).toBe(false);
    expect(canTransitionMediaJob("failed", "queued")).toBe(false);
  });
});
