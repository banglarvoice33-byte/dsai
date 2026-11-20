import {
  localizedLeadDraftSchema,
  type MultilingualLeadInput,
  type MultilingualLeadResult,
} from "@shared/multilingualLead";
import { finalizeLeadAIUsage, reserveLeadAIUsage } from "./db";
import { runAIProvider } from "./aiProviders";

const outputSchema = {
  name: "localized_lead_draft",
  strict: true,
  schema: {
    type: "object",
    properties: {
      detectedSourceLanguage: { type: "string" },
      targetLanguage: { type: "string" },
      subject: { type: "string" },
      greeting: { type: "string" },
      body: { type: "string" },
      callToAction: { type: "string" },
      optOutLine: { type: "string" },
      qualityNote: { type: "string" },
    },
    required: ["detectedSourceLanguage", "targetLanguage", "subject", "greeting", "body", "callToAction", "optOutLine", "qualityNote"],
    additionalProperties: false,
  },
} as const;

function hasCodePointInRange(text: string, start: number, end: number): boolean {
  for (const character of Array.from(text)) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint >= start && codePoint <= end) return true;
  }
  return false;
}

function detectSourceLanguage(text: string): string {
  if (hasCodePointInRange(text, 0x0980, 0x09ff)) return "Bengali";
  if (hasCodePointInRange(text, 0x0900, 0x097f)) return "Hindi or related Devanagari language";
  if (hasCodePointInRange(text, 0x0600, 0x06ff)) return "Arabic-script language";
  if (hasCodePointInRange(text, 0x0400, 0x04ff)) return "Cyrillic-script language";
  if (hasCodePointInRange(text, 0x4e00, 0x9fff)) return "Chinese or related Han-script language";
  if (/[A-Za-z]/.test(text)) return "English or Latin-script language";
  return "Unknown; verify before sending";
}

function unavailable(
  input: MultilingualLeadInput,
  reason: "provider_disabled" | "provider_unavailable" | "invalid_model_output" | "daily_limit_reached" | "quota_unavailable" | "request_already_used",
): MultilingualLeadResult {
  const messages = {
    provider_disabled: "AI খসড়া তৈরির সেবা বর্তমানে সক্রিয় নয়। কোনো নমুনা বা বানানো খসড়া দেখানো হয়নি। পরে আবার চেষ্টা করুন।",
    provider_unavailable: "AI সেবা এই মুহূর্তে পাওয়া যাচ্ছে না। আপনার দেওয়া তথ্য অপরিবর্তিত আছে; কোনো খসড়া তৈরি বা পাঠানো হয়নি। পরে আবার চেষ্টা করুন।",
    invalid_model_output: "AI সেবা থেকে যাচাইযোগ্য খসড়া পাওয়া যায়নি। কোনো বিকল্প বা বানানো বার্তা দেখানো হয়নি। আবার চেষ্টা করুন।",
    daily_limit_reached: "আজকের সর্বোচ্চ ২০টি AI খসড়া তৈরির সীমা শেষ হয়েছে। UTC দিনের পর আবার চেষ্টা করুন।",
    quota_unavailable: "AI ব্যবহারের দৈনিক সীমা যাচাই করা যাচ্ছে না। নিরাপত্তার জন্য এখন খসড়া তৈরি বন্ধ রাখা হয়েছে। পরে আবার চেষ্টা করুন।",
    request_already_used: "এই অনুরোধটি আগে ব্যবহার করা হয়েছে। নতুন করে চেষ্টা করতে আবার তৈরি বাটনে চাপ দিন।",
  } as const;

  return {
    source: "unavailable",
    model: null,
    country: input.targetCountry,
    language: input.targetLanguage,
    tone: input.tone,
    channel: input.channel,
    outboundSendAllowed: false,
    humanReviewRequired: false,
    reason,
    message: messages[reason],
  };
}

function normalizeLanguage(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

/**
 * Uses only the configured OpenRouter model provider. It reserves a daily
 * per-owner quota before spending provider tokens and records success/failure.
 * Provider failure or invalid output never becomes a fabricated fallback draft.
 */
export async function composeMultilingualLead(
  input: MultilingualLeadInput,
  userId: number,
  requestId: string,
): Promise<MultilingualLeadResult> {
  if (process.env.AI_PROVIDERS_ENABLED !== "true") {
    return unavailable(input, "provider_disabled");
  }

  let reserved = false;
  try {
    const quota = await reserveLeadAIUsage(userId, requestId);
    if (!quota?.ok) {
      if (quota?.reason === "daily_limit_reached") return unavailable(input, "daily_limit_reached");
      if (quota?.reason === "request_already_used") return unavailable(input, "request_already_used");
      return unavailable(input, "quota_unavailable");
    }
    reserved = true;

    const system = [
      "You create consent-based lead drafts only.",
      "Preserve the user's meaning and use the exact requested target language.",
      "Do not invent company facts, contact details, prices, legal claims, dates, or evidence.",
      "Include a respectful opt-out line. Do not claim a message was sent.",
      "Return only JSON matching the supplied schema. The result is a draft for human review.",
    ].join(" ");

    const user = JSON.stringify({
      task: "Create one localized lead draft from the supplied brief.",
      inputLanguage: input.sourceLanguage,
      targetCountry: input.targetCountry,
      targetLanguage: input.targetLanguage,
      tone: input.tone,
      channel: input.channel,
      audience: input.audience,
      brief: input.brief,
      detectedSourceLanguage: detectSourceLanguage(input.brief),
      industry: input.industry,
      businessStage: input.businessStage,
      leadGoal: input.leadGoal,
      offer: input.offer,
      workingRegion: input.workingRegion,
      constraints: [
        "No false claims",
        "No unsolicited sending",
        "Use the exact target language",
        "Include an opt-out line",
        "Keep the draft concise",
        "Do not invent facts absent from the brief",
      ],
    });

    const response = await runAIProvider({
      provider: "openrouter",
      messages: [
        { role: "system", content: system + " Return only a JSON object matching: " + JSON.stringify(outputSchema.schema) },
        { role: "user", content: user },
      ],
      maxTokens: Math.min(Math.max(Number(process.env.AI_MAX_OUTPUT_TOKENS) || 1000, 1), 1200),
      timeoutMs: Math.min(Math.max(Number(process.env.AI_TIMEOUT_MS) || 8000, 1000), 30000),
      requestIdentity: String(userId),
      responseFormat: { type: "json_object" },
    });

    if (!response.text?.trim() || !response.model?.trim()) {
      const finalized = await finalizeLeadAIUsage(userId, requestId, false, null);
      reserved = false;
      return unavailable(input, finalized ? "invalid_model_output" : "quota_unavailable");
    }

    let candidate: unknown;
    try {
      candidate = JSON.parse(response.text);
    } catch {
      const finalized = await finalizeLeadAIUsage(userId, requestId, false, response.model);
      reserved = false;
      return unavailable(input, finalized ? "invalid_model_output" : "quota_unavailable");
    }

    const parsed = localizedLeadDraftSchema.safeParse(candidate);
    if (!parsed.success || normalizeLanguage(parsed.data.targetLanguage) !== normalizeLanguage(input.targetLanguage)) {
      const finalized = await finalizeLeadAIUsage(userId, requestId, false, response.model);
      reserved = false;
      return unavailable(input, finalized ? "invalid_model_output" : "quota_unavailable");
    }

    const wordCount = parsed.data.body.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 220) {
      const finalized = await finalizeLeadAIUsage(userId, requestId, false, response.model);
      reserved = false;
      return unavailable(input, finalized ? "invalid_model_output" : "quota_unavailable");
    }

    const finalized = await finalizeLeadAIUsage(userId, requestId, true, response.model);
    reserved = false;
    if (!finalized) return unavailable(input, "quota_unavailable");

    return {
      source: "ai",
      model: response.model,
      country: input.targetCountry,
      language: input.targetLanguage,
      tone: input.tone,
      channel: input.channel,
      draft: parsed.data,
      outboundSendAllowed: false,
      humanReviewRequired: true,
    };
  } catch {
    if (reserved) {
      try {
        const finalized = await finalizeLeadAIUsage(userId, requestId, false, null);
        if (!finalized) return unavailable(input, "quota_unavailable");
      } catch {
        return unavailable(input, "quota_unavailable");
      }
    }
    return unavailable(input, "provider_unavailable");
  }
}
