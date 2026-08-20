#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-$ROOT_DIR/../DSAI_production_release_FINAL_2026-08-20.zip}"
MANIFEST="${2:-${OUT%.zip}.integrity.txt}"

rm -f "$OUT" "$MANIFEST"
cd "$ROOT_DIR"

zip -qr "$OUT" . \
  -x 'node_modules/*' \
     '.git/*' \
     '.manus-logs/*' \
     'dist/*' \
     'coverage/*' \
     '.env' \
     '.env.local' \
     '.env.production' \
     '.env.development' \
     '**/.env' \
     '**/.env.local' \
     '**/.env.production' \
     '**/.env.development' \
     '*.log' \
     '**/*.log' \
     '.dsai-runtime/*' \
     '**/.dsai-runtime/*'

unzip -tq "$OUT"
unzip -Z1 "$OUT" | grep -Fxq '.env.production.example'
if unzip -Z1 "$OUT" | grep -E '(^|/)(\.env$|\.env\.local$|\.env\.production$|\.env\.development$|id_rsa|.*\.pem$|.*\.key$|credentials\.json$)' >/dev/null; then
  echo 'FORBIDDEN_SECRET_ARTIFACT_FOUND' >&2
  exit 1
fi

SHA256="$(sha256sum "$OUT" | awk '{print $1}')"
printf 'FILE=%s\nSHA256=%s\nBYTES=%s\nCREATED_UTC=%s\nSECRET_POLICY=credential-free\nSAFE_TEMPLATE=.env.production.example\n' \
  "$(basename "$OUT")" "$SHA256" "$(stat -c '%s' "$OUT")" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$MANIFEST"
chmod 644 "$OUT" "$MANIFEST"
printf 'RELEASE=%s\nMANIFEST=%s\nSHA256=%s\n' "$OUT" "$MANIFEST" "$SHA256"
