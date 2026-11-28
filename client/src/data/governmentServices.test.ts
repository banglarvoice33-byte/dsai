import { describe, expect, it } from "vitest";
import { buildGovernmentServiceAssistantPrompt, governmentServices } from "./governmentServices";

describe("government service directory", () => {
  it("uses unique stable service ids", () => {
    const ids = governmentServices.map(service => service.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("links only to HTTPS government portals", () => {
    for (const service of governmentServices) {
      const url = new URL(service.officialUrl);
      expect(url.protocol).toBe("https:");
      expect(url.hostname.endsWith(".gov.bd") || url.hostname.endsWith(".teletalk.com.bd") || url.hostname === "bmu.ac.bd" || url.hostname === "bidaquickserv.org" || url.hostname === "www.mygov.bd").toBe(true);
    }
  });

  it("includes verified public service categories requested for the Bangladesh workdesk", () => {
    const ids = new Set(governmentServices.map(service => service.id));
    for (const id of ["boesl", "ibas", "police-clearance", "etax", "e-family-court", "bmu-outpatient"]) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("uses the direct OSS and D-Nothi product portals", () => {
    const byId = new Map(governmentServices.map(service => [service.id, service]));
    expect(byId.get("invest-bangladesh")?.officialUrl).toBe("https://bidaquickserv.org/");
    expect(byId.get("dnothi")?.officialUrl).toBe("https://portal.nothi.gov.bd/index.html");
  });

  it("uses only supported Workdesk workflow types", () => {
    const supported = new Set(["government", "jobs", "document"]);
    for (const service of governmentServices) {
      expect(supported.has(service.workflow)).toBe(true);
    }
  });


  it("builds AI context for a matched government service instead of returning a canned answer", () => {
    const service = governmentServices.find(item => item.id === "etin");
    expect(service).toBeDefined();
    const prompt = buildGovernmentServiceAssistantPrompt("e-TIN করতে কী কী লাগবে?", service!);
    expect(prompt).toContain("e-TIN করতে কী কী লাগবে?");
    expect(prompt).toContain(service!.officialUrl);
    expect(prompt).toContain("OTP, password, payment credential");
    expect(prompt).toContain("বর্তমান আইনের চূড়ান্ত প্রমাণ");
  });

  it("provides preparation and a clear authority boundary for every service", () => {
    for (const service of governmentServices) {
      expect(service.preparation.length).toBeGreaterThan(0);
      expect(service.boundary.trim().length).toBeGreaterThan(10);
    }
  });
});
