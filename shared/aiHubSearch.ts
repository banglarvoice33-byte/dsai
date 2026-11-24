import type { AIHubCategoryId, AIHubPublicCategory } from "./aiHubPublicCatalog";

const CATEGORY_ALIASES: Partial<Record<AIHubCategoryId, string[]>> = {
  "llm-chat": ["chat", "chatbot", "assistant", "চ্যাট", "চ্যাটবট", "লেখা", "প্রশ্ন উত্তর"],
  agents: ["agent", "agents", "automation assistant", "এজেন্ট", "স্বয়ংক্রিয় সহকারী"],
  "image-design": ["image", "picture", "photo", "design", "graphics", "ছবি", "ফটো", "নকশা", "লোগো"],
  video: ["video", "clip", "ভিডিও", "চলচ্চিত্র"],
  "voice-speech": ["voice", "speech", "tts", "stt", "audio transcription", "কণ্ঠ", "ভয়েস", "কথা থেকে লেখা"],
  "music-audio": ["music", "song", "sound", "গান", "সুর", "শব্দ"],
  "website-builders": ["website", "web builder", "site", "ওয়েবসাইট", "সাইট তৈরি"],
  "hosting-deployment": ["hosting", "deploy", "domain", "হোস্টিং", "ডেপ্লয়"],
  coding: ["code", "coding", "developer", "programming", "কোড", "প্রোগ্রামিং", "ডেভেলপমেন্ট"],
  "research-search": ["research", "search", "browser", "গবেষণা", "অনুসন্ধান", "খোঁজ"],
  automation: ["workflow", "automation", "integrations", "অটোমেশন", "কাজের ধাপ"],
  "document-ocr": ["document", "pdf", "ocr", "scan", "নথি", "পিডিএফ", "স্ক্যান"],
  translation: ["translate", "translation", "language", "অনুবাদ", "ভাষা"],
  "vector-knowledge": ["vector", "embedding", "knowledge base", "database", "ভেক্টর", "জ্ঞানভান্ডার"],
};

const PROVIDER_ALIASES: Record<string, string[]> = {
  chatgpt: ["gpt", "openai chat", "চ্যাটজিপিটি"],
  "openai-platform": ["openai api", "api platform", "এপিআই"],
  claude: ["anthropic", "ক্লড"],
  gemini: ["google ai", "জেমিনি"],
  deepseek: ["ডিপসিক"],
  canva: ["ক্যানভা", "poster maker"],
  "adobe-firefly": ["firefly", "অ্যাডোবি"],
  "google-stt": ["speech to text", "কথা লিখুন"],
  elevenlabs: ["eleven labs", "ভয়েস জেনারেটর"],
  suno: ["সুনো", "ai song"],
  runway: ["রানওয়ে", "video generator"],
  "n8n-agent": ["এন এইট এন", "workflow automation"],
};

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, " ").trim();
}

/** Keyword search with curated Bangla, Banglish and English aliases; not semantic AI search. */
export function filterAIHubCategories(
  categories: AIHubPublicCategory[],
  query: string,
  selected: AIHubCategoryId | "all" = "all",
): AIHubPublicCategory[] {
  const needle = normalize(query);
  return categories
    .filter(category => selected === "all" || category.id === selected)
    .map(category => {
      if (!needle) return category;
      const categoryText = normalize([
        category.name,
        category.description,
        ...(CATEGORY_ALIASES[category.id] ?? []),
      ].join(" "));
      const categoryMatches = categoryText.includes(needle);
      const providers = category.providers.filter(provider => categoryMatches || normalize([
        provider.name,
        provider.purpose,
        ...(PROVIDER_ALIASES[provider.id] ?? []),
      ].join(" ")).includes(needle));
      return { ...category, providers };
    })
    .filter(category => category.providers.length > 0);
}
