import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const script = readFileSync(new URL("../scripts/package-credential-free-release.sh", import.meta.url), "utf8");

describe("credential-free release packaging", () => {
  it("preserves the safe production environment template", () => {
    expect(script).toContain("grep -Fxq '.env.production.example'");
    expect(script).toContain("'.env*'");
    expect(script).toContain("zip -q \"$OUT\" .env.production.example");
  });

  it("excludes real environment files and credential artifacts", () => {
    expect(script).toContain("'.env*'");
    expect(script).toContain("'**/.env*'");
    expect(script).toContain(".*\\.pem$");
    expect(script).toContain(".*\\.key$");
    expect(script).toContain("credentials\\.json");
  });

  it("writes a checksum manifest and never embeds secret values", () => {
    expect(script).toContain("sha256sum");
    expect(script).toContain("SECRET_POLICY=credential-free");
    expect(script).not.toMatch(/^DATABASE_URL=/mu);
    expect(script).not.toMatch(/^JWT_SECRET=/mu);
  });
});
