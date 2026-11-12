#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const envPath = path.resolve(process.argv[2] ?? ".env.production");
const isProduction = (process.env.NODE_ENV ?? "production") === "production";
const failures = [];
const warnings = [];

const fail = message => failures.push(message);
const warn = message => warnings.push(message);

function parseEnvFile(filePath) {
  const values = {};
  const source = fs.readFileSync(filePath, "utf8");
  for (const rawLine of source.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/u);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

function isUrl(value, { requireHttps = false } = {}) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    if (requireHttps && isProduction && url.protocol !== "https:") {
      return url.hostname === "localhost" || url.hostname === "127.0.0.1";
    }
    return Boolean(url.hostname);
  } catch {
    return false;
  }
}

function checkSecret(name, values, { required = true } = {}) {
  const value = values[name] ?? process.env[name] ?? "";
  if (!value) {
    if (required) fail(`${name} is missing`);
    else warn(`${name} is not configured; related provider features remain gated`);
    return;
  }
  if (/replace-with|your[-_]|changeme|example|placeholder|<[^>]+>/iu.test(value)) {
    fail(`${name} still contains a placeholder`);
    return;
  }
  if (value.length < 32) fail(`${name} is too short; use at least 32 characters`);
}

if (!fs.existsSync(envPath)) {
  fail(`environment file not found: ${path.basename(envPath)}`);
} else {
  const stat = fs.statSync(envPath);
  if ((stat.mode & 0o077) !== 0) fail(`${path.basename(envPath)} must not be group/world readable; use chmod 600`);
  let values;
  try {
    values = parseEnvFile(envPath);
  } catch {
    fail(`could not read ${path.basename(envPath)}`);
    values = {};
  }

  const required = ["DATABASE_URL", "JWT_SECRET", "VITE_APP_ID", "OAUTH_SERVER_URL", "VITE_OAUTH_PORTAL_URL"];
  for (const name of required) {
    if (!values[name] && !process.env[name]) fail(`${name} is missing`);
  }
  checkSecret("JWT_SECRET", values);

  const databaseUrl = values.DATABASE_URL ?? process.env.DATABASE_URL ?? "";
  if (databaseUrl && !/^postgres(?:ql):\/\//iu.test(databaseUrl)) fail("DATABASE_URL must use postgresql:// for the current postgres-js/Drizzle driver");
  if (/^mysql:\/\//iu.test(databaseUrl)) fail("DATABASE_URL is MySQL, but this release requires PostgreSQL");
  if (databaseUrl.includes("PASSWORD") || databaseUrl.includes("USER:")) fail("DATABASE_URL still contains a placeholder");

  const strictForge = (values.DSAI_REQUIRE_FORGE ?? process.env.DSAI_REQUIRE_FORGE ?? "0") === "1";
  const runtimeMode = values.DSAI_RUNTIME_MODE ?? process.env.DSAI_RUNTIME_MODE ?? "production";
  const privateAlpha = (values.DSAI_PRIVATE_ALPHA ?? process.env.DSAI_PRIVATE_ALPHA ?? "false") === "true";
  const privateAlphaBind = values.DSAI_PRIVATE_ALPHA_BIND ?? process.env.DSAI_PRIVATE_ALPHA_BIND ?? "127.0.0.1";
  const isPrivateAlpha = runtimeMode === "controlled-alpha" && privateAlpha && privateAlphaBind === "127.0.0.1";
  if (runtimeMode === "controlled-alpha" && !isPrivateAlpha) fail("controlled-alpha requires DSAI_PRIVATE_ALPHA=true and DSAI_PRIVATE_ALPHA_BIND=127.0.0.1");
  if (isPrivateAlpha) warn("private Controlled Alpha is loopback-bound; do not publish it through a public reverse proxy");

  const captchaEnabled = (values.CAPTCHA_ENABLED ?? process.env.CAPTCHA_ENABLED ?? ((isProduction && !isPrivateAlpha) ? "true" : "false")) === "true";
  const captchaDisabledExplicitly = (values.CAPTCHA_ENABLED ?? process.env.CAPTCHA_ENABLED ?? "") === "false";
  if (isProduction && captchaDisabledExplicitly && !isPrivateAlpha) warn("CAPTCHA_ENABLED=false is ignored by public production runtime, which remains fail-closed");
  if (captchaEnabled || (isProduction && !isPrivateAlpha)) {
    const captchaSiteKey = values.VITE_CAPTCHA_SITE_KEY ?? process.env.VITE_CAPTCHA_SITE_KEY ?? "";
    const captchaSecret = values.CAPTCHA_SECRET_KEY ?? process.env.CAPTCHA_SECRET_KEY ?? "";
    const captchaVerifyUrl = values.CAPTCHA_VERIFY_URL ?? process.env.CAPTCHA_VERIFY_URL ?? "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    if (!captchaSiteKey) fail("VITE_CAPTCHA_SITE_KEY is required when CAPTCHA is enabled");
    if (!captchaSecret) fail("CAPTCHA_SECRET_KEY is required when CAPTCHA is enabled");
    if (captchaSecret && captchaSecret.length < 32) fail("CAPTCHA_SECRET_KEY is too short");
    if (captchaSiteKey && /your[-_]|replace-with|example|placeholder|<[^>]+>/iu.test(captchaSiteKey)) fail("VITE_CAPTCHA_SITE_KEY still contains a placeholder");
    if (!isUrl(captchaVerifyUrl)) fail("CAPTCHA_VERIFY_URL must be a valid HTTP(S) URL");
    const captchaHostname = values.CAPTCHA_ALLOWED_HOSTNAME ?? process.env.CAPTCHA_ALLOWED_HOSTNAME ?? "";
    if (captchaHostname && !/^[a-z0-9.-]+$/iu.test(captchaHostname)) fail("CAPTCHA_ALLOWED_HOSTNAME must be a hostname without a scheme or path");
  }

  for (const name of ["OAUTH_SERVER_URL", "VITE_OAUTH_PORTAL_URL"]) {
    const value = values[name] ?? process.env[name] ?? "";
    if (value && !isUrl(value, { requireHttps: true })) fail(`${name} must be a valid HTTPS URL in production`);
  }

  const forgeUrl = values.BUILT_IN_FORGE_API_URL ?? process.env.BUILT_IN_FORGE_API_URL ?? "";
  const forgeKey = values.BUILT_IN_FORGE_API_KEY ?? process.env.BUILT_IN_FORGE_API_KEY ?? "";
  if (strictForge) {
    if (!forgeUrl) fail("BUILT_IN_FORGE_API_URL is required when DSAI_REQUIRE_FORGE=1");
    if (!forgeKey) fail("BUILT_IN_FORGE_API_KEY is required when DSAI_REQUIRE_FORGE=1");
  } else if (!forgeUrl || !forgeKey) {
    warn("BUILT_IN_FORGE_API_URL/BUILT_IN_FORGE_API_KEY are not both configured; Forge-backed features remain gated");
  }
  if (forgeUrl && !isUrl(forgeUrl)) fail("BUILT_IN_FORGE_API_URL must be a valid HTTP(S) URL");
  if (forgeKey && forgeKey.length < 32) fail("BUILT_IN_FORGE_API_KEY is too short");

  const browserSafeViteKeys = new Set(["VITE_CAPTCHA_SITE_KEY", "VITE_FRONTEND_FORGE_API_KEY"]);
  for (const [name, value] of Object.entries(values)) {
    if (/^VITE_.*(?:KEY|SECRET|PASSWORD|TOKEN)$/iu.test(name) && value && !browserSafeViteKeys.has(name)) fail(`${name} looks like a secret exposed to the browser; rename it as a server-only variable`);
  }
}

if (warnings.length) for (const message of warnings) console.log(`[WARN] ${message}`);
if (failures.length) {
  for (const message of failures) console.error(`[FAIL] ${message}`);
  console.error(`Configuration validation failed with ${failures.length} error(s). No secret values were printed.`);
  process.exit(1);
}
console.log(`[PASS] DSAI production configuration is valid${warnings.length ? ` with ${warnings.length} warning(s)` : ""}. No secret values were printed.`);
