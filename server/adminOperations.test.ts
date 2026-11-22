import { describe, expect, it } from "vitest";
import { normalizeOperationsCount } from "./adminOperations";

describe("normalizeOperationsCount", () => {
  it("normalizes PostgreSQL integer and bigint representations", () => {
    expect(normalizeOperationsCount(7)).toBe(7);
    expect(normalizeOperationsCount("12")).toBe(12);
    expect(normalizeOperationsCount("12.9")).toBe(12);
  });

  it("does not expose invalid, negative, or non-finite counts", () => {
    expect(normalizeOperationsCount(null)).toBe(0);
    expect(normalizeOperationsCount("not-a-count")).toBe(0);
    expect(normalizeOperationsCount(-4)).toBe(0);
    expect(normalizeOperationsCount(Number.POSITIVE_INFINITY)).toBe(0);
  });
});
