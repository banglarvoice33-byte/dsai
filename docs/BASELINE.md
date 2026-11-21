# Baseline report

**Recorded:** 2026-11-21 07:49 Asia/Dhaka  
**Repository:** `banglarvoice33-byte/dsai`  
**Inspected ref:** `main`  
**Inspected commit:** `dc849a831a5a3eed0b56a1b366236482e51e80d2`

## Evidence observed

| Item | Observed value | Evidence |
|---|---|---|
| GitHub identity | `banglarvoice33-byte`, account ID `293959144` | Authenticated GitHub identity endpoint |
| Repository | `banglarvoice33-byte/dsai`, private, admin/maintain/push | GitHub repository metadata |
| Default branch | `main` | Repository metadata |
| Main commit | `dc849a831a5a3eed0b56a1b366236482e51e80d2` | GitHub branch/commit API |
| Working tree | Not observable via remote GitHub API | No local checkout |
| Branches | Remote branch inventory queried; local branch/remotes not applicable | GitHub branches API |
| Node pin | `24.22.2` | `.nvmrc` |
| pnpm metadata | `pnpm@10.4.1` | `package.json` |
| Lockfile | `pnpm-lock.yaml` exists | Main recursive tree |
| Workspace | `packages: []` | `pnpm-workspace.yaml` |
| Latest main CI | Run #871, completed, conclusion `success`, exact inspected main SHA | [GitHub Actions run #871](https://github.com/banglarvoice33-byte/dsai/actions/runs/44768203560) |

## Required command matrix

**Important:** No shell command below was executed in this session. Therefore no local exit code or local pass result is claimed. The GitHub Actions run is separate remote evidence, not a substitute for these commands.

| Required command | Exit code | Result | Reason |
|---|---:|---|---|
| `git status --short --branch` | N/A | NOT RUN | No local checkout/shell |
| `git branch --all` | N/A | NOT RUN | No local checkout/shell |
| `git remote -v` | N/A | NOT RUN | No local checkout/shell |
| `node -v` | N/A | NOT RUN | No local shell |
| `pnpm -v` | N/A | NOT RUN | No local shell |
| `pnpm install` | N/A | NOT RUN | Lockfile already exists; no local shell |
| `pnpm typecheck` | N/A | NOT RUN | Root package exposes `check`, not `typecheck`; CI runs `pnpm run check` |
| `pnpm lint` | N/A | NOT RUN | No `lint` script in root `package.json` |
| `pnpm test` | N/A | NOT RUN | No local shell; CI workflow runs Vitest |
| `pnpm build` | N/A | NOT RUN | No local shell; CI workflow runs production build |
| `pnpm secret:scan` | N/A | NOT RUN | No `secret:scan` script in root `package.json` |
| Dependency audit | N/A | NOT RUN | No local shell; dedicated CI audit not observed |
| License check | N/A | NOT RUN | No local shell; dedicated CI license policy not observed |

## Existing remote CI evidence

GitHub Actions run [#871](https://github.com/banglarvoice33-byte/dsai/actions/runs/44768203560) was observed as `completed/success` for main commit `dc849a831a5a3eed0b56a1b366236482e51e80d2` on 2026-11-20. The checked-in workflow includes frozen pnpm install, TypeScript, Deno/Supabase function checks, accessibility contract, stub-boundary audit, Vitest, production build, Chromium browser smoke, scanner gateway tests, real ClamAV integration, and Docker Compose liveness/readiness checks.

This remote green run is useful evidence, but it does not establish local command exit codes, staging Supabase migration parity, production Turnstile provider configuration, production scanner availability, or live cross-owner RLS negative tests.

## Architecture mismatch

The following user-requested paths were not found in the inspected main tree:

- `docs/architecture.md`
- `docs/blueprint-extract.md`
- `apps/web/package.json`
- `apps/web/src/lib/env.ts`
- `scripts/migrate.mjs`

The actual repository uses root `package.json`, `server/_core/env.ts`, a root pnpm lockfile, and the checked-in current architecture audit. No replacement files were fabricated.

## Baseline gate

**Status: PARTIAL / BLOCKED.** Remote main CI is green, but local baseline is unexecuted. Do not call the full baseline green until the required commands are run in a trusted checkout and their exit codes and timestamps are recorded.


## PR CI follow-up

The draft PR #105 triggered workflow run [#872](https://github.com/banglarvoice33-byte/dsai/actions/runs/44852623330) on commit `4ce3bcba150214d64b37182021be9fddf756d608`. The initial run and one rerun both concluded `failure` before any runner was assigned. The job API reported `runner_id: 0`, no executed steps, and no downloadable log (GitHub log endpoint returned 404 BlobNotFound). This is recorded as **CI infrastructure/runner-allocation BLOCKED**; there is no evidence that repository checks executed or failed. No pass is claimed.
