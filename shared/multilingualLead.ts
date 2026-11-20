import { z } from "zod";

export const leadToneSchema = z.enum(["professional", "warm", "concise", "community"]);
export const leadChannelSchema = z.enum(["email", "sms", "social-dm", "phone-script"]);

export const multilingualLeadInputSchema = z.object({
  brief: z.string().trim().min(3).max(1600),
  sourceLanguage: z.string().trim().min(1).max(80).default("auto"),
  targetCountry: z.string().trim().min(2).max(80),
  targetLanguage: z.string().trim().min(2).max(80),
  tone: leadToneSchema.default("professional"),
  channel: leadChannelSchema.default("email"),
  audience: z.string().trim().min(2).max(160),
  industry: z.string().trim().min(2).max(80),
  businessStage: z.string().trim().min(2).max(80),
  leadGoal: z.string().trim().min(2).max(80),
  offer: z.string().trim().min(2).max(500),
  workingRegion: z.string().trim().min(2).max(160),
  consentToDraft: z.literal(true),
});

export type MultilingualLeadInput = z.infer<typeof multilingualLeadInputSchema>;

export const localizedLeadDraftSchema = z.object({
  detectedSourceLanguage: z.string().trim().min(1).max(80),
  targetLanguage: z.string().trim().min(1).max(80),
  subject: z.string().trim().min(1).max(240),
  greeting: z.string().trim().min(1).max(240),
  body: z.string().trim().min(1).max(4000),
  callToAction: z.string().trim().min(1).max(500),
  optOutLine: z.string().trim().min(1).max(500),
  qualityNote: z.string().trim().min(1).max(1000),
});

export type LocalizedLeadDraft = z.infer<typeof localizedLeadDraftSchema>;

type MultilingualLeadContext = {
  model: string | null;
  country: string;
  language: string;
  tone: z.infer<typeof leadToneSchema>;
  channel: z.infer<typeof leadChannelSchema>;
  outboundSendAllowed: false;
};

export type MultilingualLeadResult =
  | (MultilingualLeadContext & {
      source: "ai";
      model: string;
      draft: LocalizedLeadDraft;
      humanReviewRequired: true;
    })
  | (MultilingualLeadContext & {
      source: "unavailable";
      model: null;
      reason: "provider_disabled" | "provider_unavailable" | "invalid_model_output" | "daily_limit_reached" | "quota_unavailable" | "request_already_used";
      message: string;
      humanReviewRequired: false;
    });
