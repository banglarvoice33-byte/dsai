// Bengali number, time and currency normalization for speech synthesis.
// Browser-safe ES module; no runtime dependencies.

export const WORDS_0_99 = [
  "শূন্য","এক","দুই","তিন","চার","পাঁচ","ছয়","সাত","আট","নয়",
  "দশ","এগারো","বারো","তেরো","চৌদ্দ","পনেরো","ষোলো","সতেরো","আঠারো","উনিশ",
  "বিশ","একুশ","বাইশ","তেইশ","চব্বিশ","পঁচিশ","ছাব্বিশ","সাতাশ","আটাশ","উনত্রিশ",
  "ত্রিশ","একত্রিশ","বত্রিশ","তেত্রিশ","চৌত্রিশ","পঁয়ত্রিশ","ছত্রিশ","সাঁইত্রিশ","আটত্রিশ","উনচল্লিশ",
  "চল্লিশ","একচল্লিশ","বিয়াল্লিশ","তেতাল্লিশ","চয়াল্লিশ","পঁয়তাল্লিশ","ছেচল্লিশ","সাতচল্লিশ","আটচল্লিশ","উনপঞ্চাশ",
  "পঞ্চাশ","একান্ন","বায়ান্ন","তিপ্পান্ন","চুয়ান্ন","পঞ্চান্ন","ছাপ্পান্ন","সাতান্ন","আটান্ন","উনষাট",
  "ষাট","একষট্টি","বাষট্টি","তেষট্টি","চৌষট্টি","পঁয়ষট্টি","ছেষট্টি","সাতষট্টি","আটষট্টি","উনসত্তর",
  "সত্তর","একাত্তর","বাহাত্তর","তিয়াত্তর","চুয়াত্তর","পঁচাত্তর","ছিয়াত্তর","সাতাত্তর","আটাত্তর","উনআশি",
  "আশি","একাশি","বিরাশি","তিরাশি","চুরাশি","পঁচাশি","ছিয়াশি","সাতাশি","আটাশি","উননব্বই",
  "নব্বই","একানব্বই","বিরানব্বই","তিরানব্বই","চুরানব্বই","পঁচানব্বই","ছিয়ানব্বই","সাতানব্বই","আটানব্বই","নিরানব্বই",
];

const BN_ZERO = 0x09e6;
const MAX_SAFE = Number.MAX_SAFE_INTEGER;
const ORDINAL_WORDS = {
  1:"প্রথম",2:"দ্বিতীয়",3:"তৃতীয়",4:"চতুর্থ",5:"পঞ্চম",
  6:"ষষ্ঠ",7:"সপ্তম",8:"অষ্টম",9:"নবম",10:"দশম",
};

function digitValue(ch) {
  const cp = ch.codePointAt(0);
  if (cp >= BN_ZERO && cp <= BN_ZERO + 9) return cp - BN_ZERO;
  if (cp >= 48 && cp <= 57) return cp - 48;
  return -1;
}

function normalizeDigits(value) {
  let out = "";
  for (const ch of String(value ?? "")) {
    const d = digitValue(ch);
    if (d < 0) return null;
    out += String(d);
  }
  return out;
}

function validGrouping(s) {
  if (!s.includes(",")) return /^\d+$/.test(s);
  return /^\d{1,3}(?:,\d{3})+$/.test(s) ||
    /^\d{1,2}(?:,\d{2})*,\d{3}$/.test(s);
}

/** Parses Bengali/Latin digits with valid Western or Indian comma grouping. */
export function bnToNum(value) {
  let s = String(value ?? "").trim()
    .replace(/[\u200b\u200c\u200d\uFEFF]/g, "")
    .replace(/[\s\u00a0]/g, "");
  if (!s) return NaN;
  let ascii = "";
  for (const ch of s) {
    if (ch === ",") ascii += ",";
    else {
      const d = digitValue(ch);
      if (d < 0) return NaN;
      ascii += d;
    }
  }
  if (!validGrouping(ascii)) return NaN;
  const n = Number(ascii.replace(/,/g, ""));
  return Number.isSafeInteger(n) ? n : NaN;
}

export function intToWords(value) {
  let n = Number(value);
  if (!Number.isSafeInteger(n)) return "";
  if (n < 0) return "ঋণাত্মক " + intToWords(-n);
  if (n < 100) return WORDS_0_99[n];
  if (n < 1000) {
    const h = Math.floor(n / 100), r = n % 100;
    return (h === 1 ? "একশো" : WORDS_0_99[h] + "শো") + (r ? " " + intToWords(r) : "");
  }
  if (n < 100000) {
    const t = Math.floor(n / 1000), r = n % 1000;
    return (t === 1 ? "এক হাজার" : intToWords(t) + " হাজার") + (r ? " " + intToWords(r) : "");
  }
  if (n < 10000000) {
    const l = Math.floor(n / 100000), r = n % 100000;
    return (l === 1 ? "এক লাখ" : intToWords(l) + " লাখ") + (r ? " " + intToWords(r) : "");
  }
  const c = Math.floor(n / 10000000), r = n % 10000000;
  return (c === 1 ? "এক কোটি" : intToWords(c) + " কোটি") + (r ? " " + intToWords(r) : "");
}

function digitsToWords(value) {
  return [...String(value)].map(ch => {
    const d = digitValue(ch);
    return d < 0 ? "" : WORDS_0_99[d];
  }).filter(Boolean).join(" ");
}

export function timeWord(hour, minute) {
  if (!Number.isInteger(hour) || !Number.isInteger(minute) ||
      hour < 0 || hour > 23 || minute < 0 || minute > 59) return "";
  const h12 = hour % 12 || 12;
  if (minute === 0) return WORDS_0_99[h12] + "টা";
  if (minute === 30) {
    if (h12 === 1) return "দেড়টা";
    if (h12 === 2) return "আড়াইটা";
    return "সাড়ে " + WORDS_0_99[h12] + "টা";
  }
  if (minute === 15) return "সোয়া " + WORDS_0_99[h12] + "টা";
  if (minute === 45) return "পৌনে " + WORDS_0_99[(h12 % 12) + 1] + "টা";
  return WORDS_0_99[h12] + "টা " + WORDS_0_99[minute] + " মিনিট";
}

export function periodForHour(hour) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return "";
  if (hour === 0 || hour >= 20) return "রাত";
  if (hour >= 18) return "সন্ধ্যা";
  if (hour >= 16) return "বিকেল";
  if (hour >= 13) return "দুপুর";
  return "";
}

const NUM = "[০-৯\\d]+(?:,[০-৯\\d]+)*";
const RE_TIME_PERIOD = /(ভোর|সকাল|দুপুর|বিকেল|সন্ধ্যা|রাত)\s*([০-৯\d]{1,2}):([০-৯\d]{2})(?![০-৯\d])/g;
const RE_TIME_BARE = /(^|[^\d০-৯:])([০-৯\d]{1,2}):([০-৯\d]{2})(?![\d০-৯:])/g;
const RE_TK = new RegExp("৳\\s*(" + NUM + ")", "g");
const RE_GBP = new RegExp("£\\s*(" + NUM + ")", "g");
const RE_USD = new RegExp("\\$\\s*(" + NUM + ")(?:\\s*(মিলিয়ন|বিলিয়ন|ট্রিলিয়ন))?", "g");
const RE_PCT_DEC = new RegExp("(" + NUM + ")[.]([০-৯\\d]+)\\s*%", "g");
const RE_PCT = new RegExp("(" + NUM + ")\\s*%", "g");
const RE_HALF = /(^|[^\d০-৯.])([০-৯\d])[.]([৫5])\s*(লাখ|কোটি)(?![\u0980-\u09FF])/g;
const RE_GROUPED = /[০-৯\d]{1,3}(?:,[০-৯\d]{2,3})+(?:[.][০-৯\d]+)?/g;
const RE_DECIMAL = /(^|[^\d০-৯,.])([০-৯\d]+)[.]([০-৯\d]+)(?![\d০-৯])/g;
const RE_NUM_UNIT = /(^|[^\d০-৯])([০-৯\d]+)\s*(কোটি|লাখ|হাজার)(?![\u0980-\u09FF])/g;
const RE_PHONE = /(^|[^\d০-৯])([০-৯]{10,})(?![\d০-৯])/g;
const RE_ORDINAL = /(^|[^\p{L}\p{N}])([০-৯\d]+)(তম|র্থ|ষ্ঠ|য়|ম)(?=$|[^\p{L}\p{M}])/gu;
const RE_BN_DIGITS = /[০-৯]+/g;

/**
 * Converts numeric expressions to Bengali speech text.
 * latinTtsSpelling is retained for API compatibility; standard Bengali spelling
 * is used by default rather than silently corrupting ordinary words.
 */
export function normalizeBanglaForSpeech(input, options = {}) {
  const maxChanges = Number.isFinite(options.maxChanges)
    ? Math.max(0, Math.trunc(options.maxChanges)) : 500;
  const changes = [];
  const record = (kind, from, to) => {
    if (changes.length < maxChanges) changes.push({ kind, from, to });
  };
  let out = String(input ?? "");
  if (!out) return { text: out, changes };

  out = out.replace(RE_TIME_PERIOD, (m, period, h, min) => {
    const H = bnToNum(h), M = bnToNum(min), word = timeWord(H, M);
    if (!word) return m;
    const to = period + " " + word; record("time", m, to); return to;
  });
  out = out.replace(RE_TIME_BARE, (m, pre, h, min) => {
    const H = bnToNum(h), M = bnToNum(min), word = timeWord(H, M);
    if (!word) return m;
    const to = (periodForHour(H) ? periodForHour(H) + " " : "") + word;
    record("time", h + ":" + min, to); return pre + to;
  });

  const currency = (regex, unit) => {
    out = out.replace(regex, (m, digits) => {
      const n = bnToNum(digits);
      if (!Number.isSafeInteger(n)) return m;
      const to = intToWords(n) + " " + unit;
      record("currency", m, to); return to;
    });
  };
  currency(RE_TK, "টাকা");
  currency(RE_GBP, "পাউন্ড");
  out = out.replace(RE_USD, (m, digits, scale) => {
    const n = bnToNum(digits);
    if (!Number.isSafeInteger(n)) return m;
    const to = intToWords(n) + (scale ? " " + scale : "") + " ডলার";
    record("currency", m, to); return to;
  });

  out = out.replace(RE_PCT_DEC, (m, whole, fraction) => {
    const n = bnToNum(whole);
    if (!Number.isSafeInteger(n)) return m;
    const to = intToWords(n) + " দশমিক " + digitsToWords(fraction) + " শতাংশ";
    record("percent", m, to); return to;
  });
  out = out.replace(RE_PCT, (m, digits) => {
    const n = bnToNum(digits);
    if (!Number.isSafeInteger(n)) return m;
    const to = intToWords(n) + " শতাংশ"; record("percent", m, to); return to;
  });

  out = out.replace(RE_HALF, (m, pre, digit, _five, unit) => {
    const n = bnToNum(digit);
    const to = unit === "কোটি" && n === 1 ? "দেড় কোটি"
      : unit === "লাখ" && n === 2 ? "আড়াই লাখ"
      : "সাড়ে " + WORDS_0_99[n] + " " + unit;
    record("half", m.slice(pre.length), to); return pre + to;
  });

  out = out.replace(RE_GROUPED, m => {
    const dot = m.indexOf(".");
    const integer = dot < 0 ? m : m.slice(0, dot);
    const fraction = dot < 0 ? "" : m.slice(dot + 1);
    const n = bnToNum(integer);
    if (!Number.isSafeInteger(n)) return m;
    const to = intToWords(n) + (fraction ? " দশমিক " + digitsToWords(fraction) : "");
    record("number", m, to); return to;
  });
  out = out.replace(RE_DECIMAL, (m, pre, whole, fraction) => {
    const n = bnToNum(whole);
    if (!Number.isSafeInteger(n)) return m;
    const to = intToWords(n) + " দশমিক " + digitsToWords(fraction);
    record("decimal", whole + "." + fraction, to); return pre + to;
  });
  out = out.replace(RE_NUM_UNIT, (m, pre, digits, unit) => {
    const n = bnToNum(digits);
    if (!Number.isSafeInteger(n)) return m;
    const to = intToWords(n) + " " + unit;
    record("number", m.slice(pre.length), to); return pre + to;
  });
  out = out.replace(RE_PHONE, (m, pre, run) => {
    const to = digitsToWords(run); record("phone", run, to); return pre + to;
  });
  out = out.replace(RE_ORDINAL, (m, prefix, digits) => {
    const n = bnToNum(digits);
    if (!Number.isSafeInteger(n)) return m;
    const to = ORDINAL_WORDS[n] || intToWords(n) + "তম";
    record("ordinal", m.slice(prefix.length), to); return prefix + to;
  });

  // Bengali digit runs only: Latin numerals remain unchanged unless part of a
  // recognized time, currency, percentage, grouped number or decimal above.
  out = out.replace(RE_BN_DIGITS, m => {
    const n = bnToNum(m);
    if (!Number.isSafeInteger(n)) return m;
    const to = intToWords(n); record("number", m, to); return to;
  });
  return { text: out, changes };
}

export default normalizeBanglaForSpeech;
