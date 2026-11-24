import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PREFIX_RULES, ROUTE_ACCESS, accessOf } from "../client/src/lib/routeAccess";

describe("sitemap and robots follow routeAccess", () => {
  const sitemap = readFileSync("client/public/sitemap.xml", "utf8");
  const robots = readFileSync("client/public/robots.txt", "utf8");
  const paths = [...sitemap.matchAll(/<loc>https:\/\/dsai-hub\.vercel\.app(\/[^<]*)?<\/loc>/g)].map((m) => m[1] ?? "/");
  it("lists only public pages", () => {
    for (const p of paths) expect(accessOf(p), p).toBe("public");
  });
  it("disallows every non-public path", () => {
    const closed = [...Object.entries(ROUTE_ACCESS), ...PREFIX_RULES].filter(([, a]) => a !== "public").map(([p]) => p);
    for (const p of closed) expect(robots).toContain(`Disallow: ${p}`);
  });
});
