# DSAI

DSAI is a Bengali-first, human-centred AI Workdesk with a tactile kinetic interface, multilingual lead drafting, controlled-alpha workflows, and an evidence-aware operations dashboard. This repository contains the full React/Vite frontend and Express/tRPC server.

## Fresh Ubuntu 22.04 deployment

The supported container path requires a fresh Ubuntu 22.04 VM with Docker Engine and the Docker Compose plugin installed. The first image build needs outbound access to pull the pinned Node/MySQL images and download npm packages through the configured package registry. A VM with no internet at all cannot perform a first build; use a preloaded image or an approved internal registry instead.

The production application uses MySQL/TiDB through `DATABASE_URL`. PostgreSQL and Redis are not added because the current application has no PostgreSQL or Redis adapter. The included Compose file provides a pinned MySQL service for a disposable local stack and is not a substitute for a managed production database.

Copy the safe template to a local operator file, replace the placeholders with real values outside Git, then start the stack:

```bash
cp .env.production.example .env
chmod 600 .env
docker-compose up --build
```

The application will be available at `http://127.0.0.1:3000`. The Compose database volume is persistent on the VM. Do not use the placeholder values for a public deployment, and do not commit `.env`.

## Direct Docker run

Build and run the application image with the requested commands. The `.env.example` entry is included in the release ZIP as a generated copy of the safe placeholder template; production deployments must use a protected operator-created file instead.

```bash
docker build -t myapp .
docker run --rm --name dsai --env-file .env.example -p 3000:3000 myapp
```

This command is a container smoke test. With placeholder credentials and no reachable MySQL/TiDB service, `/health` can return 200 while `/readyz` correctly returns 503. A 200 readiness response requires a real reachable database and valid production environment configuration.

## Verification

Run the repository verification contract from the project root:

```bash
bash scripts/verify.sh
```

The script checks exact dependency declarations, required files, health route contracts, the TypeScript check, accessibility contract, the full Vitest suite, and the production build. It does not silently claim a Docker build when Docker is unavailable. To include the Docker build on a machine with Docker, run:

```bash
VERIFY_DOCKER_BUILD=1 bash scripts/verify.sh
```

The standalone health endpoints are:

| Endpoint | Meaning | Database required |
|---|---|---:|
| `/health` | Process liveness | No |
| `/healthz` | Existing process liveness contract | No |
| `/readyz` | Configuration plus non-mutating database probe | Yes |

## Environment and secrets

`.env.production.example` is a reference-only placeholder template. The credential-free production release also contains `.env.example` as a safe alias for container smoke-test documentation. Never place real OAuth credentials, database passwords, JWT secrets, API keys, webhook secrets, or private keys in the repository, ZIP, Dockerfile, image build arguments, or browser bundle.

For the VPS deployment contract, create `/etc/dsai/dsai.env` with mode `0600`, validate it with `scripts/validate-production-env.mjs`, and keep it outside the release tree. The self-extracting VPS bundle and the non-secret remote gate report are documented in `docs/DSAI_REMOTE_GATE_HANDOFF_COMMANDS_BN.md` and `docs/DSAI_REMEDIATION_AND_REMOTE_GATE_RUNBOOK_BN.md`.

## Development commands

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm test
pnpm run check:a11y
pnpm run build
```

Replace the accidental leading `a` in the test line when copying the block; the canonical command is `pnpm test`. The verification script runs the correct command automatically.

## Production limitations

The project is a controlled-alpha production candidate, not an unconditional provider-complete public service. Real OAuth click-through, target-VPS systemd/Nginx/TLS/DNS, database migration and restore, malware scanning, external CRM/calendar/media/payment providers, backup recovery, and real-device field performance require operator evidence. The application intentionally keeps external writes behind consent and human review.

## Release files

The credential-free release packager is `scripts/package-credential-free-release.sh`. It excludes populated environment files, runtime state, logs, dependencies, and build output from the source archive, then adds only safe placeholder templates. The one-command bundle generator is `scripts/build-one-command-vps-bundle.mjs`.
