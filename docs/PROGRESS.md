# DSAI engineering progress

**Checkpoint:** 2026-11-21 (Asia/Dhaka)  
**Repository:** `banglarvoice33-byte/dsai`  
**Working branch:** `chore/baseline-and-security`  
**PR:** [#105 — chore: establish engineering baseline and security gates](https://github.com/banglarvoice33-byte/dsai/pull/105)  
**Latest branch commit:** `91ee24e4ec17b5de497525efb97b5d04d5caa0ac`

## Done

- Reconfirmed authenticated GitHub identity `banglarvoice33-byte` (account ID `293959144`) and repository permissions.
- Confirmed the repository is public, default branch `main`, and the requested working branch exists remotely.
- Read the current README and root package manifest; confirmed root-level Vite/React + Express/tRPC + Drizzle layout and the committed pnpm lockfile.
- Confirmed the requested legacy paths are absent: `docs/architecture.md`, `docs/blueprint-extract.md`, `apps/web/package.json`, `apps/web/src/lib/env.ts`, and `scripts/migrate.mjs`. No fabricated replacements were added.
- Confirmed PR #105 is open and draft, based on `main`, with head `33a06db28832c9ac60119de01e91c009e7fd60e0`.
- Inspected PR CI run #874: dependency installation, TypeScript, Supabase Edge Function typecheck, free-image policy tests, accessibility, stub-boundary audit, unit tests and production build completed successfully at observation time. Browser acceptance remained in progress; scanner and Compose checks were pending.
- Executed local environment probes and recorded actual exit codes in `docs/BASELINE.md`.
- Connected Supabase project confirmed: `Banglar-voice` (`wleytsrflhboyevhigiu`), ACTIVE_HEALTHY, Postgres 17.6.1.
- Queried Supabase security and health advisors. Security warning: leaked-password protection disabled; health advisor returned no findings.
- Queried Supabase project inventory: only one project was returned; a separate staging project was not identified.

## In progress

- PR #105 CI completion and final review.
- Establish a trusted local checkout with Node 24.22.2 and pnpm before running the full local baseline.
- Decide with the project owner whether the absent architecture/blueprint files have an authoritative external source or whether the existing architecture audit is canonical.

## Blocked / not verified

- Container is at `/`, not a Git checkout: `git status --short --branch`, `git branch --all`, and `git remote -v` each exited 128.
- Container Node is `v22.16.0` (exit 0), below repository pin `24.22.2`.
- `pnpm` is unavailable; `pnpm -v`, `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm secret:scan` each exited 127.
- The root manifest has a pnpm pin mismatch: `packageManager: pnpm@10.4.1` vs `devDependencies.pnpm: 10.15.1`. No pin was changed without a valid frozen install.
- No local dependency audit, license check, secret scan, or package test ran.
- Supabase migration history was queried, but no staging project/local migration checkout was available for parity proof. Live positive and negative cross-owner RLS tests were not run.
- Supabase Auth leaked-password protection remains disabled pending owner-controlled configuration.
- Production Turnstile click-through, scanner host and live clean/infected/outage tests, production browser/auth smoke, rollback rehearsal, and signed platform artifacts remain open gates.

## Next

1. Trigger/obtain a fresh PR CI run for the current head and resolve why run #874 was cancelled before real ClamAV and Compose readiness completed.
2. Obtain a trusted checkout using Node 24.22.2 and the explicitly selected pnpm pin; run the baseline matrix and update `docs/BASELINE.md` with fresh results.
3. Add secret scanning, dependency advisory audit, and license policy checks in CI with negative tests after validating supported tools and license policy.
4. Verify Supabase staging-vs-remote migration parity and RLS positive/negative owner-isolation tests.
5. Continue production auth/scanner, browser/accessibility, rollback, and release gates only with reproducible evidence.

## Phase 0/1 PR checkpoint

- PR #105 remains open and draft; no merge or deployment was performed.
- Latest branch head after the four documentation refresh commits: `91ee24e4ec17b5de497525efb97b5d04d5caa0ac`.
- Run #874 (`44852782930`) was observed running against the earlier PR head `33a06db28832c9ac60119de01e91c009e7fd60e0`; several core checks completed, while browser/scanner/ClamAV/Compose/evidence steps were pending at that observation. The latest documentation commit `91ee24e...` has no associated workflow run/status returned yet, so CI for the current head is NOT VERIFIED.
- Previous run #872 failed before runner allocation; the newer run #874 has assigned a runner and is executing real steps. Do not carry forward the earlier infrastructure-blocked status as the current run's result.
