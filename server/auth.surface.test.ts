import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PUBLIC_ALLOWLIST = [
  "captchaConfig", "confirm", "health", "join", "logout", "markViewed", "me",
  "open", "preview", "preview", "preview", "published", "record", "requestDeletion", "verifyCaptcha",
];
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; });

describe("server auth surface", () => {
  it("only allow-listed procedures are public", () => {
    const files = walk("server").filter((p) => p.endsWith(".ts") && !/\.test\./.test(p) && !p.endsWith("_core/trpc.ts"));
    const found = files
      .flatMap((f) => [...readFileSync(f, "utf8").matchAll(/(\w+):\s*publicProcedure/g)].map((m) => m[1]))
      .sort();
    expect(found).toEqual([...PUBLIC_ALLOWLIST].sort());
  });
});
