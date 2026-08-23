import { describe, expect, it } from "vitest";
import { buildLeadExportRows } from "@shared/leadExport";

describe("lead draft Excel export", () => {
  it("exports only draft fields and marks outbound sending as disabled", () => {
    const rows = buildLeadExportRows({
      marketId: "ca", targetCountry: "Canada", targetLanguage: "English (Canada)", industry: "Education",
      businessStage: "Growing business", leadGoal: "Introduction", audience: "community members",
      workingRegion: "Toronto", tone: "professional", channel: "email", sourceLanguage: "bn",
      brief: "একটি workshop-এর কথা জানাতে চাই", subject: "Workshop invitation", greeting: "Hello",
      body: "A draft message", callToAction: "Reply if useful", optOutLine: "You can opt out anytime",
      qualityNote: "Review locally before use",
    });
    expect(rows).toContainEqual(["Outbound send allowed", "No"]);
    expect(rows).not.toContainEqual(expect.arrayContaining(["API key"]));
  });

  it("escapes formula-leading user text", () => {
    const rows = buildLeadExportRows({
      marketId: "x", targetCountry: "=HYPERLINK(\"https://example.com\")", targetLanguage: "en", industry: "Education",
      businessStage: "New idea", leadGoal: "Introduction", audience: "@audience", workingRegion: "-region",
      tone: "warm", channel: "email", sourceLanguage: "auto", brief: "+formula", subject: "subject", greeting: "hello",
      body: "body", callToAction: "cta", optOutLine: "opt out", qualityNote: "note",
    });
    expect(rows.find(([key]) => key === "Target country")?.[1]).toMatch(/^'/);
    expect(rows.find(([key]) => key === "Brief")?.[1]).toMatch(/^'/);
  });
});
