import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const panel = readFileSync(new URL("./WorkDeskTextPanel.tsx", import.meta.url), "utf8");

describe("Work Desk responsive information order", () => {
  it("places the composer and send action before long task history on mobile", () => {
    expect(panel).toContain('flex-col gap-y-6 sm:gap-y-8');
    expect(panel).toContain('order-1 overflow-hidden rounded-[28px] border border-[#dfe7df] bg-white');
    expect(panel).toContain('order-3 overflow-hidden rounded-3xl border border-[#e0e8e1] bg-white');
    expect(panel).toContain('order-4 overflow-hidden rounded-3xl border border-[#e0e8e1] bg-white" aria-label="সাম্প্রতিক কাজের তালিকা"');
    expect(panel).toContain('aria-label="নতুন কাজের নির্দেশনা"');
    expect(panel).toContain('aria-label="সাম্প্রতিক ফলাফল"');
  });

  it("keeps the send action in progress through worker startup and exposes worker outcomes", () => {
    expect(panel).toContain("const isSubmitting = create.isPending || start.isPending;");
    expect(panel).toContain('start.mutate({ taskId: result.id });');
    expect(panel).toContain('result.status === "completed"');
    expect(panel).toContain('result.status === "failed"');
    expect(panel).toContain('"AI-তে পাঠানো হচ্ছে…"');
    const createSuccess = panel.slice(panel.indexOf("const create ="), panel.indexOf("const save ="));
    expect(createSuccess).toContain("void tasks.refetch();");
    expect(createSuccess).toContain('start.mutate({ taskId: result.id });');
    expect(createSuccess.indexOf("void tasks.refetch();")).toBeLessThan(createSuccess.indexOf('start.mutate({ taskId: result.id });'));
  });

  it("keeps the send button visible and usable on narrow screens, with an accessible live status", () => {
    expect(panel).toContain('className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3"');
    expect(panel).toContain('className="flex min-h-12 w-full shrink-0 items-center justify-center rounded-full');
    expect(panel).toContain('aria-label={isSubmitting ? "অনুরোধ পাঠানো হচ্ছে" : "AI-তে নির্দেশনা পাঠান"}');
    expect(panel).toContain('role="status" aria-live="polite"');
    expect(panel).toContain('পাঠাতে কমপক্ষে ৩টি অক্ষর লিখুন।');
  });

  it("keeps the send button visible and directly clickable even before a valid prompt is entered", () => {
    expect(panel).toContain("const submitPrompt = () =>");
    expect(panel).toContain("onClick={submitPrompt}");
    expect(panel).toContain("disabled={isSubmitting}");
    expect(panel).not.toContain("disabled={!canSubmit}");
    expect(panel).toContain('toast.info("পাঠানোর আগে কমপক্ষে ৩টি অক্ষর লিখুন।")');
    expect(panel).toContain("promptInputRef.current?.focus()");
    expect(panel).toContain("create.mutate(submission, { onSettled:");
    expect(panel).toContain("event.preventDefault();\\n          submitPrompt();");
    expect(panel).toContain("event.preventDefault(); submitPrompt();");
  });

  it("does not depend on crypto.randomUUID being available in Android WebViews", () => {
    expect(panel).toContain("function createWorkDeskRequestId()");
    expect(panel).toContain('typeof cryptoApi?.randomUUID === "function"');
    expect(panel).toContain('typeof cryptoApi?.getRandomValues === "function"');
    expect(panel).toContain("createWorkDeskRequestId,");
    expect(panel).not.toContain("() => crypto.randomUUID()");
  });

});
