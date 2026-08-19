import { describe, expect, it } from "vitest";
import { applySecurityHeaders } from "./securityPolicy";

function responseStub() {
  const headers = new Map<string, string>();
  return { headers, setHeader(name: string, value: string) { headers.set(name.toLowerCase(), value); } } as never;
}

describe("security header policy", () => {
  it("sets isolation and anti-sniffing headers in development", () => {
    const response = responseStub();
    applySecurityHeaders(response, false);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("cross-origin-opener-policy")).toBe("same-origin");
    expect(response.headers.has("content-security-policy-report-only")).toBe(false);
  });

  it("uses report-only CSP and HSTS in production", () => {
    const response = responseStub();
    applySecurityHeaders(response, true);
    expect(response.headers.get("strict-transport-security")).toContain("max-age=31536000");
    expect(response.headers.get("content-security-policy-report-only")).toContain("frame-ancestors 'none'");
    expect(response.headers.get("content-security-policy-report-only")).toContain("object-src 'none'");
  });
});
