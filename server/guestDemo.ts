export type GuestDemoInput = { prompt: string; language: "bn" | "en" };

export type GuestDemoResult = {
  status: "ready" | "blocked";
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
      title: input.language === "bn" ? "এখন একটু বিরতি নিন" : "Please try again later",
      summary: input.language === "bn" ? "এই মুহূর্তে নমুনা তৈরি করা যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন অথবা অ্যাকাউন্ট খুলে কাজ চালিয়ে যান।" : "A sample cannot be created right now. Try again later or create an account.",
      checklist: [],
      draft: "",
      nextSteps: ["/auth/login"],
      warnings: [input.language === "bn" ? "কিছুক্ষণ পরে আবার চেষ্টা করুন।" : "Please try again later."],
    };
  }
  bucket.count += 1;

  if (prompt.length < 8) {
    return {
      status: "blocked",
      title: input.language === "bn" ? "আরও একটু লিখুন" : "Add a little more detail",
      summary: input.language === "bn" ? "আপনি কী করতে চান, কার জন্য এবং কেমন ফল চান—এই বিষয়গুলো একটু বিস্তারিত লিখুন।" : "Add a little detail about what you want to do, who it is for, and the result you need.",
      checklist: [],
      draft: "",
      nextSteps: [input.language === "bn" ? "আপনার কাজের বর্ণনা বিস্তারিত করুন" : "Add more detail to your request"],
      warnings: [input.language === "bn" ? "আপনার কাজের বর্ণনা আরও বিস্তারিত লিখুন।" : "Please add more detail."],
    };
  }

  if (sensitivePattern.test(prompt)) {
    return {
      status: "blocked",
      title: input.language === "bn" ? "গোপন তথ্য দেবেন না" : "Do not share sensitive information",
      summary: input.language === "bn" ? "পাসওয়ার্ড, OTP বা ব্যক্তিগত গোপন তথ্য সরিয়ে সাধারণ বর্ণনা দিয়ে আবার চেষ্টা করুন।" : "Remove passwords, OTPs, or private information and try again with a general description.",
      checklist: [],
      draft: "",
      nextSteps: [input.language === "bn" ? "গোপন তথ্য সরিয়ে আবার চেষ্টা করুন" : "Remove sensitive information and try again"],
      warnings: [input.language === "bn" ? "গোপন তথ্য সরিয়ে আবার চেষ্টা করুন।" : "Remove sensitive information and try again."]
    };
  }

  if (harmfulPattern.test(prompt)) {
    return {
      status: "blocked",
      title: input.language === "bn" ? "এই অনুরোধে সহায়তা করা যাচ্ছে না" : "This request cannot be supported",
      summary: input.language === "bn" ? "নিরাপদ ও বৈধ কাজের বর্ণনা লিখে আবার চেষ্টা করুন।" : "Try again with a safe and lawful request.",
      checklist: [],
      draft: "",
      nextSteps: [input.language === "bn" ? "নিরাপদ বিকল্প লিখুন" : "Try a safe alternative"],
      warnings: [input.language === "bn" ? "নিরাপদ ও বৈধ বিকল্প বেছে নিন।" : "Choose a safe and lawful alternative."]
    };
  }

  const intent = inferIntent(prompt);
  const bn = input.language === "bn";
  const checklist = bn
    ? ["কাজের উদ্দেশ্য স্পষ্ট করুন", "প্রয়োজনীয় তথ্য সংগ্রহ করুন", "খসড়া পড়ে সংশোধন করুন", "ব্যবহারের আগে গুরুত্বপূর্ণ তথ্য যাচাই করুন"]
    : ["Clarify the goal", "Gather the information you need", "Review and edit the draft", "Verify important details before use"];
  const nextSteps = bn
    ? ["প্রয়োজনীয় তথ্য যোগ করুন", "গুরুত্বপূর্ণ বিষয় যাচাই করুন", "প্রয়োজনে প্রবেশ করে কাজ চালিয়ে যান"]
    : ["Add the information you need", "Verify important details", "Sign in to continue when needed"];
  const title = bn ? (intent === "creative" ? "সৃজনশীল কাজের খসড়া" : intent === "access" ? "সরকারি তথ্য বোঝার খসড়া" : "আপনার কাজের প্রাথমিক পরিকল্পনা") : (intent === "creative" ? "A creative task draft" : intent === "access" ? "A guide to understanding information" : "A first plan for your task");
  const summary = bn ? "আপনার বর্ণনা অনুযায়ী একটি প্রাথমিক খসড়া তৈরি হয়েছে। ব্যবহারের আগে প্রয়োজনমতো সম্পাদনা করুন এবং গুরুত্বপূর্ণ তথ্য যাচাই করুন।" : "A first draft has been prepared from your description. Edit it as needed and verify important information before use.";
  const draft = bn ? `কাজের উদ্দেশ্য: ${prompt}\n\nপ্রাথমিক খসড়া: কাজটি কয়েকটি সহজ ধাপে ভাগ করুন। প্রয়োজনীয় তথ্য যাচাই করে পরবর্তী পদক্ষেপ ঠিক করুন।` : `Objective: ${prompt}\n\nFirst draft: Break the task into simple steps, verify important information, and decide what to do next.`;

  return {
    status: "ready",
    title,
    summary,
    checklist,
    draft,
    nextSteps,
    warnings: [bn ? "এআই-এর তৈরি তথ্য ভুল হতে পারে—ব্যবহারের আগে যাচাই করুন।" : "AI-generated information may be wrong. Verify it before use."]
  };
}

export const guestDemoPolicy = {
  windowMinutes: WINDOW_MS / 60000,
  maxRequests: MAX_REQUESTS,
  maxPromptLength: MAX_PROMPT_LENGTH,
  persistence: "none",
  externalSideEffects: false,
} as const;
