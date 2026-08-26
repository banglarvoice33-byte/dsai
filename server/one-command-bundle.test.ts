import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const generator = path.resolve(process.cwd(), "scripts/build-one-command-vps-bundle.mjs");
const envHelper = path.resolve(process.cwd(), "scripts/prepare-vps-env-safe.sh");

async function createFixtureRelease() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "dsai-release-fixture-"));
  const source = path.join(dir, "source");
  const release = path.join(dir, "release.zip");
  await fs.mkdir(source, { recursive: true });
  await fs.writeFile(path.join(source, "package.json"), '{"name":"dsai-fixture","version":"1.0.0"}\n');
  await fs.writeFile(path.join(source, "deploy-genesis.sh"), "#!/usr/bin/env bash\n");
  await new Promise<void>((resolve, reject) => {
    execFile("zip", ["-qr", release, "."], { cwd: source }, error => (error ? reject(error) : resolve()));
  });
  return { dir, release };
}

describe("one-command VPS bundle", () => {
  it("generates an executable wrapper with an embedded checksum and no real environment file", async () => {
    const fixture = await createFixtureRelease();
    const output = path.join(fixture.dir, "deploy.run");
    await execFileAsync(process.execPath, [generator, fixture.release, output]);
    const stat = await fs.stat(output);
    const content = await fs.readFile(output, "utf8");
    expect(stat.mode & 0o111).toBeGreaterThan(0);
    expect(content).toContain("EXPECTED_SHA256=\"");
    expect(content).toContain("__DSAI_ARCHIVE_BELOW__");
    expect(content).not.toMatch(/^DATABASE_URL=/mu);
    expect(content).not.toMatch(/^JWT_SECRET=/mu);
    expect(content).not.toMatch(/^CAPTCHA_SECRET_KEY=/mu);
    expect(content).toContain('if [[ -r /etc/dsai/dsai.env ]]');
    expect(content).toContain('no unique legacy process could provide an allowlisted environment');
    expect(content).toContain('chmod 600 "$ENV_FILE"');
    expect(content).toContain('DSAI_ENV_FILE="$ENV_FILE" bash deploy-genesis.sh');
    expect(content).not.toContain('cp "$ENV_FILE" "$RELEASE_DIR/.env.production"');
    expect(content).not.toContain('ENV_FILE="$RELEASE_DIR/.env.production"');
    expect(content).toContain('DSAI_ENV_FILE="$ENV_FILE" DSAI_RUNTIME_MODE=production DSAI_PRIVATE_ALPHA=false node scripts/setup-vps-env.mjs');
    expect(content).toContain('DSAI_ENV_FILE="$ENV_FILE" DSAI_RUNTIME_MODE=controlled-alpha DSAI_PRIVATE_ALPHA=true node scripts/setup-vps-env.mjs');
    expect(content).toContain('CURRENT_SWITCHED=0');
    expect(content).toContain('ROLLBACK_CURRENT=');
    const extracted = path.join(fixture.dir, "extracted.zip");
    await execFileAsync("bash", ["-c", `awk '/^__DSAI_ARCHIVE_BELOW__$/{seen=1; next} seen{print}' "$1" | base64 -d > "$2"`, "bundle-test", output, extracted]);
    await execFileAsync("unzip", ["-tq", extracted]);
  });

  it("keeps environment preparation secret-safe and fail-closed", async () => {
    const content = await fs.readFile(envHelper, "utf8");
    expect(content).toContain("chmod 600");
    expect(content).toContain("migrate-legacy-env.mjs");
    expect(content).toContain("Exactly one legacy DSAI process is required");
    expect(content).toContain("SECRET_VALUES_PRINTED=false");
    expect(content).not.toMatch(/^DATABASE_URL=/mu);
    expect(content).not.toMatch(/^JWT_SECRET=/mu);
    await execFileAsync("bash", ["-n", envHelper]);
  });

  it("does not claim that the one-file bundle contains secrets", async () => {
    const fixture = await createFixtureRelease();
    const output = path.join(fixture.dir, "deploy.run");
    const result = await execFileAsync(process.execPath, [generator, fixture.release, output]);
    expect(result.stdout).toContain("No real secrets were embedded");
  });
});
