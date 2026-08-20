#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const [zipPath = "/home/ubuntu/DSAI_production_release_FINAL_2026-08-20.zip", outputPath = "/home/ubuntu/DSAI_one_command_vps_deploy_2026-08-20.run"] = process.argv.slice(2);

if (!fs.existsSync(zipPath)) {
  console.error(`Release ZIP not found: ${zipPath}`);
  process.exit(1);
}

const archive = fs.readFileSync(zipPath);
const sha256 = crypto.createHash("sha256").update(archive).digest("hex");
const payload = archive.toString("base64").replace(/(.{1,76})/gu, "$1\n");

const header = `#!/usr/bin/env bash
# DSAI credential-free self-extracting VPS deploy bundle.
# No real secrets are embedded. Secrets must come from an existing protected
# /etc/dsai/dsai.env or a readable legacy Linux process environment.
set -Eeuo pipefail
IFS=$'\\n\\t'
EXPECTED_SHA256="${sha256}"
MARKER="__DSAI_ARCHIVE_BELOW__"
TMP_DIR="$(mktemp -d "\${TMPDIR:-/tmp}/dsai-one-command.XXXXXX")"
ZIP_PATH="\${TMP_DIR}/release.zip"
cleanup() { rm -rf "\${TMP_DIR}"; }
trap cleanup EXIT
awk -v marker="\${MARKER}" 'seen { print } $0 == marker { seen=1 }' "$0" | base64 -d > "$ZIP_PATH"
ACTUAL_SHA256="$(sha256sum "$ZIP_PATH" | awk '{print $1}')"
printf 'EXPECTED_SHA256=%s\\nACTUAL_SHA256=%s\\n' "$EXPECTED_SHA256" "$ACTUAL_SHA256"
test "$EXPECTED_SHA256" = "$ACTUAL_SHA256"
unzip -tq "$ZIP_PATH"
APP_ROOT="\${DSAI_APP_ROOT:-$HOME/dsai}"
mkdir -p "$APP_ROOT/releases" "$APP_ROOT/shared" "$APP_ROOT/backups" "$APP_ROOT/logs" "$APP_ROOT/run"
PREVIOUS_TARGET=""
if [[ -L "$APP_ROOT/current" ]]; then PREVIOUS_TARGET="$(readlink "$APP_ROOT/current")"; fi
CURRENT_SWITCHED=0
rollback_current() {
  status=$?
  if (( status != 0 )) && (( CURRENT_SWITCHED == 1 )) && [[ -n "$PREVIOUS_TARGET" ]]; then
    ln -sfn "$PREVIOUS_TARGET" "$APP_ROOT/current" || true
    printf 'ROLLBACK_CURRENT=%s\\n' "$PREVIOUS_TARGET" >&2
  fi
  exit "$status"
}
trap rollback_current ERR
if [[ -n "\${DSAI_ENV_FILE:-}" ]]; then
  ENV_FILE="$DSAI_ENV_FILE"
elif [[ -r /etc/dsai/dsai.env ]]; then
  ENV_FILE="/etc/dsai/dsai.env"
else
  ENV_FILE="/etc/dsai/dsai.env"
fi
RELEASE_DIR="$APP_ROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$RELEASE_DIR"
unzip -q "$ZIP_PATH" -d "$RELEASE_DIR"
test -f "$RELEASE_DIR/package.json" -a -f "$RELEASE_DIR/deploy-genesis.sh"
cd "$RELEASE_DIR"
if [[ -n "\${DSAI_LEGACY_PID:-}" ]]; then
  if [[ "\${DSAI_PRIVATE_ALPHA:-false}" == "true" ]]; then
    DSAI_ENV_FILE="$ENV_FILE" node scripts/migrate-legacy-env.mjs "$DSAI_LEGACY_PID" --private-alpha
  else
    DSAI_ENV_FILE="$ENV_FILE" node scripts/migrate-legacy-env.mjs "$DSAI_LEGACY_PID"
  fi
elif [[ ! -s "$ENV_FILE" ]]; then
  if ! DSAI_APP_ROOT="$APP_ROOT" DSAI_RELEASE_DIR="$RELEASE_DIR" DSAI_ENV_FILE="$ENV_FILE" DSAI_PRIVATE_ALPHA="\${DSAI_PRIVATE_ALPHA:-false}" bash "$RELEASE_DIR/scripts/prepare-vps-env-safe.sh"; then
    if [[ -t 0 && -t 1 ]]; then
      if [[ "\${DSAI_PRIVATE_ALPHA:-false}" == "true" ]]; then
        DSAI_RUNTIME_MODE=controlled-alpha DSAI_PRIVATE_ALPHA=true node scripts/setup-vps-env.mjs
      else
        DSAI_RUNTIME_MODE=production DSAI_PRIVATE_ALPHA=false node scripts/setup-vps-env.mjs
      fi
      ENV_FILE="$RELEASE_DIR/.env.production"
    else
      echo "DSAI_ENV_FILE is missing and no unique legacy process could provide an allowlisted environment." >&2
      exit 1
    fi
  fi
fi
test -s "$ENV_FILE"
chmod 600 "$ENV_FILE"
node scripts/validate-production-env.mjs "$ENV_FILE"
ln -sfn "$RELEASE_DIR" "$APP_ROOT/current"
CURRENT_SWITCHED=1
cd "$APP_ROOT/current"
DSAI_ENV_FILE="$ENV_FILE" bash deploy-genesis.sh
PORT="$(cat .dsai-runtime/port)"
curl -fsS "http://127.0.0.1:\${PORT}/healthz"
curl -fsS -o /dev/null -w 'LOCAL_LOGIN=%{http_code}\\n' "http://127.0.0.1:\${PORT}/auth/login"
printf 'DSAI_ONE_COMMAND_DEPLOY=PASS\\nCURRENT=%s\\nPORT=%s\\n' "$(pwd)" "$PORT"
exit 0
__DSAI_ARCHIVE_BELOW__
`;

const output = `${header}${payload}`;
fs.writeFileSync(outputPath, output, { mode: 0o700 });
fs.chmodSync(outputPath, 0o700);
console.log(`Created ${outputPath}`);
console.log(`Embedded credential-free release SHA-256: ${sha256}`);
console.log("No real secrets were embedded; use DSAI_LEGACY_PID or a protected DSAI_ENV_FILE at runtime.");
