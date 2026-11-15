#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const appDir = path.resolve(new URL("..", import.meta.url).pathname);
const envPath = process.env.DSAI_ENV_FILE || "/etc/dsai/dsai.env";
const examplePath = path.join(appDir, ".env.production.example");
const force = process.argv.includes("--force");

const coreRequired = [
  ["DATABASE_URL", "PostgreSQL/Supabase URL, for example postgresql://user:password@host:5432/database?sslmode=require"],
  ["JWT_SECRET", "Server-only session signing secret; blank generates a secure value"],
];

const legacyManusOptional = [
  ["VITE_APP_ID", "Legacy Manus OAuth application ID (optional; not required for Supabase login)"],
  ["OAUTH_SERVER_URL", "HTTPS legacy Manus OAuth server URL (optional; also used to verify legacy scheduled-task identity)"],
  ["VITE_OAUTH_PORTAL_URL", "HTTPS legacy Manus OAuth browser portal URL (optional)"],
];

const forgeRequired = [
  ["BUILT_IN_FORGE_API_URL", "HTTPS Manus Built-in API URL"],
  ["BUILT_IN_FORGE_API_KEY", "Server-only Manus Built-in API key"],
];

const captchaRequired = [
  ["VITE_CAPTCHA_SITE_KEY", "Browser-safe Turnstile site key required by public production runtime"],
  ["CAPTCHA_SECRET_KEY", "Server-only Turnstile secret required by public production runtime"],
  ["CAPTCHA_ALLOWED_HOSTNAME", "Active hostname without https:// or a path"],
];
const hiddenKeys = new Set(["DATABASE_URL", "JWT_SECRET", "BUILT_IN_FORGE_API_KEY", "CAPTCHA_SECRET_KEY", "TWILIO_API_KEY", "TWILIO_API_SECRET", "GOOGLE_CLIENT_SECRET", "CAL_API_KEY", "CRM_API_KEY", "MEDIA_WORKER_API_KEY"]);

const optional = [
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
];

function existingValues() {
  if (!fs.existsSync(envPath)) return {};
  const values = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/u)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/u);
    if (match) values[match[1]] = match[2].replace(/^"|"$/gu, "");
  }
  return values;
}

function quote(value) {
  return JSON.stringify(value);
}

async function ask(rl, prompt, hidden = false) {
  if (!hidden || !process.stdin.isTTY || process.platform === "win32") return rl.question(prompt);
  process.stdout.write(prompt);
  process.stdin.setRawMode(true);
  let value = "";
  return new Promise((resolve, reject) => {
    const onData = chunk => {
      const text = chunk.toString("utf8");
      if (text === "\u0003") {
        process.stdin.setRawMode(false);
        process.stdin.off("data", onData);
        reject(new Error("Credential entry cancelled"));
        return;
      }
      if (text === "\r" || text === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.off("data", onData);
        process.stdout.write("\n");
        resolve(value);
        return;
      }
      if (text === "\u007f") {
        value = value.slice(0, -1);
        return;
      }
      value += text;
    };
    process.stdin.on("data", onData);
  });
}

async function main() {
  if (fs.existsSync(envPath) && !force) {
    console.error(`Protected environment file already exists at ${envPath}. Use --force only when intentionally replacing it.`);
    process.exit(1);
  }
  if (!fs.existsSync(examplePath)) {
    console.error(".env.production.example is missing.");
    process.exit(1);
  }

  const current = existingValues();
  const rl = readline.createInterface({ input, output });
  const runtimeMode = process.env.DSAI_RUNTIME_MODE || "production";
  const privateAlpha = process.env.DSAI_PRIVATE_ALPHA === "true";
  const isPrivateAlpha = runtimeMode === "controlled-alpha" && privateAlpha;
  const requireForge = process.env.DSAI_REQUIRE_FORGE === "1";
  const required = [
    ...coreRequired,
    ...(requireForge ? forgeRequired : []),
    ...(!isPrivateAlpha ? captchaRequired : []),
  ];

  const values = {
    NODE_ENV: "production",
    PORT: process.env.PORT || "3010",
    DSAI_APP_NAME: "dsai-platform",
    DSAI_RUNTIME_MODE: runtimeMode,
    DSAI_PRIVATE_ALPHA: privateAlpha ? "true" : "false",
    DSAI_PRIVATE_ALPHA_BIND: isPrivateAlpha ? "127.0.0.1" : "",
    CAPTCHA_VERIFY_URL: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    DSAI_REQUIRE_FORGE: requireForge ? "1" : "0",
  };

  try {
    for (const [key, description] of required) {
      const defaultValue = current[key] || process.env[key] || (key === "JWT_SECRET" ? crypto.randomBytes(48).toString("base64url") : "");
      const suffix = key === "JWT_SECRET" && !current[key] && !process.env[key] ? " (blank = generate securely)" : "";
      const answer = await ask(rl, `${key} — ${description}${suffix}: `, hiddenKeys.has(key));
      const value = answer.trim() || defaultValue;
      if (!value) throw new Error(`${key} is required`);
      values[key] = value;
    }
    for (const [key, description] of legacyManusOptional) {
      const answer = await ask(rl, `${key} — ${description} (press Enter to skip): `);
      const value = answer.trim() || current[key] || process.env[key] || "";
      if (value) values[key] = value;
    }
    for (const key of optional) {
      const answer = await ask(rl, `${key} (optional, press Enter to skip): `, hiddenKeys.has(key));
      const value = answer.trim() || current[key] || process.env[key] || "";
      if (value) values[key] = value;
    }
  } finally {
    rl.close();
  }

  const lines = [
    "# Generated by scripts/setup-vps-env.mjs. Keep this protected external file private and chmod 600.",
    ...Object.entries(values).map(([key, value]) => `${key}=${quote(value)}`),
    "",
  ];
  fs.mkdirSync(path.dirname(envPath), { recursive: true, mode: 0o700 });
  fs.writeFileSync(envPath, lines.join("\n"), { mode: 0o600, flag: "w" });
  fs.chmodSync(envPath, 0o600);
  console.log(`Created protected external environment file at ${envPath} with mode 600. Secret values were not printed.`);
  console.log(`Next: node scripts/validate-production-env.mjs ${envPath}`);
}

main().catch(error => {
  console.error(`[ERROR] ${error instanceof Error ? error.message : "Could not create production environment"}`);
  process.exit(1);
});
