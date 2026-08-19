#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

EXPECTED_SHA256="a4f08479aefabba040e5d953496e90cf2ab4d95a0b9de048c0316c591ed26ad7"
APP_USER="$(whoami)"
APP_ROOT="/home/${APP_USER}/dsai"
ZIP_PATH="${DSAI_RELEASE_ZIP:-$HOME/DSAI_production_release_2026-08-19.zip}"
WORK_DIR="$HOME/.dsai-one-time-work"

command -v unzip >/dev/null || { echo 'unzip is required' >&2; exit 1; }
command -v sha256sum >/dev/null || { echo 'sha256sum is required' >&2; exit 1; }
test -s "$ZIP_PATH" || { echo "Local release ZIP missing: $ZIP_PATH" >&2; exit 1; }

printf '%s\n' 'এই one-time wrapper কোনো secret বহন করে না। এটি VPS-এ থাকা verified release ZIP পরীক্ষা করবে এবং পরে wrapper file delete করার সুযোগ দেবে।'
read -rp 'শুরু করতে DSAI-START লিখুন: ' START_CONFIRM
[[ "$START_CONFIRM" == 'DSAI-START' ]] || { echo 'Cancelled; no change made.'; exit 1; }

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR" "$APP_ROOT/releases"
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
