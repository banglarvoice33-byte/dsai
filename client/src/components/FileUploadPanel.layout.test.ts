import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const panel = readFileSync(new URL("./FileUploadPanel.tsx", import.meta.url), "utf8");

describe("Work Desk saved documents responsive layout", () => {
  it("stacks file metadata and wraps actions on narrow screens", () => {
    expect(panel).toContain('flex min-w-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between');
    expect(panel).toContain('flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end');
    expect(panel).toContain('break-words text-sm text-muted-foreground');
  });

  it("keeps extraction and download actions limited to ready files", () => {
    expect(panel).toContain('file.status === "ready" && supportedExtraction.has(file.mimeType)');
    expect(panel).toContain('file.status === "ready" && <Button size="sm" variant="outline"');
    expect(panel).toContain('file.status === "pending" && policy.data?.scannerAvailable');
  });
});
