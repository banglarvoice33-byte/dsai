#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const envPath = path.resolve(process.argv[2] ?? ".env.production");
const isProduction = (process.env.NODE_ENV ?? "production") === "production";
const strictForge = process.env.DSAI_REQUIRE_FORGE === "1";
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
  if (databaseUrl && !/^mysql:\/\//iu.test(databaseUrl)) fail("DATABASE_URL must use mysql:// for the current mysql2/Drizzle driver");
  if (/postgres(?:ql)?:\/\//iu.test(databaseUrl)) fail("DATABASE_URL is PostgreSQL, but this release requires MySQL");
  if (databaseUrl.includes("PASSWORD") || databaseUrl.includes("USER:")) fail("DATABASE_URL still contains a placeholder");

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

  for (const [name, value] of Object.entries(values)) {
    if (/^VITE_.*(?:KEY|SECRET|PASSWORD|TOKEN)$/iu.test(name) && value) fail(`${name} looks like a secret exposed to the browser; rename it as a server-only variable`);
  }
}

if (warnings.length) for (const message of warnings) console.log(`[WARN] ${message}`);
if (failures.length) {
  for (const message of failures) console.error(`[FAIL] ${message}`);
  console.error(`Configuration validation failed with ${failures.length} error(s). No secret values were printed.`);
  process.exit(1);
}
console.log(`[PASS] DSAI production configuration is valid${warnings.length ? ` with ${warnings.length} warning(s)` : ""}. No secret values were printed.`);
