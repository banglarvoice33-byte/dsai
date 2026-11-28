import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const panel = readFileSync(new URL("./WorkDeskTextPanel.tsx", import.meta.url), "utf8");

describe("Work Desk responsive information order", () => {
  it("places task history first, the composer next, and generated output below", () => {
    expect(panel).toContain('flex min-h-[100dvh] w-full max-w-7xl flex-col gap-y-4 pb-28 md:min-h-0 md:gap-y-8 md:pb-0');
    expect(panel).toContain('order-5 overflow-hidden rounded-3xl border border-[#e0e8e1] bg-white md:order-1" aria-label="সাম্প্রতিক কাজের তালিকা"');
    expect(panel).toContain('order-3 relative z-10 overflow-hidden rounded-[28px] border border-[#e7e7e7] bg-white');
    expect(panel).toContain('order-5 overflow-hidden rounded-3xl border border-[#e0e8e1] bg-white');
    expect(panel).toContain('aria-label="নতুন কাজের নির্দেশনা"');
    expect(panel).toContain('aria-label="আপনার কাজের ফলাফল"');
  });

  it("routes visible image and Plus actions to their real product destinations", () => {
    expect(panel).toContain('href="/creative-studio"');
    expect(panel).toContain('aria-label="DSAI Plus plan details"');
    expect(panel).toContain('href="/plans"');
  });

  it("keeps primary workspace controls connected to real handlers", () => {
    expect(panel).toContain("onClick={startNewChat}");
    expect(panel).toContain("onClick={() => setShowFiles(value => !value)}");
    expect(panel).toContain("onClick={() => startSpeechInput(false)}");
    expect(panel).toContain("onClick={() => startSpeechInput(true)}");
    expect(panel).toContain("create.mutate(submission)");
    expect(panel).toContain('href="/ai-hub"');
    expect(panel).toContain('onClick={() => setShowFiles(true)}');
    expect(panel).toContain('aria-controls="workdesk-tools"');
    expect(panel).toContain('id="workdesk-tools"');
  });

  it("keeps a mobile send action fixed above navigation and submits the actual composer form", () => {
    expect(panel).toContain('id="workdesk-compose-form"');
    expect(panel).toContain('onClick={submitPrompt}');
    expect(panel).toContain('type="button" onClick={submitPrompt} disabled={isSubmitting}');
    expect(panel).toContain('fixed inset-x-0 z-50');
    expect(panel).toContain('bottom-[calc(76px+env(safe-area-inset-bottom))]');
    expect(panel).toContain('className="hidden min-h-11 rounded-full');
    expect(panel).toContain('aria-live="polite"');
  });

  it("creates Android-compatible idempotency keys without requiring crypto.randomUUID", () => {
    expect(panel).toContain("function createWorkDeskRequestId()");
    expect(panel).toContain('typeof cryptoApi?.randomUUID === "function"');
    expect(panel).toContain('typeof cryptoApi?.getRandomValues === "function"');
    expect(panel).toContain("createWorkDeskRequestId,");
    expect(panel).not.toContain("() => crypto.randomUUID()");
  });

  it("guards submission and exposes synchronous preparation errors instead of silently failing", () => {
    const submitStart = panel.indexOf('id="workdesk-compose-form"');
    const submitEnd = panel.indexOf("</form>", submitStart);
    const submitBody = panel.slice(submitStart, submitEnd);
    expect(submitBody).toContain("submitPrompt();");
    expect(submitBody).toContain("try {");
    expect(submitBody).toContain("catch (error)");
    expect(submitBody).toContain("toast.error");
    expect(panel).toContain("const isSubmitting = create.isPending || start.isPending;");
    expect(panel).toContain("পাঠানোর আগে কমপক্ষে ৩টি অক্ষর লিখুন।");
  });

});
