#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

command -v node >/dev/null || { echo 'VERIFY_FAIL: node is required'; exit 1; }
command -v pnpm >/dev/null || { echo 'VERIFY_FAIL: pnpm is required'; exit 1; }

node <<'NODE'
const fs = require('node:fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const ranges = { ...(p.dependencies ?? {}), ...(p.devDependencies ?? {}) };
for (const [name, version] of Object.entries(ranges)) {
  if (/^[~^*<>=]|\s\|\s/.test(version)) {
    throw new Error(`non-exact dependency range: ${name}=${version}`);
  }
}
for (const required of ['scripts.build', 'scripts.test', 'scripts.check', 'scripts.check:a11y']) {
  const [section, key] = required.split('.');
  if (!p[section]?.[key]) throw new Error(`missing package script: ${required}`);
}
console.log(`EXACT_DEPENDENCIES=PASS (${Object.keys(ranges).length})`);
NODE

test -f Dockerfile
test -f .dockerignore
test -f docker-compose.yml
test -f .nvmrc
test -f .env.production.example
test -f README.md
test -f scripts/verify.sh
test -f scripts/validate-production-env.mjs
printf 'REQUIRED_FILES=PASS\n'

grep -Fq 'app.get("/health"' server/_core/index.ts
grep -Fq 'app.get("/healthz"' server/_core/index.ts
grep -Fq 'app.get("/readyz"' server/_core/index.ts
printf 'HEALTH_ENDPOINTS=PASS\n'

pnpm install --frozen-lockfile
pnpm run check
pnpm run check:a11y
pnpm test
pnpm run build

if command -v docker >/dev/null 2>&1 && [[ "${VERIFY_DOCKER_BUILD:-0}" == "1" ]]; then
  docker build --tag "${IMAGE_NAME:-dsai:verify}" .
  printf 'DOCKER_BUILD=PASS\n'
else
  printf 'DOCKER_BUILD=SKIPPED (set VERIFY_DOCKER_BUILD=1 when Docker is available)\n'
fi

printf 'VERIFY=PASS\n'
