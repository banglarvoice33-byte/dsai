import { invokeLLM } from "./_core/llm";
import {
  localizedLeadDraftSchema,
  type LocalizedLeadDraft,
  type MultilingualLeadInput,
  type MultilingualLeadResult,
} from "@shared/multilingualLead";
import { generateStructuredJson, hasExternalAiProvider } from "./externalAi";

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
    required: [
      "detectedSourceLanguage",
      "targetLanguage",
      "subject",
      "greeting",
      "body",
      "callToAction",
      "optOutLine",
      "qualityNote",
    ],
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

const fallbackGreeting: Record<string, string> = {
  bn: "আসসালামু আলাইকুম / শুভেচ্ছা,",
  en: "Hello,",
  hi: "नमस्ते,",
  ur: "السلام علیکم،",
  ar: "مرحباً،",
  fr: "Bonjour,",
  es: "Hola,",
  de: "Guten Tag,",
  it: "Buongiorno,",
  pt: "Olá,",
};

function languageKey(language: string): string {
  const value = language.toLocaleLowerCase();
  for (const key of Object.keys(fallbackGreeting)) {
    if (value === key || value.startsWith(`${key}-`) || value.includes(key)) return key;
  }
  return "en";
}

function fallbackDraft(input: MultilingualLeadInput): LocalizedLeadDraft {
  const key = languageKey(input.targetLanguage);
  const greeting = fallbackGreeting[key];
  const subject = key === "bn" ? "আপনার প্রয়োজন নিয়ে একটি সংক্ষিপ্ত প্রস্তাব" : "A concise proposal for your needs";
  // The UI renders the greeting separately, so keep it out of the body.
  // A deterministic fallback is a template, not a translation or human review.
  const body = key === "bn"
    ? `আপনার ${input.audience}-এর জন্য ${input.industry} বিষয়ে ${input.offer} নিয়ে একটি ${input.leadGoal}-ভিত্তিক draft তৈরি করা হয়েছে। ${input.workingRegion}-এর প্রেক্ষাপটে আপনার সুবিধামতো সময় জানালে আমরা পরবর্তী তথ্য ভাগ করতে পারি।`
    : `We prepared a concise ${input.leadGoal.toLowerCase()} draft for ${input.audience} in ${input.industry} at the ${input.businessStage.toLowerCase()} stage. The offer is: ${input.offer}. Context: ${input.brief}. This is intended for ${input.workingRegion}; if relevant, please share a convenient time for the next step.`;
  const callToAction = key === "bn" ? "আপনি আগ্রহী হলে একটি সুবিধাজনক সময় বা পরবর্তী প্রশ্ন জানাবেন।" : "If relevant, please reply with a convenient time or your next question.";
  const optOutLine = key === "bn" ? "আর কোনো যোগাযোগ না চাইলে শুধু ‘বন্ধ’ লিখে জানাবেন।" : "If you do not want further contact, reply with ‘unsubscribe’.";

  return localizedLeadDraftSchema.parse({
    detectedSourceLanguage: detectSourceLanguage(input.brief),
    targetLanguage: input.targetLanguage,
    subject,
    greeting,
    body,
    callToAction,
    optOutLine,
    qualityNote: key === "bn"
      ? "নির্ধারিত fallback template ব্যবহার হয়েছে; এটি source brief-এর অনুবাদ নয়। ব্যবহারের আগে দক্ষ ভাষাভাষী ব্যক্তিকে দিয়ে অনুবাদ ও যাচাই করান।"
      : "Deterministic fallback template used; this is not a translation of the source brief or a human-reviewed draft. Have a fluent human translate and review it before use.",
  });
}

function textFromContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((part): part is { type: "text"; text: string } => typeof part === "object" && part !== null && (part as { type?: unknown }).type === "text" && typeof (part as { text?: unknown }).text === "string")
      .map(part => part.text)
      .join("\n");
  }
  return "";
}

export async function composeMultilingualLead(input: MultilingualLeadInput): Promise<MultilingualLeadResult> {
  const fallback = fallbackDraft(input);

  try {
    const system = "You create consent-based lead drafts only. Never claim that a message was sent. Preserve the user's meaning, avoid sensitive inferences, avoid discriminatory targeting, include a respectful opt-out line, and return JSON matching the schema. The result must be a draft for human review, not an instruction to automate outreach.";
    const user = JSON.stringify({
      task: "Create a localized lead draft.",
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
      constraints: ["No false claims", "No unsolicited sending", "Use target language", "Include opt-out", "Keep under 180 words unless necessary", "Do not invent company facts, contacts, or legal claims"],
    });
    const response = hasExternalAiProvider()
      ? await generateStructuredJson({ system, user, schema: outputSchema.schema, maxOutputTokens: 1200 })
      : await invokeLLM({ model: "gpt-5-mini", messages: [{ role: "system", content: system }, { role: "user", content: user }], outputSchema, maxTokens: 1200 });

    const raw = "text" in response ? response.text : textFromContent((response as Awaited<ReturnType<typeof invokeLLM>>).choices[0]?.message?.content);
    const parsed = localizedLeadDraftSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { source: "fallback", model: null, country: input.targetCountry, language: input.targetLanguage, tone: input.tone, channel: input.channel, draft: fallback, outboundSendAllowed: false, humanReviewRequired: true };

    return { source: "ai", model: response.model || "gpt-5-mini", country: input.targetCountry, language: input.targetLanguage, tone: input.tone, channel: input.channel, draft: parsed.data, outboundSendAllowed: false, humanReviewRequired: true };
  } catch {
    return { source: "fallback", model: null, country: input.targetCountry, language: input.targetLanguage, tone: input.tone, channel: input.channel, draft: fallback, outboundSendAllowed: false, humanReviewRequired: true };
  }
}
