#!/usr/bin/env bash
set -Eeuo pipefail

export RUNNER_TEMP="${RUNNER_TEMP:-/tmp}"
export DSAI_BROWSER_URL="${DSAI_BROWSER_URL:-http://127.0.0.1:4173}"
export DSAI_BROWSER_MODE=preview

mkdir -p "$RUNNER_TEMP/dsai-browser-smoke" artifacts

pnpm run check:a11y
pnpm run check:stubs

if ! command -v deno >/dev/null 2>&1; then
  curl -fsSL https://deno.land/install.sh | sh
  export PATH="$HOME/.deno/bin:$PATH"
fi
deno check --node-modules-dir=auto supabase/functions/dsai-image-generate/index.ts
deno test --allow-env --allow-net --node-modules-dir=auto supabase/functions/dsai-image-generate/imagePolicy_test.ts

pnpm exec vitest run --reporter=default
node --check scanner/scan-server.mjs
node --test scanner/scan-server.test.mjs
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  export MALWARE_SCANNER_API_KEY="${MALWARE_SCANNER_API_KEY:-ci-test-key}"
  export SCANNER_DOMAIN="${SCANNER_DOMAIN:-scanner.example.test}"
  docker compose -f docker-compose.clamav.yml config --quiet
fi
pnpm run build

npm install --prefix "$RUNNER_TEMP/dsai-browser-smoke" --no-save playwright-core@1.56.1 @sparticuz/chromium@141.0.0

pnpm exec vite preview --host 127.0.0.1 --port 4173 --strictPort > "$RUNNER_TEMP/dsai-vite-preview.log" 2>&1 &
PREVIEW_PID=$!
cleanup() {
  kill "$PREVIEW_PID" 2>/dev/null || true
}
trap cleanup EXIT

ready=0
for attempt in $(seq 1 120); do
  if curl --silent --show-error --fail "$DSAI_BROWSER_URL" -o /dev/null; then
    ready=1
    break
  fi
  sleep 2
done
if [ "$ready" -ne 1 ]; then
  echo "Preview server did not become ready." >&2
  cat "$RUNNER_TEMP/dsai-vite-preview.log" >&2 || true
  exit 1
fi

node scripts/production-browser-smoke.mjs | tee artifacts/production-browser-smoke.txt
