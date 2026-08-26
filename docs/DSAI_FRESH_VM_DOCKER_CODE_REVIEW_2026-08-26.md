# DSAI Fresh VM Docker Code Review

**Review date:** 2026-08-26  
**Scope:** Fresh Ubuntu 22.04 deployment ZIP, Docker contract, build/test verification, environment boundary, health endpoints, and release completeness.

## Review conclusion

The DSAI release now contains the requested deployment assets and is structurally deployable on a fresh Ubuntu 22.04 VM with Docker Engine, Docker Compose, Node/pnpm access for the first build, and a correctly populated production environment. The project remains honest about the difference between container startup and production readiness: `/health` and `/healthz` report process liveness, while `/readyz` requires a reachable MySQL/TiDB database through a non-mutating probe.

The sandbox does not provide Docker, so the actual `docker build` and `docker run` execution could not be performed here. This is the only requested validation step not executed. The repository verifier reports that condition as `DOCKER_BUILD=SKIPPED` rather than claiming a false pass.

## Checklist review

| Requirement | Result | Evidence |
|---|---|---|
| Node 20 Alpine Dockerfile | Pass | `Dockerfile` uses `node:20.19.4-alpine3.21` for build and runtime stages |
| Full frontend and server image build | Pass by contract | Dockerfile runs `pnpm run build` and copies `dist`, `node_modules`, runtime scripts, schema, and shared files |
| Runtime command | Pass | `CMD ["node", "dist/index.js"]` |
| Production mode | Pass | Runtime stage sets `NODE_ENV=production` |
| Docker Compose | Pass | `docker-compose.yml` includes app plus MySQL 8.4.6, matching the actual MySQL/TiDB contract |
| PostgreSQL/Redis | Intentionally not included | No current PostgreSQL or Redis adapter exists in the application |
| Exact dependency versions | Pass | 88 dependency declarations contain no caret, tilde, wildcard, comparator, or range syntax |
| Node version pin | Pass | `.nvmrc` contains `20.19.4` |
| Environment example | Pass in release | ZIP contains generated `.env.example` alias derived from the safe placeholder template |
| README command | Pass | README contains `docker-compose up --build` and direct Docker smoke-test commands |
| Health route | Pass | `/health`, `/healthz`, and `/readyz` are registered and tested |
| Verification script | Pass | `scripts/verify.sh` runs exact-version, file, health, install, TypeScript, accessibility, test, and build checks |
| Secret exclusion | Pass | ZIP scan found no populated dotenv files, private keys, PEM files, or credentials JSON |
| Docker image execution | Not run | Docker binary is unavailable in the sandbox |

## Environment findings

The source tree remains protected from populated environment files. The release packager excludes dotenv variants and then adds only placeholder-only `.env.production.example` and `.env.example` entries. Production operators must use a protected, uncommitted `.env` for Compose or `/etc/dsai/dsai.env` for the VPS contract. Real database URLs, OAuth credentials, JWT secrets, provider keys, cookies, and private keys must never be placed in the ZIP or Dockerfile.

The Compose database is a disposable local-development aid. It is not a production backup strategy, encrypted managed database, restore drill, or HA configuration. Production use requires a managed or separately operated MySQL/TiDB service, migrations, encrypted backups, restore testing, rotation ownership, and monitoring.

## Validation evidence

The final verifier passed after a frozen pnpm installation. TypeScript, accessibility checks, the complete Vitest suite, production build, shell syntax, exact dependency scan, requested-file scan, and credential-free ZIP scan passed. The final test inventory was 46 test files and 142 tests. The release ZIP checksum is:

```text
ecd9c30c5efc7cabf2e88156d197382be56cad079b88d4de16ff908ebdd1c4a7
```

## Fresh VM commands

After extracting the ZIP and creating a real operator environment outside Git:

```bash
cp .env.production.example .env
chmod 600 .env
docker-compose up --build
```

For the requested direct image smoke test using the release’s safe alias:

```bash
docker build -t myapp .
docker run --rm --name dsai --env-file .env.example -p 3000:3000 myapp
```

For the full repository verifier on a machine with Docker:

```bash
VERIFY_DOCKER_BUILD=1 bash scripts/verify.sh
```

A direct run with placeholder values may report `/health=200` and `/readyz=503`. That is expected because liveness does not require a database, while readiness does.

## Required operator acceptance

Before public launch, the operator must execute the Docker build/run on the target VM, supply real secrets through a protected mechanism, confirm MySQL/TiDB connectivity, verify `/readyz`, test Nginx/TLS/DNS and final-domain OAuth, rehearse rollback and backup restore, and review provider-specific consent, idempotency, rate limits, and audit logging. No code-only review can prove those remote conditions.
