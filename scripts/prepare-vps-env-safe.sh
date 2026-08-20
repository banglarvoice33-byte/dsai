#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
umask 077

APP_ROOT="${DSAI_APP_ROOT:-$HOME/dsai}"
RELEASE_DIR="${DSAI_RELEASE_DIR:-$APP_ROOT/current}"
ENV_FILE="${DSAI_ENV_FILE:-$APP_ROOT/shared/dsai.env}"

fail() {
  printf '[DSAI][ERROR] %s\n' "$1" >&2
  exit 1
}

if [[ -s "$ENV_FILE" ]]; then
  chmod 600 "$ENV_FILE"
  printf 'DSAI_ENV_READY=existing-protected-file\nENV_FILE=%s\n\n' "$ENV_FILE"
  node "$RELEASE_DIR/scripts/validate-production-env.mjs" "$ENV_FILE"
  exit 0
fi

[[ -d "$RELEASE_DIR/scripts" ]] || fail "Release scripts not found at $RELEASE_DIR. Extract the verified release before running this command."

mapfile -t CANDIDATE_PIDS < <(pgrep -u "$(id -u)" -f '[n]ode .*dist/index\.js' || true)
if (( ${#CANDIDATE_PIDS[@]} != 1 )); then
  printf 'LEGACY_PROCESS_CANDIDATES=%s\n' "${#CANDIDATE_PIDS[@]}" >&2
  printf '%s\n' "${CANDIDATE_PIDS[@]:-none}" >&2
  fail "Exactly one legacy DSAI process is required, or create the protected environment file through the one-time setup helper. Secret values are never collected by this command."
fi

mkdir -p "$(dirname "$ENV_FILE")"
chmod 700 "$(dirname "$ENV_FILE")"
export DSAI_ENV_FILE="$ENV_FILE"

if [[ "${DSAI_PRIVATE_ALPHA:-false}" == "true" ]]; then
  node "$RELEASE_DIR/scripts/migrate-legacy-env.mjs" "${CANDIDATE_PIDS[0]}" --private-alpha
else
  node "$RELEASE_DIR/scripts/migrate-legacy-env.mjs" "${CANDIDATE_PIDS[0]}"
fi

chmod 600 "$ENV_FILE"
node "$RELEASE_DIR/scripts/validate-production-env.mjs" "$ENV_FILE"
printf 'DSAI_ENV_READY=migrated-allowlisted-values\nENV_FILE=%s\nSECRET_VALUES_PRINTED=false\n' "$ENV_FILE"
