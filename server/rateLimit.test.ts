import { describe, expect, it, vi } from "vitest";
import { createRateLimit } from "./rateLimit";

describe("baseline rate limit", () => {
  it("rejects requests after the configured window budget", () => {
    const limiter = createRateLimit({ windowMs: 60_000, max: 1, keyPrefix: "test" });
    const next = vi.fn();
    const response = { headers: new Map<string, string>(), setHeader(name: string, value: string) { this.headers.set(name, value); }, statusCode: 200, status(code: number) { this.statusCode = code; return this; }, json: vi.fn() } as never;
    const request = { ip: "127.0.0.1", header: () => undefined } as never;
    limiter(request, response, next);
    limiter(request, response, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });
});
