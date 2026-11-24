import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("DSAI branding configuration", () => {
  it("serves the requested public application title", () => {
    const html = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");
    expect(html).toContain("<title>DSAI — বাংলা-প্রথম AI Workdesk</title>");
    expect(html).toContain('property="og:site_name" content="DSAI"');
    expect(html).toContain('"@type": "Organization"');
    expect(html).not.toContain('rel="canonical"');
    expect(html).not.toContain('"@type": "FAQPage"');
  });
});
