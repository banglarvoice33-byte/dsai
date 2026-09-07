import type { LocalizedLeadDraft } from "./multilingualLead";

export const LEAD_DRAFT_STORAGE_KEY = "dsai.lead-drafts.v1";
export const MAX_SAVED_LEAD_DRAFTS = 12;

export type SavedLeadDraft = {
  id: string;
  savedAt: string;
  marketId: string;
  targetCountry: string;
  targetLanguage: string;
  industry: string;
  businessStage: string;
  leadGoal: string;
  audience: string;
  workingRegion: string;
  tone: string;
  channel: string;
  sourceLanguage: string;
  brief: string;
  offer: string;
  draft: LocalizedLeadDraft;
};

export function parseSavedLeadDrafts(raw: string | null): SavedLeadDraft[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(isSavedLeadDraft).slice(0, MAX_SAVED_LEAD_DRAFTS);
  } catch {
    return [];
  }
}

export function serializeSavedLeadDrafts(drafts: SavedLeadDraft[]): string {
  return JSON.stringify(drafts.slice(0, MAX_SAVED_LEAD_DRAFTS));
}

export function saveLeadDraft(drafts: SavedLeadDraft[], draft: SavedLeadDraft): SavedLeadDraft[] {
  return [draft, ...drafts.filter(item => item.id !== draft.id)].slice(0, MAX_SAVED_LEAD_DRAFTS);
}

export function removeLeadDraft(drafts: SavedLeadDraft[], id: string): SavedLeadDraft[] {
  return drafts.filter(item => item.id !== id);
}

function isSavedLeadDraft(value: unknown): value is SavedLeadDraft {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SavedLeadDraft>;
  return typeof item.id === "string" && typeof item.savedAt === "string" && typeof item.brief === "string" && typeof item.offer === "string" && Boolean(item.draft) && typeof item.draft === "object";
}
