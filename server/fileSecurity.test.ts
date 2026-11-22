import { afterEach, describe, expect, it } from "vitest";
import { isFileAssetAvailableForUse } from "./fileSecurity";

const originalUrl = process.env.MALWARE_SCANNER_URL;
const originalKey = process.env.MALWARE_SCANNER_API_KEY;

afterEach(() => {
  if (originalUrl === undefined) delete process.env.MALWARE_SCANNER_URL;
  else process.env.MALWARE_SCANNER_URL = originalUrl;
  if (originalKey === undefined) delete process.env.MALWARE_SCANNER_API_KEY;
  else process.env.MALWARE_SCANNER_API_KEY = originalKey;
});

describe("scanner-gated file availability", () => {
  it("never makes quarantined or unscanned files available", () => {
    for (const status of ["quarantined", "scanning", "validated", "infected", "error", "expired"] as const) {
      expect(isFileAssetAvailableForUse(status, true)).toBe(false);
      expect(isFileAssetAvailableForUse(status, false)).toBe(false);
    }
  });

  it("requires both a clean verdict and a currently configured scanner", () => {
    expect(isFileAssetAvailableForUse("clean", false)).toBe(false);
    expect(isFileAssetAvailableForUse("clean", true)).toBe(true);
  });
});
