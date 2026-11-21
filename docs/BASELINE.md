

## Current connected-account recheck — 2026-11-21 08:00 Asia/Dhaka

This section supersedes earlier statements about the PR head and current workflow state above; historical observations are retained for auditability.

| Item | Current observation | Evidence |
|---|---|---|
| Authenticated GitHub user | `banglarvoice33-byte`, account ID `293959144` | Authenticated-user API, rechecked |
| Repository permission | `admin` | Collaborator permission API, rechecked |
| PR #105 | OPEN, DRAFT, mergeable=true, base `main`, head `chore/baseline-and-security` | Pull request API, rechecked |
| PR head | `97744c2268d7778bd8cad3f723bc07a4eafdd54e` | Pull request API, rechecked |
| Branch comparison | 13 commits ahead, 0 behind; four added documentation files; no app-code changes in the comparison response | Compare API: `main...chore/baseline-and-security` |
| Current PR CI | Run #880 / `44853309269`, IN_PROGRESS on the current PR head | GitHub Actions API |
| Completed in run #880 at observation | dependency install, TypeScript, Supabase Edge Function typecheck, free-image policy tests, accessibility checks, stub audit, unit tests, production build | Job #136689553600 step results |
| Still running/pending in run #880 | Chromium browser acceptance IN_PROGRESS; scanner gateway tests, ClamAV config, real ClamAV clean/EICAR/auth/outage, Compose readiness and evidence upload not yet complete | Same job step results |
| Vercel project | `dsai`, framework Vite, Node 24.x; latest deployment metadata reports READY and target production | Connected Vercel project API |
| Supabase | `Banglar-voice`, ACTIVE_HEALTHY, Postgres 17.6.1, ap-south-1 | Connected Supabase project API |
| Supabase migration history | Remote history returned; no second/staging project is visible in the connected project inventory | Supabase project list + migration list |

### Repository command contract

The actual root `package.json` exposes `check`, `check:a11y`, `check:stubs`, `test`, `build`, and `verify`. It does **not** expose root scripts named `typecheck`, `lint`, or `secret:scan`. The committed `pnpm-lock.yaml` exists (lockfile format 9.0); do not run an unfrozen install or regenerate it as part of baseline capture. The package manifest still has conflicting pnpm declarations: `packageManager=pnpm@10.4.1` and devDependency `pnpm=10.15.1`; no change was made.

### Current gate interpretation

Run #880 is NOT complete and cannot be called green. Its core static/unit/build steps are individually successful, but browser, scanner, real ClamAV, Docker Compose readiness and final evidence steps remain outstanding. The previous run #874 was cancelled and is historical only. The local command results above remain valid observations from the earlier container session; no new local checkout or shell execution was available during this connected-account recheck. Supabase migration parity, RLS negative tests, production auth/browser tests, production headers/smoke, rollback and release signing remain NOT VERIFIED.


## Follow-up correction — 2026-11-21 08:02 Asia/Dhaka

- PR #105 advanced after the documentation refresh to head `248dbba843e24ccef35ef3c7118b8fdf1afe21ed`; compare remains 17 commits ahead / 0 behind, with four documentation-only files added.
- Run #880 (`44853309269`) was subsequently observed as **CANCELLED**. TypeScript, Supabase Edge Function check, free-image policy tests, accessibility, stub audit, unit tests and production build completed successfully. Chromium browser acceptance was cancelled; scanner gateway, ClamAV config, real ClamAV and Docker Compose readiness steps were skipped. Metadata and evidence upload completed, but do not treat these as acceptance.
- A PR-triggered workflow-run lookup for the exact current head `248dbba...` returned no runs at this check. Therefore CI for the current PR head is **NOT VERIFIED**. No workflow dispatch action was available through the connected GitHub integration in this session.
- This correction supersedes the previous paragraph that described run #880 as in progress. No merge or deployment was performed.


## Completed PR CI acceptance — 2026-11-21

- Workflow run #886 (`44853633216`) completed with conclusion **SUCCESS** on exact PR commit `3fcb33e831c65175d3fc36a14fe4ec9799883c50`: https://github.com/banglarvoice33-byte/dsai/actions/runs/44853633216
- Successful steps: checkout, pnpm setup, Node setup, Deno setup, frozen dependency installation, TypeScript, Supabase Edge Function typecheck, free-image policy tests, accessibility, production stub/mock audit, unit tests/JUnit report, production build, Chromium browser acceptance, scanner gateway security tests, ClamAV/Compose configuration validation, real ClamAV clean/EICAR/invalid-auth/outage integration, Docker Compose liveness/database-readiness, run metadata and evidence upload.
- This is strong CI evidence for that exact commit. Local Git/toolchain commands remain blocked; CI does not replace local shell results or staging RLS/production acceptance.
- **New security maintenance finding:** the repository pins Node `24.22.2` in its baseline. The official Node.js release feed lists `24.22.3` as a later LTS **security release** (2026-11-11) with multiple High CVEs, including CVE-2026-123863 through CVE-2026-123866. Update the Node pin consistently across `.nvmrc`, CI, Docker base image and docs in a separate security-focused change, then rerun full CI. Source: https://github.com/nodejs/node/releases/tag/v24.22.3
- The following documentation-only refresh creates a new branch head and therefore requires its own CI run; do not carry #886's pass forward to a different SHA.


## Connected-account and advisory recheck — 2026-11-21 08:25 Asia/Dhaka

- GitHub identity banglarvoice33-byte and Admin permission on banglarvoice33-byte/dsai verified from authenticated GitHub APIs. Existing branch chore/baseline-and-security and PR #105 remain open/draft; PR head observed as 4bb151f97a47c058b215fa51d7713aa542b2c2ed. No duplicate branch or PR created.
- GitHub Actions run #889 (44854731975) reports completed/success for the exact observed PR head. This is remote CI evidence, not a local shell result.
- Current root package manifest confirms scripts check, check:a11y, check:stubs, test, build, and verify. No root typecheck, lint, or secret:scan script. packageManager declares pnpm 10.4.1 while devDependency declares pnpm 10.15.1. .nvmrc, CI setup and Docker currently pin Node 24.22.2.
- NEW HIGH-PRIORITY SECURITY FINDING: Vite is pinned to 7.1.7. Vite maintainers' GHSA-p4f5-76q4-ffq7 (published 2026-11-10, Critical) affects Vite >=7.0.0 <=7.3.7 and is patched in 7.3.8. The currently pinned 7.1.7 is within the affected range. This advisory's impact condition is an explicitly network-exposed Vite dev server. Do not infer exploitability of the deployed production app without checking actual dev-server exposure/configuration; nevertheless the vulnerable dev dependency must be upgraded and regression-tested in a focused follow-up. Evidence: https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7
- The older GHSA-v2wj-q39q-566r affects Vite 7.1.0–7.3.1 and is patched in 7.3.2; the newer Critical advisory supersedes the safe target for this pin, so target at least Vite 7.3.8 after compatibility review. Evidence: https://github.com/advisories/GHSA-v2wj-q39q-566r
- Official Node.js 24.22.3 LTS release dated 2026-11-11 is a security release addressing multiple High-severity CVEs. Repo's 24.22.2 pins in .nvmrc, CI and Docker are behind. Update all pins coherently in a separate reviewed change. Evidence: https://nodejs.org/en/blog/release/v24.22.3 and https://nodejs.org/en/blog/vulnerability/november-2026-security-releases
- React is pinned to 19.2.1, but inspected manifest/lockfile contains no react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack, or Next.js package. The current RSC advisory targets those RSC packages; do not mark it applicable solely because React core is installed. Evidence: https://github.com/advisories/GHSA-xqc2-xf4c-x3h3
- Supabase project inventory shows only Banglar-voice (wleytsrflhboyevhigiu), ACTIVE_HEALTHY, PostgreSQL 17.6.1, region ap-south-1. Remote migration history is readable (49 entries returned); no second/staging project is visible, so staging parity is NOT VERIFIED. Supabase security advisor still reports auth_leaked_password_protection WARN. Official docs state this capability requires Pro Plan or above: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Vercel project dsai is Vite / Node 24.x. Latest production deployment observed READY is dpl_xrFEQ5H7dh3eLNsGz3RtM77wYDhj, deployed from main SHA dc849a831a5a3eed0b56a1b366236482e51e80d2. This is not PR #105 deployment evidence and does not prove URL/header/auth smoke or rollback.
- Local git status, branches/remotes, node -v, pnpm -v, install, typecheck, lint, test, build and secret scan were NOT RUN in this connected API session because no trusted local checkout/shell is available. Do not mark them passed. Previous local baseline failures remain historical evidence only.
