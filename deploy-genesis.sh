#!/usr/bin/env bash
# DSAI one-command deployment installer
# Civic Signal deployment policy: non-destructive, explicit, no secrets, no crypto/mining,
# and no privileged system changes unless the operator explicitly chooses to run as root.
set -Eeuo pipefail
IFS=$'\n\t'

APP_NAME="dsai-platform"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${APP_DIR}/.dsai-runtime"
ENV_FILE="${APP_DIR}/.env.production"
LOG_FILE="${STATE_DIR}/app.log"
PID_FILE="${STATE_DIR}/app.pid"
PORT_FILE="${STATE_DIR}/port"
PNPM_BIN=""
REQUIRED_ENV_KEYS=(DATABASE_URL JWT_SECRET VITE_APP_ID OAUTH_SERVER_URL VITE_OAUTH_PORTAL_URL)
START_PORT="${DSAI_START_PORT:-3010}"
END_PORT="${DSAI_END_PORT:-3099}"
HEALTH_PATH="${DSAI_HEALTH_PATH:-/healthz}"

log() { printf '\n[DSAI] %s\n' "$*"; }
warn() { printf '\n[DSAI][WARN] %s\n' "$*" >&2; }
fatal() { printf '\n[DSAI][ERROR] %s\n' "$*" >&2; exit 1; }

require_linux() {
  [[ "$(uname -s)" == "Linux" ]] || fatal "This installer targets a Linux server. Use the documented manual steps for other operating systems."
}

install_node_if_missing() {
  if command -v node >/dev/null 2>&1 && command -v corepack >/dev/null 2>&1; then
    return
  fi

  if command -v apt-get >/dev/null 2>&1; then
    if [[ "${EUID}" -eq 0 ]]; then
      log "Installing Node.js and curl through apt (only missing prerequisites)."
      apt-get update -y
      apt-get install -y ca-certificates curl nodejs npm
    elif command -v sudo >/dev/null 2>&1; then
      log "Installing Node.js and curl through sudo apt (only missing prerequisites)."
      sudo apt-get update -y
      sudo apt-get install -y ca-certificates curl nodejs npm
    else
      fatal "Node.js/corepack is missing and apt requires sudo. Install Node.js 20+ and corepack, then rerun."
    fi
  else
    fatal "Node.js/corepack is missing and this host has no supported apt-get installer. Install Node.js 20+ and corepack, then rerun."
  fi
}

prepare_package_manager() {
  mkdir -p "${STATE_DIR}/tools"
  if command -v pnpm >/dev/null 2>&1 && pnpm --version >/dev/null 2>&1; then
    PNPM_BIN="$(command -v pnpm)"
    return
  fi

  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
    if command -v pnpm >/dev/null 2>&1 && pnpm --version >/dev/null 2>&1; then
      PNPM_BIN="$(command -v pnpm)"
      return
    fi
  fi

  log "Corepack could not activate a verified pnpm binary; installing a local pinned fallback."
  npm install --prefix "${STATE_DIR}/tools" --no-save --no-package-lock pnpm@10.4.1
  PNPM_BIN="${STATE_DIR}/tools/node_modules/.bin/pnpm"
  "${PNPM_BIN}" --version >/dev/null 2>&1 || fatal "pnpm could not be installed. Install pnpm 10+ and rerun."
}

is_port_free() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ! ss -H -ltn "sport = :${port}" 2>/dev/null | grep -q .
  elif command -v lsof >/dev/null 2>&1; then
    ! lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
  else
    (command -v curl >/dev/null 2>&1 && ! curl -fsS --connect-timeout 0.2 "http://127.0.0.1:${port}/" >/dev/null 2>&1)
  fi
}

choose_port() {
  mkdir -p "${STATE_DIR}"
  if [[ -s "${PORT_FILE}" ]]; then
    local saved
    saved="$(cat "${PORT_FILE}")"
    if [[ "${saved}" =~ ^[0-9]+$ ]] && ! kill -0 "$(cat "${PID_FILE}" 2>/dev/null || echo 0)" 2>/dev/null && is_port_free "${saved}"; then
      PORT="${saved}"
      return
    fi
  fi

  local candidate
  for candidate in $(seq "${START_PORT}" "${END_PORT}"); do
    if is_port_free "${candidate}"; then
      PORT="${candidate}"
      printf '%s\n' "${PORT}" > "${PORT_FILE}"
      return
    fi
  done
  fatal "No free port found between ${START_PORT} and ${END_PORT}. Set DSAI_START_PORT/DSAI_END_PORT and rerun."
}

stop_previous() {
  if [[ -s "${PID_FILE}" ]]; then
    local old_pid
    old_pid="$(cat "${PID_FILE}" || true)"
    if [[ "${old_pid}" =~ ^[0-9]+$ ]] && kill -0 "${old_pid}" 2>/dev/null; then
      log "Stopping the previous DSAI process (${old_pid}) gracefully."
      kill "${old_pid}" 2>/dev/null || true
      for _ in $(seq 1 20); do
        kill -0 "${old_pid}" 2>/dev/null || break
        sleep 0.25
      done
      kill -9 "${old_pid}" 2>/dev/null || true
    fi
  fi
}

write_env() {
  [[ -f "${ENV_FILE}" ]] || fatal "Missing ${ENV_FILE}. Run: node scripts/setup-vps-env.mjs"
  chmod 600 "${ENV_FILE}"
  if grep -q '^PORT=' "${ENV_FILE}"; then
    sed -i "s/^PORT=.*/PORT=${PORT}/" "${ENV_FILE}"
  else
    printf '\nPORT=%s\n' "${PORT}" >> "${ENV_FILE}"
  fi
}

load_env() {
  [[ -f "${ENV_FILE}" ]] || fatal "Missing ${ENV_FILE}. Create it with the required production values before rerunning."
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a

  local key
  for key in "${REQUIRED_ENV_KEYS[@]}"; do
    if [[ -z "${!key:-}" ]]; then
      fatal "Required production environment variable ${key} is missing from ${ENV_FILE} or the shell environment."
    fi
  done
}

build_and_launch() {
  log "Installing locked dependencies."
  cd "${APP_DIR}"
  "${PNPM_BIN}" install --frozen-lockfile
  log "Building the production frontend and server bundle."
  "${PNPM_BIN}" build
  log "Starting DSAI on port ${PORT}."
  nohup env NODE_ENV=production PORT="${PORT}" node "${APP_DIR}/dist/index.js" >> "${LOG_FILE}" 2>&1 &
  local new_pid="$!"
  printf '%s\n' "${new_pid}" > "${PID_FILE}"
}

health_check() {
  command -v curl >/dev/null 2>&1 || fatal "curl is required for the local health check."
  local url="http://127.0.0.1:${PORT}${HEALTH_PATH}"
  for _ in $(seq 1 30); do
    if curl -fsS --max-time 2 "${url}" >/dev/null 2>&1; then
      log "DSAI is live."
      printf '\nLocal URL:  http://127.0.0.1:%s%s\n' "${PORT}" "${HEALTH_PATH}"
      printf 'Server URL: http://<server-ip>:%s%s\n' "${PORT}" "${HEALTH_PATH}"
      printf 'PID file:   %s\nLog file:   %s\n' "${PID_FILE}" "${LOG_FILE}"
      return
    fi
    sleep 1
  done
  warn "The process started but did not answer the health check within 30 seconds."
  tail -n 80 "${LOG_FILE}" 2>/dev/null || true
  exit 1
}

main() {
  require_linux
  install_node_if_missing
  prepare_package_manager
  mkdir -p "${STATE_DIR}"
  stop_previous
  choose_port
  if [[ ! -f "${ENV_FILE}" ]]; then
    if [[ -t 0 && -t 1 ]]; then
      log "No .env.production found; opening the protected interactive setup helper."
      node "${APP_DIR}/scripts/setup-vps-env.mjs"
    else
      fatal "Missing ${ENV_FILE}. Run: node scripts/setup-vps-env.mjs"
    fi
  fi
  write_env
  load_env
  log "Validating production configuration without printing secrets."
  node "${APP_DIR}/scripts/validate-production-env.mjs" "${ENV_FILE}"
  build_and_launch
  health_check
}

main "$@"
