// Bengali number, time and currency normalization for speech synthesis.
// Browser-safe ES module; no runtime dependencies.

export const WORDS_0_99 = [
  'শূন্য','এক','দুই','তিন','চার','পাঁচ','ছয়','সাত','আট','নয়',
  'দশ','এগারো','বারো','তেরো','চৌদ্দ','পনেরো','ষোলো','সতেরো','আঠারো','উনিশ',
  'বিশ','একুশ','বাইশ','তেইশ','চব্বিশ','পঁচিশ','ছাব্বিশ','সাতাশ','আটাশ','উনত্রিশ',
  'ত্রিশ','একত্রিশ','বত্রিশ','তেত্রিশ','চৌত্রিশ','পঁয়ত্রিশ','ছত্রিশ','সাঁইত্রিশ','আটত্রিশ','উনচল্লিশ',
  'চল্লিশ','একচল্লিশ','বিয়াল্লিশ','তেতাল্লিশ','চয়াল্লিশ','পঁয়তাল্লিশ','ছেচল্লিশ','সাতচল্লিশ','আটচল্লিশ','উনপঞ্চাশ',
  'পঞ্চাশ','একান্ন','বায়ান্ন','তিপ্পান্ন','চুয়ান্ন','পঞ্চান্ন','ছাপ্পান্ন','সাতান্ন','আটান্ন','উনষাট',
  'ষাট','একষট্টি','বাষট্টি','তেষট্টি','চৌষট্টি','পঁয়ষট্টি','ছেষট্টি','সাতষট্টি','আটষট্টি','উনসত্তর',
  'সত্তর','একাত্তর','বাহাত্তর','তিয়াত্তর','চুয়াত্তর','পঁচাত্তর','ছিয়াত্তর','সাতাত্তর','আটাত্তর','উনআশি',
  'আশি','একাশি','বিরাশি','তিরাশি','চুরাশি','পঁচাশি','ছিয়াশি','সাতাশি','আটাশি','উননব্বই',
  'নব্বই','একানব্বই','বিরানব্বই','তিরানব্বই','চুরানব্বই','পঁচানব্বই','ছিয়ানব্বই','সাতানব্বই','আটানব্বই','নিরানব্বই',
];

const BN_ZERO = 0x09e6;
const ORDINAL_WORDS = {
  1: 'প্রথম', 2: 'দ্বিতীয়', 3: 'তৃতীয়', 4: 'চতুর্থ', 5: 'পঞ্চম',
  6: 'ষষ্ঠ', 7: 'সপ্তম', 8: 'অষ্টম', 9: 'নবম', 10: 'দশম',
};

function digitValue(ch) {
  const cp = ch.codePointAt(0);
  if (cp >= BN_ZERO && cp <= BN_ZERO + 9) return cp - BN_ZERO;
  if (cp >= 0x30 && cp <= 0x39) return cp - 0x30;
  return -1;
}

function validGrouping(value) {
  if (!value.includes(',')) return /^\d+$/.test(value);
  return /^\d{1,3}(?:,\d{3})+$/.test(value) ||
    /^\d{1,2}(?:,\d{2})*,\d{3}$/.test(value);
}

/** Parses Bengali/Latin digits with valid Western or Indian comma grouping. */
export function bnToNum(value) {
  const source = String(value ?? '')
    .trim()
    .replace(/[\u200b\u200c\u200d\ufeff]/g, '')
    .replace(/[\s\u00a0]/g, '');
  if (!source) return NaN;

  let ascii = '';
  for (const ch of source) {
    if (ch === ',') {
      ascii += ',';
      continue;
    }
    const digit = digitValue(ch);
    if (digit < 0) return NaN;
    ascii += String(digit);
  }
  if (!validGrouping(ascii)) return NaN;
  const number = Number(ascii.replace(/,/g, ''));
  return Number.isSafeInteger(number) ? number : NaN;
}

/** Converts a safe integer to Bengali words using the lakh/crore system. */
export function intToWords(value) {
  let number;
  if (typeof value === 'string') {
    const source = value.trim();
    const negative = source.startsWith('-');
    const parsed = bnToNum(negative ? source.slice(1) : source);
    if (!Number.isSafeInteger(parsed)) return '';
    number = negative ? -parsed : parsed;
  } else {
    number = Number(value);
  }
  if (!Number.isSafeInteger(number)) return '';
  if (number < 0) return 'ঋণাত্মক ' + intToWords(-number);
  if (number < 100) return WORDS_0_99[number];

  if (number < 1000) {
    const hundreds = Math.floor(number / 100), remainder = number % 100;
    return (hundreds === 1 ? 'একশো' : WORDS_0_99[hundreds] + 'শো') +
      (remainder ? ' ' + intToWords(remainder) : '');
  }
  if (number < 100000) {
    const thousands = Math.floor(number / 1000), remainder = number % 1000;
    return (thousands === 1 ? 'এক হাজার' : intToWords(thousands) + ' হাজার') +
      (remainder ? ' ' + intToWords(remainder) : '');
  }
  if (number < 10000000) {
    const lakhs = Math.floor(number / 100000), remainder = number % 100000;
    return (lakhs === 1 ? 'এক লাখ' : intToWords(lakhs) + ' লাখ') +
      (remainder ? ' ' + intToWords(remainder) : '');
  }
  const crores = Math.floor(number / 10000000), remainder = number % 10000000;
  return (crores === 1 ? 'এক কোটি' : intToWords(crores) + ' কোটি') +
    (remainder ? ' ' + intToWords(remainder) : '');
}

function digitsToWords(value) {
  const words = [];
  for (const ch of String(value)) {
    const digit = digitValue(ch);
    if (digit >= 0) words.push(WORDS_0_99[digit]);
  }
  return words.join(' ');
}

export function timeWord(hour, minute) {
  if (!Number.isInteger(hour) || !Number.isInteger(minute) ||
      hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';
  const hour12 = hour % 12 || 12;
  if (minute === 0) return WORDS_0_99[hour12] + 'টা';
  if (minute === 30) {
    if (hour12 === 1) return 'দেড়টা';
    if (hour12 === 2) return 'আড়াইটা';
    return 'সাড়ে ' + WORDS_0_99[hour12] + 'টা';
  }
  if (minute === 15) return 'সোয়া ' + WORDS_0_99[hour12] + 'টা';
  if (minute === 45) return 'পৌনে ' + WORDS_0_99[(hour12 % 12) + 1] + 'টা';
  return WORDS_0_99[hour12] + 'টা ' + WORDS_0_99[minute] + ' মিনিট';
}

export function periodForHour(hour) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return '';
  if (hour === 0 || hour >= 20) return 'রাত';
  if (hour >= 18) return 'সন্ধ্যা';
  if (hour >= 16) return 'বিকেল';
  if (hour >= 13) return 'দুপুর';
  return '';
}


const RE_TIME_PERIOD = /(^|[^\p{L}\p{M}\p{N}])(ভোর|সকাল|দুপুর|বিকেল|সন্ধ্যা|রাত)\s*([০-৯\d]{1,2}):([০-৯\d]{2})(?![০-৯\d])/gu;
const RE_TIME_BARE = /(^|[^\p{L}\p{M}\p{N}:])([০-৯\d]{1,2}):([০-৯\d]{2})(?![\p{L}\p{M}\p{N}:])/gu;
const RE_TK = /(?<![\p{L}\p{M}\p{N}])৳\s*([০-৯\d]+(?:,[০-৯\d]+)*)(?![\p{L}\p{M}\p{N},.])/gu;
const RE_GBP = /(?<![\p{L}\p{M}\p{N}])£\s*([০-৯\d]+(?:,[০-৯\d]+)*)(?![\p{L}\p{M}\p{N},.])/gu;
const RE_USD = /(?<![\p{L}\p{M}\p{N}])\$\s*([০-৯\d]+(?:,[০-৯\d]+)*)(?:\s*(মিলিয়ন|বিলিয়ন|ট্রিলিয়ন))?(?![\p{L}\p{M}\p{N},.])/gu;
const RE_PCT_DEC = /(?<![\p{L}\p{M}\p{N}])([০-৯\d]+(?:,[০-৯\d]+)*)[.]([০-৯\d]+)\s*%(?![\p{L}\p{M}\p{N},.])/gu;
const RE_PCT = /(?<![\p{L}\p{M}\p{N}])([০-৯\d]+(?:,[০-৯\d]+)*)\s*%(?![\p{L}\p{M}\p{N},.])/gu;
const RE_HALF = /(^|[^\p{L}\p{M}\p{N}.])([০-৯\d])[.]([৫5])\s*(লাখ|কোটি)(?![\u0980-\u09ff])/gu;
const RE_GROUPED = /(?<![\p{L}\p{M}\p{N},])((?:[০-৯\d]{1,3}(?:,[০-৯\d]{3})+|[০-৯\d]{1,2}(?:,[০-৯\d]{2})*,[০-৯\d]{3}))(?:[.]([০-৯\d]+))?(?![\p{L}\p{M}\p{N},.])/gu;
const RE_DECIMAL = /(?<![\p{L}\p{M}\p{N},.])([০-৯\d]+)[.]([০-৯\d]+)(?![\p{L}\p{M}\p{N},.])/gu;
const RE_NUM_UNIT = /(^|[^\p{L}\p{M}\p{N}])([০-৯\d]+)\s*(কোটি|লাখ|হাজার)(?![\u0980-\u09ff])/gu;
const RE_PHONE = /(^|[^\p{L}\p{M}\p{N}])([০-৯\d]{10,})(?![\p{L}\p{M}\p{N}])/gu;
const RE_ORDINAL = /(^|[^\p{L}\p{M}\p{N}])([০-৯\d]+)(তম|র্থ|ষ্ঠ|য়|ম)(?=$|[^\p{L}\p{M}])/gu;
const RE_BN_DIGITS = /(?<![০-৯\d,.:])[০-৯]+(?![০-৯\d,.:])/g;

function applyPronunciationMap(value, map, record) {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return value;
  let output = value;
  const entries = Object.entries(map)
    .filter(([from, to]) => from.length > 0 && typeof to === 'string' && to.length > 0)
    .sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of entries) {
    const escaped = from.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');
    const expression = new RegExp('(?<![\\p{L}\\p{M}\\p{N}])' + escaped +
      '(?![\\p{L}\\p{M}\\p{N}])', 'gu');
    output = output.replace(expression, match => {
      record('pronunciation', match, to);
      return to;
    });
  }
  return output;
}

/**
 * Normalizes numeric expressions for browser/server TTS.
 * latinTtsSpelling remains accepted for API compatibility; it no longer
 * mutates standard Bengali spelling. Use pronunciationMap for voice-specific
 * spoken forms, e.g. { 'পঞ্চাশ': 'পঞ্চাশ্' } when a voice requires it.
 */
export function normalizeBanglaForSpeech(input, options = {}) {
  const maxChanges = Number.isFinite(options.maxChanges)
    ? Math.max(0, Math.trunc(options.maxChanges)) : 500;
  const changes = [];
  const record = (kind, from, to) => {
    if (changes.length < maxChanges) changes.push({ kind, from, to });
  };
  let output = String(input ?? '');
  if (!output) return { text: output, changes };

  output = output.replace(RE_TIME_PERIOD, (match, prefix, period, hourText, minuteText) => {
    const word = timeWord(bnToNum(hourText), bnToNum(minuteText));
    if (!word) return match;
    const replacement = prefix + period + ' ' + word;
    record('time', match.slice(prefix.length), replacement.slice(prefix.length));
    return replacement;
  });

  output = output.replace(RE_TIME_BARE, (match, prefix, hourText, minuteText) => {
    const hour = bnToNum(hourText), word = timeWord(hour, bnToNum(minuteText));
    if (!word) return match;
    const period = periodForHour(hour);
    const replacement = (period ? period + ' ' : '') + word;
    record('time', hourText + ':' + minuteText, replacement);
    return prefix + replacement;
  });

  const replaceCurrency = (expression, unit) => {
    output = output.replace(expression, (match, digits) => {
      const number = bnToNum(digits);
      if (!Number.isSafeInteger(number)) return match;
      const replacement = intToWords(number) + ' ' + unit;
      record('currency', match, replacement);
      return replacement;
    });
  };
  replaceCurrency(RE_TK, 'টাকা');
  replaceCurrency(RE_GBP, 'পাউন্ড');

  output = output.replace(RE_USD, (match, digits, scale) => {
    const number = bnToNum(digits);
    if (!Number.isSafeInteger(number)) return match;
    const replacement = intToWords(number) + (scale ? ' ' + scale : '') + ' ডলার';
    record('currency', match, replacement);
    return replacement;
  });

  output = output.replace(RE_PCT_DEC, (match, whole, fraction) => {
    const number = bnToNum(whole);
    if (!Number.isSafeInteger(number)) return match;
    const replacement = intToWords(number) + ' দশমিক ' + digitsToWords(fraction) + ' শতাংশ';
    record('percent', match, replacement);
    return replacement;
  });
  output = output.replace(RE_PCT, (match, digits) => {
    const number = bnToNum(digits);
    if (!Number.isSafeInteger(number)) return match;
    const replacement = intToWords(number) + ' শতাংশ';
    record('percent', match, replacement);
    return replacement;
  });

  output = output.replace(RE_HALF, (match, prefix, digitText, _five, unit) => {
    const digit = bnToNum(digitText);
    const replacement = unit === 'কোটি' && digit === 1 ? 'দেড় কোটি'
      : unit === 'লাখ' && digit === 2 ? 'আড়াই লাখ'
      : 'সাড়ে ' + WORDS_0_99[digit] + ' ' + unit;
    record('half', match.slice(prefix.length), replacement);
    return prefix + replacement;
  });

  output = output.replace(RE_GROUPED, (match, integer, fraction) => {
    const number = bnToNum(integer);
    if (!Number.isSafeInteger(number)) return match;
    const replacement = intToWords(number) +
      (fraction ? ' দশমিক ' + digitsToWords(fraction) : '');
    record('number', match, replacement);
    return replacement;
  });
  output = output.replace(RE_DECIMAL, (match, whole, fraction) => {
    const number = bnToNum(whole);
    if (!Number.isSafeInteger(number)) return match;
    const replacement = intToWords(number) + ' দশমিক ' + digitsToWords(fraction);
    record('decimal', whole + '.' + fraction, replacement);
    return replacement;
  });
  output = output.replace(RE_NUM_UNIT, (match, prefix, digits, unit) => {
    const number = bnToNum(digits);
    if (!Number.isSafeInteger(number)) return match;
    const replacement = intToWords(number) + ' ' + unit;
    record('number', match.slice(prefix.length), replacement);
    return prefix + replacement;
  });
  output = output.replace(RE_PHONE, (match, prefix, digits) => {
    const replacement = digitsToWords(digits);
    record('phone', digits, replacement);
    return prefix + replacement;
  });
  output = output.replace(RE_ORDINAL, (match, prefix, digits) => {
    const number = bnToNum(digits);
    if (!Number.isSafeInteger(number)) return match;
    const replacement = ORDINAL_WORDS[number] || intToWords(number) + 'তম';
    record('ordinal', match.slice(prefix.length), replacement);
    return prefix + replacement;
  });
  output = output.replace(RE_BN_DIGITS, match => {
    const number = bnToNum(match);
    if (!Number.isSafeInteger(number)) return match;
    const replacement = intToWords(number);
    record('number', match, replacement);
    return replacement;
  });

  output = applyPronunciationMap(output, options.pronunciationMap, record);
  return { text: output, changes };
}

export default normalizeBanglaForSpeech;
