# Baseline report

**Recorded:** 2026-11-21 07:58 Asia/Dhaka (container clock: 01:58 UTC)  
**Repository:** `banglarvoice33-byte/dsai`  
**Inspected ref:** `main` and `chore/baseline-and-security`  
**Inspected main commit:** `dc849a831a5a3eed0b56a1b366236482e51e80d2`  
**PR head at inspection:** `33a06db28832c9ac60119de01e91c009e7fd60e0`

## Evidence observed

| Item | Observed value | Evidence |
|---|---|---|
| Authenticated GitHub identity | `banglarvoice33-byte`, account ID `293959144` | GitHub authenticated-user endpoint |
| Repository | `banglarvoice33-byte/dsai`, public, admin/maintain/push | GitHub repository metadata |
| Default branch | `main` | GitHub repository metadata |
| Branch | `chore/baseline-and-security` exists remotely | GitHub branch search |
| Node pin | `24.22.2` | Repository `.nvmrc` / baseline docs |
| Actual container Node | `v22.16.0`, EXIT 0 | `node -v` in this session |
| pnpm | Not installed / command not found, EXIT 127 | `pnpm -v` |
| Lockfile | `pnpm-lock.yaml` exists; lockfile format 9.0 | Repository root |
| pnpm metadata | `packageManager: pnpm@10.4.1`; `devDependencies.pnpm: 10.15.1` | Root `package.json` |
| Supabase project | `Banglar-voice`, `wleytsrflhboyevhigiu`, ACTIVE_HEALTHY, Postgres 17.6.1, ap-south-1 | Connected Supabase project API |
| Supabase security advisor | WARN: leaked-password protection disabled | Supabase security advisor |
| PR | Draft PR #105 open; head `33a06db...`, base `main` | GitHub PR API |
| Latest observed PR CI | Run #874 in progress; TypeScript, Supabase Edge Function checks, accessibility, stub audit, unit tests and production build completed successfully; browser acceptance still running; scanner/ClamAV/Compose checks pending | GitHub Actions run #874 job detail |

## Local command results — 2026-11-21

Commands were executed in the available container. The container root `/` is not a repository checkout.

| Command | Exit code | Actual result |
|---|---:|---|
| `git status --short --branch` | 128 | `fatal: not a git repository` |
| `git branch --all` | 128 | `fatal: not a git repository` |
| `git remote -v` | 128 | `fatal: not a git repository` |
| `node -v` | 0 | `v22.16.0` (repository requires Node 24.22.2) |
| `pnpm -v` | 127 | `pnpm: command not found` |
| `pnpm install` | 127 | `pnpm: command not found`; lockfile already exists, so do not regenerate it |
| `pnpm typecheck` | 127 | `pnpm: command not found`; actual root script is `check`, not `typecheck` |
| `pnpm lint` | 127 | `pnpm: command not found`; no root `lint` script was found |
| `pnpm test` | 127 | `pnpm: command not found` |
| `pnpm build` | 127 | `pnpm: command not found` |
| `pnpm secret:scan` | 127 | `pnpm: command not found`; no root script was found |

The local command results are failures/blockers, not green checks. A correct local baseline requires a trusted checkout, Node 24.22.2, and the repository-pinned package manager. Do not change the lockfile or pnpm pins merely to accommodate this container.

## Existing remote CI evidence

- Main CI run #871 succeeded on main commit `dc849a831a5a3eed0b56a1b366236482e51e80d2`: https://github.com/banglarvoice33-byte/dsai/actions/runs/44768203560
- PR #105 CI run #874 was observed in progress on head `33a06db28832c9ac60119de01e91c009e7fd60e0`: https://github.com/banglarvoice33-byte/dsai/actions/runs/44852782930
- In run #874, setup, dependency install, TypeScript, Supabase Edge Function typecheck, free-image cost policy tests, accessibility checks, production stub audit, unit tests, and production build had completed successfully. Chromium browser acceptance was still running; scanner gateway, real ClamAV, Compose readiness and evidence upload had not yet run. This is a partial in-progress observation, not a completed CI pass.

## Architecture mismatch

The requested paths were checked on the repository branch and returned 404:
- `docs/architecture.md`
- `docs/blueprint-extract.md`
- `apps/web/package.json`
- `apps/web/src/lib/env.ts`
- `scripts/migrate.mjs`

The actual repository is root-level React/Vite + Express/tRPC + Drizzle. It uses root `package.json`, root `pnpm-lock.yaml`, and `server/_core/env.ts`. No placeholder files were created.

## Supabase status

- Connected account exposes one project, `Banglar-voice`; no separate staging project was returned by the project list.
- Remote migration history is readable, but no staging project or local migration checkout was available for a local-vs-remote parity comparison. Migration parity is therefore NOT VERIFIED.
- Security advisor returned `auth_leaked_password_protection` WARN: leaked-password protection is disabled. This is an owner-controlled Auth setting and was not changed in this baseline phase.
- Health advisor returned no findings. This does not replace live RLS negative tests or full production security acceptance.

## Baseline gate

**Status: BLOCKED / PARTIAL.** Remote CI has useful evidence, but the local environment is not a checkout, uses Node 22.16.0 instead of the pinned 24.22.2, and has no pnpm. No local install, typecheck, lint, test, build, or secret scan passed. No dependency advisory/license audit was run locally.
