import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const script = path.resolve(process.cwd(), "scripts/migrate-legacy-env.mjs");

async function runMigration(args: string[], env: NodeJS.ProcessEnv = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "dsai-migration-test-"));
  const envFile = path.join(dir, "dsai.env");
  const child = await execFileAsync(process.execPath, [script, ...args], {
    env: { ...process.env, DSAI_ENV_FILE: envFile, ...env },
  }).catch(error => error as { stdout?: string; stderr?: string; code?: number });
  return { envFile, stdout: child.stdout ?? "", stderr: child.stderr ?? "", code: child.code ?? 0 };
}

describe("legacy environment migration", () => {
  it("has a syntax-valid migration entrypoint", async () => {
    const result = await execFileAsync(process.execPath, ["--check", script]);
    expect(result.stderr).toBe("");
  });

  it("does not print secret values when the PID is missing", async () => {
    const result = await runMigration(["999999"]);
    expect(result.code).toBe(1);
    expect(result.stderr).not.toMatch(/DATABASE_URL=.*@/u);
    expect(result.stderr).toContain("Legacy process environment is unavailable");
  });

  it("requires explicit private-alpha mode for a no-CAPTCHA migration", async () => {
    const result = await runMigration([]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Usage:");
  });
});
