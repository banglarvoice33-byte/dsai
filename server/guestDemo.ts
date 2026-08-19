export type GuestDemoInput = { prompt: string; language: "bn" | "en" };

export type GuestDemoResult = {
  status: "ready" | "blocked";
  providerMode: "local-preview";
  remaining: number;
  title: string;
  summary: string;
  checklist: string[];
  draft: string;
  nextSteps: string[];
  warnings: string[];
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_PROMPT_LENGTH = 800;
const buckets = new Map<string, { startedAt: number; count: number }>();

const sensitivePattern = /(api[_ -]?key|secret|password|পাসওয়ার্ড|পাসওয়ার্ড|গোপন key|otp|one[- ]time password|token|private key)/i;
const harmfulPattern = /(malware|ransomware|credential theft|phishing|বোমা|অস্ত্র|হ্যাক|চুরি|ক্ষতিকর নির্দেশনা)/i;

function normalizePrompt(prompt: string) {
  return prompt.normalize("NFKC").trim().replace(/\s+/g, " ").slice(0, MAX_PROMPT_LENGTH);
}

function inferIntent(prompt: string) {
  if (/(ফর্ম|নোটিশ|সরকারি|কাগজ|document|form|notice)/i.test(prompt)) return "access";
  if (/(ভিডিও|ছবি|creative|প্রচার|design|campaign)/i.test(prompt)) return "creative";
  if (/(প্ল্যান|পরিকল্পনা|checklist|কাজ|plan|task)/i.test(prompt)) return "planning";
  return "general";
}

function getBucket(identity: string, now = Date.now()) {
  const current = buckets.get(identity);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    const next = { startedAt: now, count: 0 };
    buckets.set(identity, next);
    return next;
  }
  return current;
}

export function buildGuestDemo(input: GuestDemoInput, identity = "unknown", now = Date.now()): GuestDemoResult {
  const prompt = normalizePrompt(input.prompt);
  const bucket = getBucket(identity, now);
  if (bucket.count >= MAX_REQUESTS) {
    return {
      status: "blocked",
      providerMode: "local-preview",
      remaining: 0,
      title: input.language === "bn" ? "আজকের demo সীমা সাময়িকভাবে পূর্ণ" : "Demo limit reached for now",
      summary: input.language === "bn" ? "খরচ ও abuse নিয়ন্ত্রণের জন্য guest preview-তে প্রতি ১০ মিনিটে ৫টি request রাখা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন বা account তৈরি করুন।" : "Guest preview allows five requests per ten minutes to control cost and abuse. Try again later or create an account.",
      checklist: [],
      draft: "",
      nextSteps: ["/auth/login", "/scholarship"],
      warnings: ["rate-limit"],
    };
  }
  bucket.count += 1;

  if (prompt.length < 8) {
    return {
      status: "blocked",
      providerMode: "local-preview",
      remaining: MAX_REQUESTS - bucket.count,
      title: input.language === "bn" ? "আরও একটু লিখুন" : "Add a little more detail",
      summary: input.language === "bn" ? "আপনি কী করতে চান, কার জন্য এবং ফলাফলটি কেমন হওয়া উচিত—এই তিনটি বিষয় লিখলে ভালো preview পাবেন।" : "Tell us what you want to do, who it is for, and what a useful result should look like.",
      checklist: [],
      draft: "",
      nextSteps: ["একটি কাজ লিখুন", "ভাষা ও audience উল্লেখ করুন"],
      warnings: ["prompt-too-short"],
    };
  }

  if (sensitivePattern.test(prompt)) {
    return {
      status: "blocked",
      providerMode: "local-preview",
      remaining: MAX_REQUESTS - bucket.count,
      title: input.language === "bn" ? "গোপন তথ্য এখানে দেবেন না" : "Do not paste secrets here",
      summary: input.language === "bn" ? "API key, password, OTP, token বা private key guest demo-তে নেওয়া হয় না। এগুলো মুছে নিরাপদ, সাধারণ brief দিয়ে চেষ্টা করুন।" : "Guest demo does not accept API keys, passwords, OTPs, tokens, or private keys. Remove them and try a general brief instead.",
      checklist: [],
      draft: "",
      nextSteps: ["Sensitive data সরিয়ে আবার চেষ্টা করুন", "/privacy"],
      warnings: ["sensitive-input"]
    };
  }

  if (harmfulPattern.test(prompt)) {
    return {
      status: "blocked",
      providerMode: "local-preview",
      remaining: MAX_REQUESTS - bucket.count,
      title: input.language === "bn" ? "এই অনুরোধে সাহায্য করা যাবে না" : "This request cannot be supported",
      summary: input.language === "bn" ? "নিরাপদ, বৈধ এবং মানুষের উপকারে আসে—এমন কাজের brief দিয়ে চেষ্টা করুন।" : "Try a lawful, safe brief that supports a legitimate human need.",
      checklist: [],
      draft: "",
      nextSteps: ["নিরাপদ বিকল্প লিখুন", "/governance"],
      warnings: ["safety-boundary"]
    };
  }

  const intent = inferIntent(prompt);
  const bn = input.language === "bn";
  const checklist = bn
    ? ["উদ্দেশ্য ও audience স্পষ্ট করুন", "প্রয়োজনীয় source বা তথ্য আলাদা করুন", "একটি ছোট draft তৈরি করে review করুন", "বাইরে পাঠানোর আগে মানুষ দিয়ে যাচাই করুন"]
    : ["Clarify the objective and audience", "Separate the required sources or facts", "Create a small draft and review it", "Have a person verify it before sending externally"];
  const nextSteps = bn
    ? ["source যোগ করে draft refine করুন", "গুরুত্বপূর্ণ তথ্য double-check করুন", "প্রয়োজনে sign in করে Workdesk-এ চালিয়ে যান"]
    : ["Add sources and refine the draft", "Double-check important facts", "Sign in to continue in the Workdesk when needed"];
  const title = bn ? (intent === "creative" ? "একটি creative brief-এর শুরু" : intent === "access" ? "একটি সহজ access plan" : "আপনার কাজের একটি ছোট plan") : (intent === "creative" ? "A starting creative brief" : intent === "access" ? "A simple access plan" : "A small plan for your task");
  const summary = bn ? `আপনার brief-টি ${intent === "creative" ? "সৃজনশীল কাজ" : intent === "access" ? "তথ্য বোঝা ও access প্রস্তুতি" : "পরিকল্পনা ও drafting"}-এর সঙ্গে মেলে। এটি local preview—কোনো provider, account, file বা external action চালু হয়নি।` : `Your brief looks like ${intent === "creative" ? "a creative task" : intent === "access" ? "an information and access task" : "a planning and drafting task"}. This is a local preview; no provider, account, file, or external action was used.`;
  const draft = bn ? `কাজের উদ্দেশ্য: ${prompt}\n\nপ্রথম draft: লক্ষ্যটি ছোট ধাপে ভেঙে source যাচাই করে একটি reviewable output তৈরি করুন। গুরুত্বপূর্ণ সিদ্ধান্তে মানুষের অনুমোদন রাখুন।` : `Objective: ${prompt}\n\nFirst draft: Break the objective into small steps, verify sources, and create a reviewable output. Keep human approval for consequential decisions.`;

  return {
    status: "ready",
    providerMode: "local-preview",
    remaining: MAX_REQUESTS - bucket.count,
    title,
    summary,
    checklist,
    draft,
    nextSteps,
    warnings: [bn ? "AI বা preview output-এ ভুল থাকতে পারে—ব্যবহারের আগে যাচাই করুন।" : "AI or preview output may be wrong—verify before use."]
  };
}

export const guestDemoPolicy = {
  windowMinutes: WINDOW_MS / 60000,
  maxRequests: MAX_REQUESTS,
  maxPromptLength: MAX_PROMPT_LENGTH,
  persistence: "none",
  externalSideEffects: false,
} as const;
