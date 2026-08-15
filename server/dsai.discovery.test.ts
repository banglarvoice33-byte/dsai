import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const index = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");
const robots = readFileSync(new URL("../client/public/robots.txt", import.meta.url), "utf8");

describe("DSAI discovery layer", () => {
  it("publishes practical Learn answers and transparent social status", () => {
    expect(home).toContain("DSAI শিখুন");
    expect(home).toContain("Official social channels are not published yet.");
    expect(home).toContain("info@banglarvoice24news.com");
  });

  it("publishes truthful structured metadata and crawl controls", () => {
    expect(index).toContain('"@type": "Organization"');
    expect(index).toContain('"@type": "FAQPage"');
    expect(robots).toContain("User-agent: OAI-SearchBot");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Disallow: /admin/");
  });
});
