import { describe, expect, it } from "vitest";
import { governmentServices } from "./governmentServices";

describe("government service directory", () => {
  it("uses unique stable service ids", () => {
    const ids = governmentServices.map(service => service.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("links only to HTTPS government portals", () => {
    for (const service of governmentServices) {
      const url = new URL(service.officialUrl);
      expect(url.protocol).toBe("https:");
      expect(url.hostname.endsWith(".gov.bd") || url.hostname.endsWith(".teletalk.com.bd")).toBe(true);
    }
  });

  it("uses only supported Workdesk workflow types", () => {
    const supported = new Set(["government", "jobs", "document"]);
    for (const service of governmentServices) {
      expect(supported.has(service.workflow)).toBe(true);
    }
  });

  it("provides preparation and a clear authority boundary for every service", () => {
    for (const service of governmentServices) {
      expect(service.preparation.length).toBeGreaterThan(0);
      expect(service.boundary.trim().length).toBeGreaterThan(10);
    }
  });
});
