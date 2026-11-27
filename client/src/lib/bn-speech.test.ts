import { describe, expect, it } from "vitest";
import {
  bnToNum,
  intToWords,
  normalizeBanglaForSpeech,
  timeWord,
} from "./bn-speech.mjs";

const speak = (value: string) => normalizeBanglaForSpeech(value).text;

describe("Bengali speech normalization", () => {
  it("parses valid Bengali and Latin grouped numbers", () => {
    expect(bnToNum("১,২৫,০০০")).toBe(125000);
    expect(bnToNum("1,250")).toBe(1250);
    expect(Number.isNaN(bnToNum("১,,২৫০"))).toBe(true);
  });

  it("rejects out-of-range times", () => {
    expect(timeWord(16, 30)).toBe("সাড়ে চারটা");
    expect(timeWord(24, 0)).toBe("");
    expect(timeWord(10, 60)).toBe("");
  });

  it("normalizes time, currency, percentages and decimals", () => {
    expect(speak("বিকেল ৪:৩০")).toBe("বিকেল সাড়ে চারটা");
    expect(speak("৳১,২৫,০০০")).toBe("এক লাখ পঁচিশ হাজার টাকা");
    expect(speak("১২.৫%")).toBe("বারো দশমিক পাঁচ শতাংশ");
    expect(speak("৩.১৪")).toBe("তিন দশমিক এক চার");
  });

  it("does not misclassify a number followed by a Bengali word as an ordinal", () => {
    expect(speak("৫ম শ্রেণি")).toBe("পঞ্চম শ্রেণি");
    expect(speak("৫মিনিট")).toBe("পাঁচমিনিট");
    expect(speak("১১তম")).toBe("এগারোতম");
  });

  it("uses Bengali lakh-crore number naming", () => {
    expect(intToWords(125000)).toBe("এক লাখ পঁচিশ হাজার");
    expect(speak("১.৫ কোটি")).toBe("দেড় কোটি");
    expect(speak("২১.৫ লাখ")).toBe("একুশ দশমিক পাঁচ লাখ");
  });
});
