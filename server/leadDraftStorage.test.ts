import { describe, expect, it } from "vitest";
import {
  MAX_SAVED_LEAD_DRAFTS,
  parseSavedLeadDrafts,
  removeLeadDraft,
  saveLeadDraft,
  serializeSavedLeadDrafts,
  type SavedLeadDraft,
} from "../shared/leadDraftStorage";

const draft = (id: string): SavedLeadDraft => ({
  id,
  savedAt: "2026-09-03T00:00:00.000Z",
  marketId: "bd",
  targetCountry: "Bangladesh",
  targetLanguage: "Bengali",
  industry: "Education",
  businessStage: "Growing business",
  leadGoal: "Introduction",
  audience: "students",
  workingRegion: "Dhaka",
  tone: "professional",
  channel: "email",
  sourceLanguage: "bn",
  brief: "একটি সংক্ষিপ্ত পরিচিতি",
  offer: "ডেমো",
  draft: {
    detectedSourceLanguage: "Bengali",
    targetLanguage: "Bengali",
    subject: "ডেমো",
    greeting: "হ্যালো",
    body: "মূল বার্তা",
    callToAction: "ডেমো দেখুন",
    optOutLine: "যোগাযোগ বন্ধ করতে জানান",
    qualityNote: "মানব review প্রয়োজন",
  },
});

describe("lead draft storage", () => {
  it("round-trips valid drafts and rejects malformed storage", () => {
    const encoded = serializeSavedLeadDrafts([draft("one")]);
    expect(parseSavedLeadDrafts(encoded)).toEqual([draft("one")]);
    expect(parseSavedLeadDrafts("not-json")).toEqual([]);
    expect(parseSavedLeadDrafts(JSON.stringify([{ id: "missing-fields" }]))).toEqual([]);
  });

  it("keeps newest drafts first and caps the local library", () => {
    let drafts = Array.from({ length: MAX_SAVED_LEAD_DRAFTS + 2 }, (_, index) => draft(String(index)));
    drafts = saveLeadDraft([], drafts[0]!);
    for (const item of Array.from({ length: MAX_SAVED_LEAD_DRAFTS + 1 }, (_, index) => draft(String(index + 1)))) {
      drafts = saveLeadDraft(drafts, item);
    }
    expect(drafts).toHaveLength(MAX_SAVED_LEAD_DRAFTS);
    expect(drafts[0]?.id).toBe(String(MAX_SAVED_LEAD_DRAFTS + 1));
  });

  it("replaces a draft by id and removes only the selected item", () => {
    const replacement = { ...draft("one"), brief: "updated" };
    const updated = saveLeadDraft([draft("one"), draft("two")], replacement);
    expect(updated).toHaveLength(2);
    expect(updated[0]?.brief).toBe("updated");
    expect(removeLeadDraft(updated, "one").map(item => item.id)).toEqual(["two"]);
  });
});
