#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const pid = args.find(value => /^\d+$/u.test(value)) ?? process.env.DSAI_LEGACY_PID;
const privateAlpha = args.includes("--private-alpha") || process.env.DSAI_PRIVATE_ALPHA === "true";
const destination = process.env.DSAI_ENV_FILE || "/etc/dsai/dsai.env";

const allowlist = new Set([
  "DATABASE_URL",
  "JWT_SECRET",
  "SESSION_SECRET",
  "VITE_APP_ID",
  "OAUTH_SERVER_URL",
  "VITE_OAUTH_PORTAL_URL",
  "OWNER_OPEN_ID",
  "OWNER_NAME",
  "BUILT_IN_FORGE_API_URL",
  "BUILT_IN_FORGE_API_KEY",
  "VITE_FRONTEND_FORGE_API_URL",
  "VITE_FRONTEND_FORGE_API_KEY",
  "VITE_ANALYTICS_ENDPOINT",
  "VITE_ANALYTICS_WEBSITE_ID",
  "VITE_CAPTCHA_SITE_KEY",
  "CAPTCHA_SECRET_KEY",
  "CAPTCHA_ALLOWED_HOSTNAME",
  "CAPTCHA_VERIFY_URL",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_API_KEY",
  "TWILIO_API_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "CAL_API_KEY",
  "CRM_API_BASE_URL",
  "CRM_API_KEY",
  "MEDIA_WORKER_URL",
  "MEDIA_WORKER_API_KEY",
]);

function fail(message) {
  console.error(`[DSAI][ERROR] ${message}`);
  process.exit(1);
}

function readProcessEnvironment(processId) {
  const source = `/proc/${processId}/environ`;
  if (!fs.existsSync(source)) fail(`Legacy process environment is unavailable: ${source}`);
  const result = {};
  for (const entry of fs.readFileSync(source).toString("utf8").split("\u0000")) {
    const separator = entry.indexOf("=");
    if (separator <= 0) continue;
    const key = entry.slice(0, separator);
    if (allowlist.has(key)) result[key] = entry.slice(separator + 1);
  }
  return result;
}

function quote(value) {
  return JSON.stringify(value);
}

if (!pid) fail("Usage: node scripts/migrate-legacy-env.mjs <legacy-pid> [--private-alpha]");
if (process.platform !== "linux") fail("This migration helper requires Linux /proc process environments.");

const values = readProcessEnvironment(pid);
const required = ["DATABASE_URL", "JWT_SECRET", "VITE_APP_ID", "OAUTH_SERVER_URL", "VITE_OAUTH_PORTAL_URL"];
const missing = required.filter(key => !values[key]);
if (missing.length) fail(`Legacy process is missing required keys: ${missing.join(", ")}`);

values.NODE_ENV = "production";
values.DSAI_RUNTIME_MODE = privateAlpha ? "controlled-alpha" : "production";
values.DSAI_PRIVATE_ALPHA = privateAlpha ? "true" : "false";
values.DSAI_PRIVATE_ALPHA_BIND = privateAlpha ? "127.0.0.1" : "";
values.CAPTCHA_VERIFY_URL ||= "https://challenges.cloudflare.com/turnstile/v0/siteverify";
values.DSAI_REQUIRE_FORGE ||= "0";
values.CAPTCHA_ENABLED = privateAlpha ? "false" : "true";

if (!privateAlpha) {
  const missingPublicCaptcha = ["VITE_CAPTCHA_SITE_KEY", "CAPTCHA_SECRET_KEY", "CAPTCHA_ALLOWED_HOSTNAME"].filter(key => !values[key]);
  if (missingPublicCaptcha.length) fail(`Public production requires CAPTCHA keys before migration: ${missingPublicCaptcha.join(", ")}`);
}

const directory = path.dirname(destination);
fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
const temporary = path.join(directory, `.dsai-env-${process.pid}-${Date.now()}.tmp`);
const content = [
  "# Generated from the legacy process by scripts/migrate-legacy-env.mjs. Keep mode 600.",
  ...Object.entries(values).filter(([, value]) => value !== "").map(([key, value]) => `${key}=${quote(value)}`),
  "",
].join("\n");
fs.writeFileSync(temporary, content, { mode: 0o600, flag: "wx" });
fs.chmodSync(temporary, 0o600);
fs.renameSync(temporary, destination);
console.log(`Migrated ${Object.keys(values).length} allowlisted environment names from legacy PID ${pid} to ${destination}. Secret values were not printed.`);
console.log(`Mode=${values.DSAI_RUNTIME_MODE}; CAPTCHA_ENABLED=${values.CAPTCHA_ENABLED}; DSAI_REQUIRE_FORGE=${values.DSAI_REQUIRE_FORGE}`);
