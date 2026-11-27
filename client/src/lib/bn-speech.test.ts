import { describe, expect, it } from "vitest";
import {
  WORDS_0_99,
  bnToNum,
  intToWords,
  normalizeBanglaForSpeech,
  periodForHour,
  timeWord,
} from "./bn-speech.mjs";

const speak = (value: string, options?: Parameters<typeof normalizeBanglaForSpeech>[1]) =>
  normalizeBanglaForSpeech(value, options).text;

describe("Bengali speech normalization", () => {
  it("converts safe integers using Bengali lakh/crore grouping", () => {
    expect(WORDS_0_99).toHaveLength(100);
    expect(intToWords(0)).toBe("শূন্য");
    expect(intToWords(2026)).toBe("দুই হাজার ছাব্বিশ");
    expect(intToWords(125000)).toBe("এক লাখ পঁচিশ হাজার");
    expect(intToWords(Number.MAX_SAFE_INTEGER + 1)).toBe("");
    expect(intToWords("১,২৫,০০০")).toBe("এক লাখ পঁচিশ হাজার");
  });

  it("strictly parses Bengali and Latin digits with Indian or Western grouping", () => {
    expect(bnToNum("১,২৫,০০০")).toBe(125000);
    expect(bnToNum("1,250")).toBe(1250);
    expect(bnToNum("১২,৩৪,৫৬,৭৮৯")).toBe(123456789);
    for (const value of ["", "১,,২৫০", "12,50", "১২ক", "৯০০৭১৯৯২৫৪৭৪০৯৯৩"]) {
      expect(Number.isNaN(bnToNum(value))).toBe(true);
    }
  });

  it("rejects out-of-range clock values and speaks Bengali time idioms", () => {
    expect(timeWord(16, 30)).toBe("সাড়ে চারটা");
    expect(timeWord(1, 30)).toBe("দেড়টা");
    expect(timeWord(2, 30)).toBe("আড়াইটা");
    expect(timeWord(7, 15)).toBe("সোয়া সাতটা");
    expect(timeWord(7, 45)).toBe("পৌনে আটটা");
    expect(timeWord(25, 30)).toBe("");
    expect(timeWord(10, 60)).toBe("");
    expect(periodForHour(16)).toBe("বিকেল");
    expect(periodForHour(24)).toBe("");
  });

  it("normalizes clock time in Bengali or Latin digits without matching inside words", () => {
    expect(speak("বিকেল ৪:৩০")).toBe("বিকেল সাড়ে চারটা");
    expect(speak("বিকেল 4:30")).toBe("বিকেল সাড়ে চারটা");
    expect(speak("16:30")).toBe("বিকেল সাড়ে চারটা");
    expect(speak("ABC16:30")).toBe("ABC16:30");
    expect(speak("২৫:৭০")).toBe("২৫:৭০");
  });

  it("normalizes currencies and rejects malformed grouping", () => {
    expect(speak("৳৫০০")).toBe("পাঁচশো টাকা");
    expect(speak("৳১,২৫,০০০")).toBe("এক লাখ পঁচিশ হাজার টাকা");
    expect(speak("£১০০")).toBe("একশো পাউন্ড");
    expect(speak("$৫০ মিলিয়ন")).toBe("পঞ্চাশ মিলিয়ন ডলার");
    expect(speak("৳১,,২৫০")).toBe("৳১,,২৫০");
  });

  it("normalizes percentages, decimals and half-unit idioms", () => {
    expect(speak("১২.৫%")).toBe("বারো দশমিক পাঁচ শতাংশ");
    expect(speak("৩.১৪")).toBe("তিন দশমিক এক চার");
    expect(speak("২.৫ লাখ")).toBe("আড়াই লাখ");
    expect(speak("১.৫ কোটি")).toBe("দেড় কোটি");
    expect(speak("২১.৫ লাখ")).toBe("একুশ দশমিক পাঁচ লাখ");
  });

  it("speaks Bengali and Latin phone digit runs individually", () => {
    const expected = "শূন্য এক সাত এক দুই তিন চার পাঁচ ছয় সাত আট";
    expect(speak("০১৭১২৩৪৫৬৭৮")).toBe(expected);
    expect(speak("01712345678")).toBe(expected);
  });

  it("normalizes ordinals and preserves embedded Bengali suffixes", () => {
    expect(speak("৫ম শ্রেণি")).toBe("পঞ্চম শ্রেণি");
    expect(speak("২য়")).toBe("দ্বিতীয়");
    expect(speak("১১তম")).toBe("এগারোতম");
    expect(speak("৫মিনিট")).toBe("পাঁচমিনিট");
  });

  it("supports opt-in engine pronunciation and bounded change logs", () => {
    const input = "পঞ্চাশ টাকা, অপঞ্চাশ শব্দ";
    expect(speak(input)).toBe(input);
    const result = normalizeBanglaForSpeech(input, {
      pronunciationMap: { "পঞ্চাশ": "পঞ্চাশ্" },
      maxChanges: 1,
    });
    expect(result.text).toBe("পঞ্চাশ্ টাকা, অপঞ্চাশ শব্দ");
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].kind).toBe("pronunciation");
    expect(normalizeBanglaForSpeech("৫", { maxChanges: -1 }).changes).toEqual([]);
  });
});
