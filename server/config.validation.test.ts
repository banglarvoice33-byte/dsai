import { chmod, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const validator = path.resolve(process.cwd(), "scripts/validate-production-env.mjs");

const sampleDatabaseUrl = ["postgresql://", "dsai:", "strong-password@127.0.0.1:5432/dsai?sslmode=require"].join("");
const validEnv = `NODE_ENV=production
DATABASE_URL=${sampleDatabaseUrl}
JWT_SECRET=${"a".repeat(64)}
VITE_APP_ID=oauth-app-id
OAUTH_SERVER_URL=https://oauth.example.com
VITE_OAUTH_PORTAL_URL=https://oauth.example.com/login
BUILT_IN_FORGE_API_URL=https://forge.example.com
BUILT_IN_FORGE_API_KEY=${"b".repeat(64)}
VITE_CAPTCHA_SITE_KEY=turnstile-site-key-for-test
CAPTCHA_SECRET_KEY=${"c".repeat(64)}
CAPTCHA_ALLOWED_HOSTNAME=localhost
CAPTCHA_VERIFY_URL=https://challenges.cloudflare.com/turnstile/v0/siteverify
`;

async function runValidator(content: string, mode = 0o600, strictForge = false, overrides: Record<string, string> = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "dsai-env-"));
  const file = path.join(dir, ".env.production");
  await writeFile(file, content, { mode });
  try {
    return await execFileAsync(process.execPath, [validator, file], {
      env: { ...process.env, NODE_ENV: "production", DSAI_REQUIRE_FORGE: strictForge ? "1" : "0", BUILT_IN_FORGE_API_URL: "", BUILT_IN_FORGE_API_KEY: "", VITE_CAPTCHA_SITE_KEY: "", CAPTCHA_SECRET_KEY: "", CAPTCHA_ALLOWED_HOSTNAME: "", ...overrides },
    });
  } catch (error) {
    const result = error as { stdout?: string; stderr?: string; code?: number };
    return { stdout: result.stdout ?? "", stderr: result.stderr ?? "", code: result.code ?? 1 };
  }
}

describe("production environment validator", () => {
  it("accepts valid configuration without printing values", async () => {
    const result = await runValidator(validEnv);
    expect(result.code ?? 0).toBe(0);
    expect(result.stdout).toContain("[PASS]");
    expect(result.stdout).not.toContain("strong-password");
    expect(result.stdout).not.toContain("a".repeat(20));
  });

  it("rejects MySQL URLs because DSAI uses postgres-js", async () => {
    const result = await runValidator(validEnv.replace("postgresql://", "mysql://"));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("requires PostgreSQL");
  });

  it("rejects weak or placeholder secrets", async () => {
    const result = await runValidator(validEnv.replace("a".repeat(64), "replace-with-secret"));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("placeholder");
  });

  it("rejects unsafe env-file permissions", async () => {
    const result = await runValidator(validEnv, 0o644);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("must not be group/world readable");
  });

  it("requires CAPTCHA credentials for public production", async () => {
    const result = await runValidator(validEnv.replace(/VITE_CAPTCHA_SITE_KEY=.*\nCAPTCHA_SECRET_KEY=.*\nCAPTCHA_ALLOWED_HOSTNAME=.*\nCAPTCHA_VERIFY_URL=.*\n/gu, ""));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("VITE_CAPTCHA_SITE_KEY is required");
  });

  it("allows no-CAPTCHA only for loopback-bound private Controlled Alpha", async () => {
    const privateAlphaEnv = validEnv.replace(/VITE_CAPTCHA_SITE_KEY=.*\nCAPTCHA_SECRET_KEY=.*\nCAPTCHA_ALLOWED_HOSTNAME=.*\nCAPTCHA_VERIFY_URL=.*\n/gu, "") + "DSAI_RUNTIME_MODE=controlled-alpha\nDSAI_PRIVATE_ALPHA=true\nDSAI_PRIVATE_ALPHA_BIND=127.0.0.1\nCAPTCHA_ENABLED=false\n";
    const result = await runValidator(privateAlphaEnv);
    expect(result.code ?? 0).toBe(0);
    expect(result.stdout).toContain("private Controlled Alpha");
  });

  it("requires Forge credentials when strict mode is enabled", async () => {
    const result = await runValidator(validEnv.replace(/BUILT_IN_FORGE_API_[^=]+=.*\n/gu, ""), 0o600, true);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("BUILT_IN_FORGE_API_KEY is required");
  });

  it("honors DSAI_REQUIRE_FORGE=1 from the environment file", async () => {
    const result = await runValidator(validEnv.replace(/BUILT_IN_FORGE_API_[^=]+=.*\n/gu, "") + "DSAI_REQUIRE_FORGE=1\n");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("BUILT_IN_FORGE_API_KEY is required");
  });

  it("rejects browser-exposed secret names", async () => {
    const result = await runValidator(`${validEnv}VITE_PROVIDER_API_KEY=${"c".repeat(64)}\n`);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("looks like a secret exposed to the browser");
  });
});
