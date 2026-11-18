#!/usr/bin/env bash
set -euo pipefail

# Run the production-only browser acceptance suite from an isolated Vercel
# preview build. The browser itself targets the already-deployed public site.
export RUNNER_TEMP="${RUNNER_TEMP:-/tmp}"
export DSAI_BROWSER_MODE=production
export DSAI_BROWSER_URL="${DSAI_BROWSER_URL:-https://dsai-one.vercel.app}"

mkdir -p "${RUNNER_TEMP}/dsai-browser-smoke"
printf '{"name":"dsai-browser-smoke"}' > "${RUNNER_TEMP}/dsai-browser-smoke/package.json"
npm install --prefix "${RUNNER_TEMP}/dsai-browser-smoke" --no-save playwright-core@1.56.1 @sparticuz/chromium@141.0.0

node scripts/production-browser-smoke.mjs
pnpm run build
