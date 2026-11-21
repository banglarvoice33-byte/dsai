import { describe, expect, it } from "vitest";
import { decodeSupportedText } from "./workDeskTasks";

describe("Work Desk deterministic extraction", () => {
  it("extracts UTF-8 plain text without changing the source content", async () => {
    const result = await decodeSupportedText(Buffer.from("বাংলা নথির লেখা", "utf8"), "text/plain");
    expect(result).toEqual({ text: "বাংলা নথির লেখা", format: "text" });
  });

  it("accepts valid CSV as bounded UTF-8 text", async () => {
    const result = await decodeSupportedText(Buffer.from("নাম,মান\nরহিম,১", "utf8"), "text/csv");
    expect(result.format).toBe("csv");
    expect(result.text).toContain("রহিম");
  });

  it("validates JSON before returning extracted text", async () => {
    expect((await decodeSupportedText(Buffer.from('{"ok":true}'), "application/json")).format).toBe("json");
    await expect(decodeSupportedText(Buffer.from("{bad"), "application/json")).rejects.toThrow("invalid-json-document");
  });

  it("rejects image / ZIP rather than pretending OCR", async () => {
    await expect(decodeSupportedText(Buffer.from("image"), "image/png")).rejects.toThrow("unsupported-extraction-format");
    await expect(decodeSupportedText(Buffer.from("PK"), "application/zip")).rejects.toThrow("unsupported-extraction-format");
  });

  it("rejects invalid UTF-8 and binary null bytes", async () => {
    await expect(decodeSupportedText(Buffer.from([0xc3, 0x28]), "text/plain")).rejects.toThrow("invalid-utf8");
    await expect(decodeSupportedText(Buffer.from([0x61, 0x00, 0x62]), "text/plain")).rejects.toThrow("document-content-out-of-bounds");
  });

  it("rejects oversized content", async () => {
    await expect(decodeSupportedText(Buffer.alloc(250_001, 0x61), "text/plain")).rejects.toThrow("document-content-out-of-bounds");
  });

  it("extracts XLSX sheets to text", async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    wb.SheetNames.push("Sheet1");
    wb.Sheets["Sheet1"] = XLSX.utils.aoa_to_sheet([["নাম", "মান"], ["রহিম", "১"]]);
    const buf = Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as ArrayBuffer);
    const result = await decodeSupportedText(buf, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    expect(result.format).toBe("xlsx");
    expect(result.text).toContain("রহিম");
  });
});
