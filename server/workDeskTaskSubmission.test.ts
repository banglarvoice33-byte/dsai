import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolveWorkDeskTaskSubmission } from "../shared/workDeskTaskSubmission";

const panel = readFileSync(new URL("../client/src/components/WorkDeskTextPanel.tsx", import.meta.url), "utf8");

describe("WorkDesk idempotent task submission", () => {
  it("reuses the same key when a transport-failed request is retried unchanged", () => {
    let generated = 0;
    const first = resolveWorkDeskTaskSubmission(
      null,
      { prompt: "  বাংলা কাজ  ", language: "bn" },
      () => { generated += 1; return "stable-idempotency-key-0001"; },
    );
    const replay = resolveWorkDeskTaskSubmission(
      first,
      { prompt: "বাংলা কাজ", language: "bn" },
      () => { generated += 1; return "unexpected-new-key-0002"; },
    );

    expect(first.prompt).toBe("বাংলা কাজ");
    expect(replay).toBe(first);
    expect(replay.idempotencyKey).toBe("stable-idempotency-key-0001");
    expect(generated).toBe(1);
  });

  it("creates a new key when prompt, language, or provider changes", () => {
    const original = resolveWorkDeskTaskSubmission(
      null,
      { prompt: "একই কাজ", language: "bn" },
      () => "original-idempotency-key-0001",
    );
    const changedPrompt = resolveWorkDeskTaskSubmission(
      original,
      { prompt: "পরিবর্তিত কাজ", language: "bn" },
      () => "changed-prompt-key-0002",
    );
    const changedLanguage = resolveWorkDeskTaskSubmission(
      original,
      { prompt: "একই কাজ", language: "en" },
      () => "changed-language-key-0003",
    );
    const changedProvider = resolveWorkDeskTaskSubmission(
      original,
      { prompt: "একই কাজ", language: "bn", provider: "openrouter" },
      () => "changed-provider-key-0004",
    );

    expect(changedPrompt.idempotencyKey).toBe("changed-prompt-key-0002");
    expect(changedLanguage.idempotencyKey).toBe("changed-language-key-0003");
    expect(changedProvider.idempotencyKey).toBe("changed-provider-key-0004");
  });

  it("keeps pending identity until success and wires the form through the resolver", () => {
    expect(panel).toContain("pendingSubmission");
    expect(panel).toContain("setPendingSubmission(submission)");
    expect(panel).toContain("setPendingSubmission(null)");
    expect(panel).toContain("resolveWorkDeskTaskSubmission(");
    expect(panel).toContain("createWorkDeskRequestId,");
  });
});
