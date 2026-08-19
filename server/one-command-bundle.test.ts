import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const generator = path.resolve(process.cwd(), "scripts/build-one-command-vps-bundle.mjs");
const release = "/home/ubuntu/DSAI_production_release_FINAL_2026-08-20.zip";

describe("one-command VPS bundle", () => {
  it("generates an executable wrapper with an embedded checksum and no real environment file", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "dsai-bundle-test-"));
    const output = path.join(dir, "deploy.run");
    await execFileAsync(process.execPath, [generator, release, output]);
    const stat = await fs.stat(output);
    const content = await fs.readFile(output, "utf8");
    expect(stat.mode & 0o111).toBeGreaterThan(0);
    expect(content).toContain("EXPECTED_SHA256=\"");
    expect(content).toContain("__DSAI_ARCHIVE_BELOW__");
    expect(content).not.toMatch(/^DATABASE_URL=/mu);
    expect(content).not.toMatch(/^JWT_SECRET=/mu);
    expect(content).not.toMatch(/^CAPTCHA_SECRET_KEY=/mu);
  });

  it("does not claim that the one-file bundle contains secrets", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "dsai-bundle-test-"));
    const output = path.join(dir, "deploy.run");
    const result = await execFileAsync(process.execPath, [generator, release, output]);
    expect(result.stdout).toContain("No real secrets were embedded");
  });
});
