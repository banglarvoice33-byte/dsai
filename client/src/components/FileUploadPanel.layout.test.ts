import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const panel = readFileSync(new URL("./FileUploadPanel.tsx", import.meta.url), "utf8");

describe("Work Desk saved documents responsive layout", () => {
  it("stacks file metadata and keeps action controls usable on narrow screens", () => {
    expect(panel).toContain('flex min-w-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between');
    expect(panel).toContain('flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end');
    expect(panel).toContain('break-words text-base font-medium');
    expect(panel).toContain('break-words text-sm text-muted-foreground');
  });

  it("keeps extraction and download restricted to files with a clean scan", () => {
    expect(panel).toContain('file.status === "ready" && supportedExtraction.has(file.mimeType)');
    expect(panel).toContain('file.status === "ready" && <Button size="sm" variant="outline"');
    expect(panel).toContain('file.status === "pending" && policy.data?.scannerAvailable');
  });

  it("provides a handoff action for extracted text", () => {
    expect(panel).toContain('onExtractedText(result.text || "")');
    expect(panel).toContain("এই লেখা দিয়ে কাজ করুন");
  });

  it("returns expired file-action sessions to login without losing the current route", () => {
    expect(panel).toContain("function redirectToLoginIfExpired(error: unknown)");
    expect(panel).toContain('window.location.assign(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)');
    expect(panel).toContain('if (initResponse.status === 401) throw new Error("login_required")');
    expect(panel).toContain('if (finalizeResponse.status === 401) throw new Error("login_required")');
    expect(panel).toContain('if (response.status === 401) throw new Error("login_required")');
    expect(panel).toContain("redirectToLoginIfExpired(error)");
  });
});
