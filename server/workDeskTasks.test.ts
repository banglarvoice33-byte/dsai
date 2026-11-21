import { describe, expect, it } from "vitest";
import { decodeSupportedText } from "./workDeskTasks";

describe("Work Desk deterministic extraction", () => {
  it("extracts UTF-8 plain text without changing the source content", () => {
    const result = decodeSupportedText(Buffer.from("বাংলা নথির লেখা", "utf8"), "text/plain");
    expect(result).toEqual({ text: "বাংলা নথির লেখা", format: "text" });
  });

  it("accepts valid CSV as bounded UTF-8 text", () => {
    const result = decodeSupportedText(Buffer.from("নাম,মান\nরহিম,১", "utf8"), "text/csv");
    expect(result.format).toBe("csv");
    expect(result.text).toContain("রহিম");
  });

  it("validates JSON before returning extracted text", () => {
    expect(decodeSupportedText(Buffer.from('{"ok":true}'), "application/json").format).toBe("json");
    expect(() => decodeSupportedText(Buffer.from("{bad"), "application/json")).toThrow("invalid-json-document");
  });

  it("rejects unsupported formats rather than pretending OCR or PDF extraction", () => {
    expect(() => decodeSupportedText(Buffer.from("%PDF-1.7"), "application/pdf")).toThrow("unsupported-extraction-format");
    expect(() => decodeSupportedText(Buffer.from("image"), "image/png")).toThrow("unsupported-extraction-format");
  });

  it("rejects invalid UTF-8 and binary null bytes", () => {
    expect(() => decodeSupportedText(Buffer.from([0xc3, 0x28]), "text/plain")).toThrow("invalid-utf8");
    expect(() => decodeSupportedText(Buffer.from([0x61, 0x00, 0x62]), "text/plain")).toThrow("document-content-out-of-bounds");
  });

  it("rejects oversized content", () => {
    expect(() => decodeSupportedText(Buffer.alloc(250_001, 0x61), "text/plain")).toThrow("document-content-out-of-bounds");
  });
});
