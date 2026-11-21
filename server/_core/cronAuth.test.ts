import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isAuthorizedCronHmacRequest, isAuthorizedCronRequest } from "./cronAuth";

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

describe("isAuthorizedCronHmacRequest", () => {
  const secret = "a-long-test-secret";
  const path = "/api/scheduled/processDocumentTasks";
  const timestamp = "1795171538";
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.GET.${path}`, "utf8")
    .digest("hex");

  it("accepts a valid timestamp-bound signature", () => {
    expect(isAuthorizedCronHmacRequest(timestamp, signature, secret, path, 1795171538000)).toBe(true);
  });

  it("rejects a signature for a different route", () => {
    expect(isAuthorizedCronHmacRequest(timestamp, signature, secret, "/api/scheduled/syncMalwareBazaar", 1795171538000)).toBe(false);
  });

  it("rejects stale and future timestamps outside the five-minute window", () => {
    expect(isAuthorizedCronHmacRequest(timestamp, signature, secret, path, 1795171839000)).toBe(false);
    expect(isAuthorizedCronHmacRequest(timestamp, signature, secret, path, 1795171237000)).toBe(false);
  });

  it.each([
    [undefined, signature, secret],
    [timestamp, undefined, secret],
    [timestamp, signature, undefined],
    ["not-a-timestamp", signature, secret],
    [timestamp, "not-a-signature", secret],
    [timestamp, "0".repeat(64), secret],
  ])("rejects missing or malformed HMAC inputs", (ts, sig, key) => {
    expect(isAuthorizedCronHmacRequest(ts, sig, key, path, 1795171538000)).toBe(false);
  });
});
