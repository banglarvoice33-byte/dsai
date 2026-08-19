#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

ARCHIVE_URL="https://files.manuscdn.com/user_upload_by_module/session_file/310519663894044315/rJnenNFlgJvQtisR.zip"
EXPECTED_SHA256="edd4b62a98e3a216b467de0f43e9494a53dd5a1092062dacdf8a78175022a395"
APP_USER="$(whoami)"
APP_ROOT="/home/${APP_USER}/dsai"
ZIP_PATH="$HOME/.dsai-one-time-release.zip"
WORK_DIR="$HOME/.dsai-one-time-work"

command -v curl >/dev/null || { echo 'curl is required' >&2; exit 1; }
command -v unzip >/dev/null || { echo 'unzip is required' >&2; exit 1; }
command -v sha256sum >/dev/null || { echo 'sha256sum is required' >&2; exit 1; }

printf '%s\n' 'এই one-time wrapper কোনো secret বহন করে না। এটি verified release download করবে এবং পরে wrapper file delete করার সুযোগ দেবে।'
read -rp 'শুরু করতে DSAI-START লিখুন: ' START_CONFIRM
[[ "$START_CONFIRM" == 'DSAI-START' ]] || { echo 'Cancelled; no change made.'; exit 1; }

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR" "$APP_ROOT/releases"
curl -fL --retry 3 --connect-timeout 15 --max-time 300 "$ARCHIVE_URL" -o "$ZIP_PATH"
ACTUAL_SHA256="$(sha256sum "$ZIP_PATH" | awk '{print $1}')"
[[ "$ACTUAL_SHA256" == "$EXPECTED_SHA256" ]] || { echo 'Checksum mismatch; stopping.' >&2; exit 1; }
unzip -tq "$ZIP_PATH"
RELEASE_DIR="$APP_ROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$RELEASE_DIR"
unzip -q "$ZIP_PATH" -d "$RELEASE_DIR"
if find "$RELEASE_DIR" -type f \( -name '.env' -o -name '.env.production' -o -iname '*.pem' -o -iname '*.key' \) -print -quit | grep -q .; then
  echo 'Forbidden secret file found; stopping.' >&2
  exit 1
fi
ln -sfn "$RELEASE_DIR" "$APP_ROOT/current"
cd "$APP_ROOT/current"
chmod +x scripts/bootstrap-dsai-vm.sh
./scripts/bootstrap-dsai-vm.sh
node scripts/validate-production-env.mjs /etc/dsai/dsai.env

rm -rf "$WORK_DIR" "$ZIP_PATH"
printf '%s\n' 'Bootstrap and environment validation completed. Application service and Nginx are intentionally not changed by this wrapper.'
read -rp 'এই one-time wrapper file-টি এখন delete করতে DSAI-DELETE লিখুন: ' DELETE_CONFIRM
if [[ "$DELETE_CONFIRM" == 'DSAI-DELETE' ]]; then
  SELF_PATH="$(readlink -f "$0" 2>/dev/null || printf '%s' "$0")"
  rm -f -- "$SELF_PATH"
  printf '%s\n' 'One-time wrapper deleted. Release and protected environment remain.'
else
  printf '%s\n' 'Wrapper রাখা হয়েছে; এতে কোনো secret নেই। পরে manually delete করতে পারবেন।'
fi
