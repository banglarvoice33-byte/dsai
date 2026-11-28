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
});
