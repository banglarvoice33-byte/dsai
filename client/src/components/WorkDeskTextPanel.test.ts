import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const panel = readFileSync(new URL("./WorkDeskTextPanel.tsx", import.meta.url), "utf8");

describe("WorkDesk AI draft presentation", () => {
  it("labels generated results as drafts and asks users to verify them", () => {
    expect(panel).toContain("AI-তৈরি খসড়া · যাচাই প্রয়োজন");
    expect(panel).toContain("তথ্য, বানান ও গুরুত্বপূর্ণ সিদ্ধান্ত নিজে যাচাই করে নিন।");
  });

  it("allows the owner to edit and persist only the completed task result", () => {
    expect(panel).toContain("trpc.workDesk.saveTextTaskResult.useMutation");
    expect(panel).toContain("editedResult");
    expect(panel).toContain("খসড়া সংরক্ষণ");
    expect(panel).toContain("সম্পাদনা");
  });
});
