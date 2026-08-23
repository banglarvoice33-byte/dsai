import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);
const template = readFileSync(new URL(".env.production.example", root), "utf8");
const helper = readFileSync(new URL("scripts/setup-vps-env.mjs", root), "utf8");
const deploy = readFileSync(new URL("deploy-genesis.sh", root), "utf8");
const bootstrap = readFileSync(new URL("scripts/bootstrap-dsai-vm.sh", root), "utf8");
const gitignore = readFileSync(new URL(".gitignore", root), "utf8");


describe("secure VPS production environment workflow", () => {
  it("documents core, Forge, production security, and optional connector variables without real secrets", () => {
    expect(template).toContain("DATABASE_URL=mysql://<database_user>");
    expect(template).toContain("BUILT_IN_FORGE_API_URL");
    expect(template).toContain("DSAI_REQUIRE_FORGE=0");
    expect(template).toContain("DSAI_RUNTIME_MODE=production");
    expect(template).toContain("DSAI_PRIVATE_ALPHA_BIND=127.0.0.1");
    expect(template).toContain("VITE_CAPTCHA_SITE_KEY");
    expect(template).toContain("TWILIO_ACCOUNT_SID");
    expect(template).toContain("CAL_API_KEY");
    expect(template).toContain("CRM_API_KEY");
    expect(template).toContain("MEDIA_WORKER_API_KEY");
    expect(template).not.toMatch(/(?:sk_live|AKIA|-----BEGIN|mysql:\/\/[^<\s]+:[^<\s]+@)/u);
  });

  it("creates mode 600 output, refuses accidental overwrite, and never prints values", () => {
    expect(helper).toContain("fs.chmodSync(envPath, 0o600)");
    expect(helper).toContain("Use --force only when intentionally replacing it.");
    expect(helper).toContain("Secret values were not printed.");
    expect(helper).toContain("const coreRequired");
    expect(helper).toContain("const forgeRequired");
    expect(helper).toContain("const isPrivateAlpha");
    expect(helper).not.toContain("console.log(`${key}=${value}`)");
  });

  it("keeps the bootstrap output external to the application tree", () => {
    expect(bootstrap).toContain('sudo install -m 0600 -o "$APP_USER" -g "$APP_GROUP" "$env_tmp" /etc/dsai/dsai.env');
    expect(bootstrap).toContain('sudo rm -f -- "$APP_ROOT/.env.production"');
    expect(bootstrap).not.toContain('sudo install -m 0640 -o root -g "$APP_GROUP" "$env_tmp" "$APP_ROOT/.env.production"');
    expect(gitignore).toContain(".env*");
    expect(gitignore).toContain("!.env.production.example");
  });

  it("integrates interactive setup only when the deployment is attached to a terminal", () => {
    expect(deploy).toContain("node \"${APP_DIR}/scripts/setup-vps-env.mjs\"");
    expect(deploy).toContain("if [[ -t 0 && -t 1 ]]");
    expect(deploy).toContain("node scripts/setup-vps-env.mjs");
    expect(deploy).toContain("chmod 600 \"${ENV_FILE}\"");
    expect(deploy.indexOf('node "${APP_DIR}/scripts/validate-production-env.mjs"')).toBeLessThan(deploy.lastIndexOf("  stop_previous"));
    expect(deploy).toContain('ENV_FILE="${DSAI_ENV_FILE:-/etc/dsai/dsai.env}"');
  });

  it("keeps the example template non-sensitive and readable", () => {
    const mode = statSync(new URL(".env.production.example", root)).mode & 0o777;
    expect(mode & 0o004).toBe(0o004);
  });
});
