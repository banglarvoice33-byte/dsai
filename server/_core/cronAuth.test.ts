import { describe, expect, it } from "vitest";
import { isAuthorizedCronRequest } from "./cronAuth";

describe("isAuthorizedCronRequest", () => {
  it("accepts the exact Vercel Bearer secret header", () => {
    expect(isAuthorizedCronRequest("Bearer test-secret", "test-secret")).toBe(true);
  });

  it.each([
    [undefined, "test-secret"],
    ["", "test-secret"],
    ["Bearer test-secret", undefined],
    ["Bearer test-secret", ""],
    ["test-secret", "test-secret"],
    ["Bearer wrong-secret", "test-secret"],
    ["Bearer test-secret-extra", "test-secret"],
  ])("rejects missing or invalid credentials", (authorization, secret) => {
    expect(isAuthorizedCronRequest(authorization, secret)).toBe(false);
  });
});
