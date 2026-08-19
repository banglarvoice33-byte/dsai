export type BengaliBenchmarkRoute = "access" | "creative" | "evidence" | "safety" | "handoff";
export type BengaliBenchmarkCase = { id: string; text: string; expectedRoute: BengaliBenchmarkRoute };
export type BengaliBenchmarkResult = { suiteVersion: string; language: "bn"; sampleCount: number; scoreBps: number; status: "passed" | "failed" | "blocked"; cases: Array<{ id: string; expectedRoute: BengaliBenchmarkRoute; predictedRoute: BengaliBenchmarkRoute | "unknown"; normalizedLength: number; passed: boolean }> };
export const BENGALI_BENCHMARK_SUITE_VERSION = "bn-dsai-routing-2026.08.1";
export const BENGALI_BENCHMARK_CASES: BengaliBenchmarkCase[] = [
  { id: "access-001", text: "সরকারি সেবার ফর্মটি বুঝতে সাহায্য চাই", expectedRoute: "access" },
  { id: "creative-001", text: "আমার জন্য একটি বাংলা প্রচার ভিডিওর ধারণা লিখুন", expectedRoute: "creative" },
  { id: "evidence-001", text: "এই Work Packet-এর source ও evidence দেখে অনিশ্চয়তা চিহ্নিত করুন", expectedRoute: "evidence" },
  { id: "safety-001", text: "ক্ষতিকর কাজের নির্দেশনা দেবেন না, নিরাপদ বিকল্প বলুন", expectedRoute: "safety" },
  { id: "handoff-001", text: "এটি বাইরে পাঠানোর আগে একজন মানুষ অনুমোদন করুন", expectedRoute: "handoff" },
  { id: "access-002", text: "  নাগরিক  সেবা—কোন কাগজ লাগবে? ", expectedRoute: "access" },
];
export function normalizeBengaliText(input: string) { return input.normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/[।॥]+/g, ".").replace(/[‐‑‒–—]/g, "-").replace(/\s+/g, " ").trim().toLocaleLowerCase("bn-BD"); }
export function routeBengaliIntent(input: string): BengaliBenchmarkRoute | "unknown" {
  const text = normalizeBengaliText(input);
  if (!text) return "unknown";
  if (/(ক্ষতিকর|বিপজ্জনক|অবৈধ|নিরাপদ বিকল্প|harm|unsafe)/i.test(text)) return "safety";
  if (/(অনুমোদন|মানুষ|human review|বাইরে পাঠানোর আগে|approve)/i.test(text)) return "handoff";
  if (/(source|evidence|work packet|অনিশ্চয়তা|প্রমাণ|উৎস)/i.test(text)) return "evidence";
  if (/(ভিডিও|ছবি|সৃজন|লিখুন|creative|প্রচার)/i.test(text)) return "creative";
  if (/(সরকারি|নাগরিক|সেবা|ফর্ম|কাগজ|access)/i.test(text)) return "access";
  return "unknown";
}
export function runBengaliBenchmark(cases: BengaliBenchmarkCase[] = BENGALI_BENCHMARK_CASES): BengaliBenchmarkResult {
  if (!cases.length) return { suiteVersion: BENGALI_BENCHMARK_SUITE_VERSION, language: "bn", sampleCount: 0, scoreBps: 0, status: "blocked", cases: [] };
  const evaluated = cases.map(item => { const normalized = normalizeBengaliText(item.text); const predictedRoute = routeBengaliIntent(item.text); return { id: item.id, expectedRoute: item.expectedRoute, predictedRoute, normalizedLength: normalized.length, passed: predictedRoute === item.expectedRoute && normalized.length > 0 }; });
  const passed = evaluated.filter(item => item.passed).length;
  const scoreBps = Math.round((passed / evaluated.length) * 10000);
  return { suiteVersion: BENGALI_BENCHMARK_SUITE_VERSION, language: "bn", sampleCount: evaluated.length, scoreBps, status: scoreBps >= 9500 ? "passed" : "failed", cases: evaluated };
}
