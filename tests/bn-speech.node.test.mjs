import test from "node:test";
import assert from "node:assert/strict";
import {
  WORDS_0_99, intToWords, bnToNum, timeWord, periodForHour,
  normalizeBanglaForSpeech,
} from "../client/src/lib/bn-speech.mjs";

const speak = (value, options) => normalizeBanglaForSpeech(value, options).text;

test("0–99 word table and integer conversion", () => {
  assert.equal(WORDS_0_99.length, 100);
  assert.equal(intToWords(0), "শূন্য");
  assert.equal(intToWords(21), "একুশ");
  assert.equal(intToWords(100), "একশো");
  assert.equal(intToWords(101), "একশো এক");
  assert.equal(intToWords(999), "নয়শো নিরানব্বই");
  assert.equal(intToWords(1000), "এক হাজার");
  assert.equal(intToWords(2026), "দুই হাজার ছাব্বিশ");
  assert.equal(intToWords(125000), "এক লাখ পঁচিশ হাজার");
  assert.equal(intToWords(10000000), "এক কোটি");
  assert.equal(intToWords(-5), "ঋণাত্মক পাঁচ");
  assert.equal(intToWords(Number.MAX_SAFE_INTEGER + 1), "");
});

test("strict Bengali/Latin integer parsing and grouping", () => {
  assert.equal(bnToNum("১২৩"), 123);
  assert.equal(bnToNum("১,২৫,০০০"), 125000);
  assert.equal(bnToNum("1,250"), 1250);
  for (const bad of ["", "১২ক", "১,,২৫০", "12,50", "1,23,456,789", "৯০০৭১৯৯২৫৪৭৪০৯৯৩"]) {
    assert.ok(Number.isNaN(bnToNum(bad)), bad);
  }
});

test("time validation and Bengali idioms", () => {
  assert.equal(timeWord(16, 30), "সাড়ে চারটা");
  assert.equal(timeWord(1, 30), "দেড়টা");
  assert.equal(timeWord(2, 30), "আড়াইটা");
  assert.equal(timeWord(7, 15), "সোয়া সাতটা");
  assert.equal(timeWord(7, 45), "পৌনে আটটা");
  assert.equal(timeWord(9, 0), "নয়টা");
  assert.equal(timeWord(9, 5), "নয়টা পাঁচ মিনিট");
  assert.equal(timeWord(25, 30), "");
  assert.equal(timeWord(10, 60), "");
  assert.equal(periodForHour(16), "বিকেল");
  assert.equal(periodForHour(24), "");
});

test("time normalization", () => {
  assert.equal(speak("বিকেল ৪:৩০"), "বিকেল সাড়ে চারটা");
  assert.equal(speak("১৬:৩০"), "বিকেল সাড়ে চারটা");
  assert.equal(speak("১:৩০"), "দেড়টা");
  assert.equal(speak("০০:৩০"), "রাত সাড়ে বারোটা");
  assert.equal(speak("১৬:৩০।"), "বিকেল সাড়ে চারটা।");
  assert.equal(speak("সন্ধ্যা ৭:১৫"), "সন্ধ্যা সোয়া সাতটা");
  assert.equal(speak("২৫:৭০"), "২৫:৭০");
});

test("currency, including Indian comma grouping", () => {
  assert.equal(speak("৳৫০০"), "পাঁচশো টাকা");
  assert.equal(speak("৳১,২০০"), "এক হাজার দুইশো টাকা");
  assert.equal(speak("৳১,২৫,০০০"), "এক লাখ পঁচিশ হাজার টাকা");
  assert.equal(speak("£১০০"), "একশো পাউন্ড");
  assert.equal(speak("$৫০ মিলিয়ন"), "পঞ্চাশ মিলিয়ন ডলার");
});

test("percentages, decimals and half idioms", () => {
  assert.equal(speak("৫০%"), "পঞ্চাশ শতাংশ");
  assert.equal(speak("১২.৫%"), "বারো দশমিক পাঁচ শতাংশ");
  assert.equal(speak("৩.১৪"), "তিন দশমিক এক চার");
  assert.equal(speak("২.৫ লাখ"), "আড়াই লাখ");
  assert.equal(speak("১.৫ কোটি"), "দেড় কোটি");
  assert.equal(speak("৩.৫ লাখ"), "সাড়ে তিন লাখ");
  assert.equal(speak("২১.৫ লাখ"), "একুশ দশমিক পাঁচ লাখ");
});

test("grouped numbers, units and phone numbers", () => {
  assert.equal(speak("১,২৫,০০০"), "এক লাখ পঁচিশ হাজার");
  assert.equal(speak("১০ কোটি"), "দশ কোটি");
  assert.equal(speak("৭৩"), "তিয়াত্তর");
  assert.equal(speak("২০২৬"), "দুই হাজার ছাব্বিশ");
  assert.equal(speak("০১৭১২৩৪৫৬৭৮"), "শূন্য এক সাত এক দুই তিন চার পাঁচ ছয় সাত আট");
});

test("ordinals and change log", () => {
  assert.equal(speak("৫ম"), "পঞ্চম");
  assert.equal(speak("২য়"), "দ্বিতীয়");
  assert.equal(speak("১১তম"), "এগারোতম");
  assert.equal(speak("৫ম শ্রেণি"), "পঞ্চম শ্রেণি");
  assert.equal(speak("৫মিনিট"), "পাঁচমিনিট");
  const result = normalizeBanglaForSpeech("বিকেল ৪:৩০, ৳৫০০");
  assert.match(result.text, /বিকেল সাড়ে চারটা/);
  assert.ok(result.changes.some(change => change.kind === "time"));
  assert.ok(result.changes.some(change => change.kind === "currency"));
  assert.deepEqual(normalizeBanglaForSpeech("৫", { maxChanges: 0 }).changes, []);
});
