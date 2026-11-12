import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("DSAI branding configuration", () => {
  it("serves the requested public application title", () => {
    const html = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");
    expect(html).toContain("<title>DSAI — Bengali-first AI Workdesk</title>");
  });
});
