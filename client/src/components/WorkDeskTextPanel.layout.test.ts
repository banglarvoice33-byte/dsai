import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const panel = readFileSync(new URL("./WorkDeskTextPanel.tsx", import.meta.url), "utf8");

describe("Work Desk responsive information order", () => {
  it("places task history first, the composer next, and generated output below", () => {
    expect(panel).toContain('flex min-h-[100dvh] w-full max-w-7xl flex-col gap-y-4 pb-28 md:min-h-0 md:gap-y-8 md:pb-0');
    expect(panel).toContain('order-5 overflow-hidden rounded-3xl border border-[#e0e8e1] bg-white md:order-1" aria-label="সাম্প্রতিক কাজের তালিকা"');
    expect(panel).toContain('order-3 sticky bottom-[76px] z-30 overflow-hidden rounded-[28px] border border-[#e7e7e7] bg-white');
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
  it("keeps the send action full-width and visible on mobile with a live explanation", () => {
    expect(panel).toContain('className="min-h-12 w-full shrink-0 rounded-full');
    expect(panel).toContain('sm:w-auto');
    expect(panel).toContain('aria-label={create.isPending ? "অনুরোধ পাঠানো হচ্ছে" : "AI-তে নির্দেশনা পাঠান"}');
    expect(panel).toContain('role="status" aria-live="polite"');
    expect(panel).toContain('পাঠাতে কমপক্ষে ৩টি অক্ষর লিখুন।');
  });

  it("supports Android WebViews without crypto.randomUUID and submits Enter without breaking Shift+Enter", () => {
    expect(panel).toContain("function createWorkDeskRequestId()");
    expect(panel).toContain('typeof cryptoApi?.randomUUID === "function"');
    expect(panel).toContain('typeof cryptoApi?.getRandomValues === "function"');
    expect(panel).toContain("createWorkDeskRequestId,");
    expect(panel).not.toContain("() => crypto.randomUUID()");
    expect(panel).toContain('event.currentTarget.form?.requestSubmit()');
    expect(panel).toContain('!event.shiftKey');
  });

});
