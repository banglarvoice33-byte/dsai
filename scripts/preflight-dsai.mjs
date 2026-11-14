#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.argv[2] ?? ".env.production");
const optionalGroups = {
  "Google Calendar connector": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  "HubSpot/CRM connector": ["CRM_API_BASE_URL", "CRM_API_KEY"],
  "Built-in Forge": ["BUILT_IN_FORGE_API_URL", "BUILT_IN_FORGE_API_KEY"],
};
// Supabase Auth is the primary identity provider. Manus OAuth remains an
// optional compatibility integration for legacy sessions/scheduled tasks.
const optionalManus = ["OAUTH_SERVER_URL", "VITE_APP_ID", "VITE_OAUTH_PORTAL_URL"];
const required = ["DATABASE_URL", "JWT_SECRET"];

function parseEnv(file) {
  const values = {};
  if (!fs.existsSync(file)) return values;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/u)) {
    const line = raw.trim();
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/u);
    if (!match || line.startsWith("#")) continue;
    let value = match[2].trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[match[1]] = value;
  }
  return values;
}

const fileValues = parseEnv(envPath);
const get = key => fileValues[key] ?? process.env[key] ?? "";
const status = key => get(key) ? "configured" : "missing";
const failures = [];

if (!fs.existsSync(envPath)) failures.push(`environment file missing: ${path.basename(envPath)}`);
else if ((fs.statSync(envPath).mode & 0o077) !== 0) failures.push(`${path.basename(envPath)} must be mode 600 or stricter`);

console.log(`DSAI preflight: ${envPath}`);
for (const key of required) {
  const state = status(key);
  console.log(`${state.padEnd(10)} ${key}`);
  if (state === "missing") failures.push(`${key} is missing`);
}
const manusConfigured = optionalManus.every(key => Boolean(get(key)));
console.log(`${manusConfigured ? "configured" : "disabled"}    Legacy Manus OAuth / scheduled-task compatibility (${optionalManus.join(", ")})`);

for (const [label, keys] of Object.entries(optionalGroups)) {
  const ready = keys.every(key => Boolean(get(key)));
  console.log(`${ready ? "configured" : "gated"}    ${label} (${keys.join(", ")})`);
}
console.log(`${status("CAPTCHA_SECRET_KEY").padEnd(10)} CAPTCHA_SECRET_KEY (production login protection)`);
console.log(`${status("CAPTCHA_ALLOWED_HOSTNAME").padEnd(10)} CAPTCHA_ALLOWED_HOSTNAME`);
console.log("No secret values were printed.");

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
console.log("PASS: core startup contract is present; optional provider actions remain independently gated.");
