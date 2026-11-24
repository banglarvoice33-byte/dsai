import type { AIHubCategoryId, AIHubPublicCategory } from "./aiHubPublicCatalog";

const CATEGORY_ALIASES: Partial<Record<AIHubCategoryId, string[]>> = {
  "llm-chat": ["chat", "chatbot", "assistant", "চ্যাট", "চ্যাটবট", "লেখা", "প্রশ্ন উত্তর", "lekha", "uttor", "proshno"],
  agents: ["agent", "agents", "automation assistant", "এজেন্ট", "স্বয়ংক্রিয় সহকারী", "sohojogi", "kajer bot"],
  "image-design": ["image", "picture", "photo", "design", "graphics", "ছবি", "ফটো", "নকশা", "লোগো", "chobi", "photo", "design", "logo"],
  video: ["video", "clip", "ভিডিও", "চলচ্চিত্র", "video", "clip"],
  "voice-speech": ["voice", "speech", "tts", "stt", "audio transcription", "কণ্ঠ", "ভয়েস", "কথা থেকে লেখা", "kotha", "voice", "audio"],
  "music-audio": ["music", "song", "sound", "গান", "সুর", "শব্দ", "gaan", "shur", "music"],
  "website-builders": ["website", "web builder", "site", "ওয়েবসাইট", "সাইট তৈরি", "website", "site", "web", "website toiri"],
  "hosting-deployment": ["hosting", "deploy", "domain", "হোস্টিং", "ডেপ্লয়", "hosting", "deploy", "domain", "site publish"],
  coding: ["code", "coding", "developer", "programming", "কোড", "প্রোগ্রামিং", "ডেভেলপমেন্ট", "code", "programming", "developer"],
  "research-search": ["research", "search", "browser", "গবেষণা", "অনুসন্ধান", "খোঁজ", "gobeshona", "khoj", "search"],
  automation: ["workflow", "automation", "integrations", "অটোমেশন", "কাজের ধাপ", "kaj auto", "automation", "workflow"],
  "document-ocr": ["document", "pdf", "ocr", "scan", "নথি", "পিডিএফ", "স্ক্যান", "nothi", "pdf", "scan"],
  translation: ["translate", "translation", "language", "অনুবাদ", "ভাষা", "onubad", "translate"],
  "vector-knowledge": ["vector", "embedding", "knowledge base", "database", "ভেক্টর", "জ্ঞানভান্ডার", "vector", "database", "knowledge base"],
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

/** Match every query term, allowing terms to appear in different aliases/description fields. */
function matchesAllTerms(searchableText: string, terms: string[]): boolean {
  const normalizedText = normalize(searchableText);
  return terms.every(term => normalizedText.includes(term));
}

/** Keyword search with curated Bangla, Banglish and English aliases; not semantic AI search. */
export function filterAIHubCategories(
  categories: AIHubPublicCategory[],
  query: string,
  selected: AIHubCategoryId | "all" = "all",
): AIHubPublicCategory[] {
  const needle = normalize(query);
  const terms = needle.split(/\s+/).filter(Boolean);

  return categories
    .filter(category => selected === "all" || category.id === selected)
    .map(category => {
      if (terms.length === 0) return category;
      const categoryText = [
        category.name,
        category.description,
        ...(CATEGORY_ALIASES[category.id] ?? []),
      ].join(" ");
      const categoryMatches = matchesAllTerms(categoryText, terms);
      const providers = category.providers.filter(provider => categoryMatches || matchesAllTerms([
        provider.name,
        provider.purpose,
        ...(PROVIDER_ALIASES[provider.id] ?? []),
      ].join(" "), terms));
      return { ...category, providers };
    })
    .filter(category => category.providers.length > 0);
}
