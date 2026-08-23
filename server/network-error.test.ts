import { describe, expect, it } from "vitest";
import { isTransientNetworkError } from "../client/src/lib/networkError";

describe("isTransientNetworkError", () => {
  it("recognizes browser transport failures", () => {
    expect(isTransientNetworkError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isTransientNetworkError(new Error("Load failed"))).toBe(true);
    expect(isTransientNetworkError({ message: "Network request failed" })).toBe(true);
  });

  it("does not hide application or authorization failures", () => {
    expect(isTransientNetworkError(new Error("UNAUTHORIZED"))).toBe(false);
    expect(isTransientNetworkError(new Error("Internal server error"))).toBe(false);
    expect(isTransientNetworkError(null)).toBe(false);
  });
});
