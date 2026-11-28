import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const panel = readFileSync(new URL("./WorkDeskTextPanel.tsx", import.meta.url), "utf8");

describe("Work Desk responsive information order", () => {
  it("places task history first, the composer next, and generated output below", () => {
    expect(panel).toContain('flex-col gap-y-6 sm:gap-y-8');
    expect(panel).toContain('order-1 overflow-hidden rounded-3xl border border-[#e0e8e1] bg-white" aria-label="সাম্প্রতিক কাজের তালিকা"');
    expect(panel).toContain('order-2 overflow-hidden rounded-[28px] border border-[#dfe7df] bg-white');
    expect(panel).toContain('order-5 overflow-hidden rounded-3xl border border-[#e0e8e1] bg-white');
    expect(panel).toContain('aria-label="নতুন কাজের নির্দেশনা"');
    expect(panel).toContain('aria-label="সাম্প্রতিক ফলাফল"');
  });

  it("keeps the send action in progress through worker startup and exposes worker outcomes", () => {
    expect(panel).toContain("const isSubmitting = create.isPending || start.isPending;");
    expect(panel).toContain('start.mutate({ taskId: result.id });');
    expect(panel).toContain('result.status === "completed"');
    expect(panel).toContain('result.status === "failed"');
    expect(panel).toContain('"AI-তে পাঠানো হচ্ছে…"');
    expect(panel.indexOf("await tasks.refetch();", panel.indexOf("onSuccess: async result => {", panel.indexOf("const create ="))))
      .toBeLessThan(panel.indexOf('start.mutate({ taskId: result.id });'));
  });
});
