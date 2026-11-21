

## Connected-account recheck — 2026-11-21 08:00 Asia/Dhaka

- GitHub authenticated identity and repository Admin permission were reconfirmed. This does not prove local Git author configuration; the local author/email policy remains PARTIAL.
- Supabase project inventory returned only `Banglar-voice` (`wleytsrflhboyevhigiu`). No staging project was visible, so do not claim local/staging/production migration parity.
- Remote migration history is readable, but a migration list alone does not prove schema parity or RLS isolation. Positive and negative cross-owner tests remain NOT VERIFIED.
- Vercel project metadata reports the latest deployment as READY with target `production`; this does not prove the PR branch was deployed, production URL smoke passed, headers were checked, or rollback was rehearsed.
- PR #105 CI run #880 is still in progress. Core build/test steps completed, but browser acceptance and scanner/ClamAV/Compose acceptance remain pending at this checkpoint.


## CI status correction — 2026-11-21 08:02 Asia/Dhaka

Run #880 is now **CANCELLED**, not in progress. Its browser acceptance was cancelled and scanner/ClamAV/Compose steps were skipped. The current PR head is `248dbba843e24ccef35ef3c7118b8fdf1afe21ed`; no workflow run was returned for that exact head at the latest check. CI gate remains OPEN.


## CI evidence refresh — 2026-11-21

- PR CI run #886 (`44853633216`) passed on exact commit `3fcb33e831c65175d3fc36a14fe4ec9799883c50`, including browser, scanner, real ClamAV clean/EICAR/auth/outage and Docker Compose readiness. This closes the CI gate for that commit only.
- A later documentation-only commit changes the PR head; its own workflow must pass before review/merge.
- Supabase leaked-password protection remains WARN. Official Supabase documentation states this feature is available on Pro Plan and above; verify the project's entitlement and enable it if available, then test rejection of a compromised password. Source: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Node runtime maintenance is an engineering follow-up, not a human gate: repository pin 24.22.2 is behind the official 24.22.3 LTS security release. Update in a separate reviewed change and retest.


## Connected-account recheck — 2026-11-21 08:25 Asia/Dhaka

### Evidence now satisfied
- GitHub identity/Admin permission and target repository confirmed.
- PR #105 remains OPEN + DRAFT; workflow run #889 succeeded on observed head 4bb151f97a47c058b215fa51d7713aa542b2c2ed.
- Supabase production project is reachable and ACTIVE_HEALTHY; migration history and security advisors are readable.
- Vercel production-target deployment metadata reports READY for main SHA dc849a831a5a3eed0b56a1b366236482e51e80d2.

### Still open / not verified
- Trusted local checkout and actual local Git/toolchain commands; no local command result is claimed in this checkpoint.
- Vite Critical advisory remediation (7.1.7 is affected; patched 7.3.8) and Node 24.22.3 runtime pin alignment.
- Secret scanning, dependency advisory audit and license policy CI, including negative tests proving each protection.
- Supabase staging project/migration parity and positive + negative two-owner RLS tests. Only one Supabase project is visible in the connected inventory.
- Supabase leaked-password protection remains WARN; entitlement and safe enablement require account-owner confirmation because docs say Pro Plan+.
- Production URL smoke, response security headers, authenticated CAPTCHA/Auth click-through, production scanner endpoint and rollback rehearsal.
- Signed Android APK/AAB, Windows EXE/MSI, macOS DMG and iOS IPA artifacts. No signing keys or release artifacts are evidenced by this baseline phase.

No production setting, Supabase migration, merge, or deployment was changed in this phase.


## Live gate refresh — 2026-11-21 08:33 Asia/Dhaka

### Evidence satisfied
- GitHub authenticated identity and repository Admin permission reconfirmed.
- Existing branch `chore/baseline-and-security` and PR #105 are present; PR remains OPEN + DRAFT + mergeable.
- GitHub Actions run #892 passed all workflow steps on exact PR head `591e86da68d565b08792e100d6611fb4bc2e424b`, including browser, scanner, real ClamAV clean/EICAR/invalid-auth/outage, and Docker Compose readiness.
- Required engineering documents `docs/BASELINE.md`, `docs/DECISIONS.md`, `docs/HUMAN_GATES.md`, and `docs/PROGRESS.md` are present on the PR branch.

### Still blocked / not verified
- Local Git status/branches/remotes: no checkout; each command exit 128. Clone failed DNS resolution (exit 128).
- Local Node/pnpm: Node v22.16.0 while repository pins 24.22.2; pnpm absent (exit 127).
- Local install/typecheck/lint/test/build/secret scan: not executable because pnpm is missing; each attempted command exit 127. Do not mark as project failures or passes.
- User-requested architecture/blueprint/apps-web/env/migrate source paths are absent on main; need the actual current design source if these are maintained elsewhere.
- Security maintenance: Vite 7.1.7 is within the documented affected range of GHSA-p4f5-76q4-ffq7 (patched in 7.3.8); Node runtime pins remain 24.22.2 while 24.22.3 is the later vendor security release. No dependency/runtime changes made without trusted install/build environment.
- Supabase staging migration parity and positive/negative cross-owner RLS tests: not verified; only production project visible.
- Production URL/header/auth/scanner acceptance and rollback rehearsal: not verified by this documentation PR or CI.
- Secret/dependency/license CI checks with negative tests: not present as verified gates.
- Signed Android APK/AAB, Windows EXE/MSI, macOS DMG and iOS IPA artifacts: not evidenced.

No production setting, migration, merge or deployment was changed. Keep PR #105 draft until remaining applicable gates have evidence.


## Live gate refresh — 2026-11-21 08:42 Asia/Dhaka

### Satisfied
- Authenticated GitHub identity `banglarvoice33-byte` confirmed; target repository and existing branch confirmed.
- PR #105 remains OPEN + DRAFT on `c49a70167a5185f93a8280cc2c64c796489985de`.
- CI run #893 completed SUCCESS on the exact current PR head; all substantive CI steps, including browser, scanner, real ClamAV and Docker Compose readiness, succeeded.
- Required engineering records are present: `docs/BASELINE.md`, `docs/DECISIONS.md`, `docs/HUMAN_GATES.md`, and `docs/PROGRESS.md`.

### Blocked / not verified
- Local Git checkout: `git status`, `git branch --all`, and `git remote -v` each exit 128 because the execution directory is not a repository.
- Local toolchain: Node v22.16.0 (exit 0) versus repository pin 24.22.2; pnpm unavailable (exit 127).
- Local `pnpm install`, typecheck, lint, test, build, secret scan, and the actual root `check`/a11y/stub/verify scripts were attempted and each exited 127 because pnpm is missing. They are not project test failures and are not passes.
- Vite 7.1.7 is within GHSA-p4f5-76q4-ffq7's affected range; 7.3.8 is the patched version for the 7.x line. Actual dev-server network exposure remains unverified.
- Node 24.22.2 is behind official v24.22.3. Runtime and Docker/CI pins are not updated.
- Secret scan, dependency audit, license policy, and a negative regression test for each are absent from the inspected CI workflow.
- Supabase staging migration parity and cross-owner positive/negative RLS tests remain NOT VERIFIED; prior connected project inventory showed only the production project.
- Production URL/header/auth/scanner acceptance and rollback rehearsal remain NOT VERIFIED.
- Signed Android APK/AAB, Windows EXE/MSI, macOS DMG and iOS IPA artifacts remain NOT EVIDENCED.

No production setting, migration, merge, Preview deployment, or Production deployment was changed. PR #105 stays draft.


## Live gate refresh — 2026-11-21 08:47 Asia/Dhaka

### Confirmed
- GitHub identity `banglarvoice33-byte`; existing branch and PR #105.
- PR CI run #893 SUCCESS for exact SHA `c49a70167a5185f93a8280cc2c64c796489985de` only.
- Supabase production project ACTIVE_HEALTHY; remote latest migration `20261120154757` has corresponding source on GitHub main.
- Vercel latest listed deployment READY/Production for main SHA `dc849a831a5a3eed0b56a1b366236482e51e80d2`.

### Open / blocked
- Local checkout/Git: absent; status/branches/remotes exit 128; clone DNS failure exit 128.
- Node v22.16.0; pnpm unavailable exit 127. Install/typecheck/lint/test/build/secret:scan each exit 127.
- Vite 7.1.7 affected by GHSA-p4f5-76q4-ffq7; patched 7.x 7.3.8. Node 24.22.2 behind official 24.22.3 security release. Neither patched here.
- Secret scanning, dependency audit and license policy CI with negative tests remain unverified.
- Supabase org Free; only production project/default main branch visible. Independent staging and migration parity NOT VERIFIED.
- Public table RLS metadata enabled, but two-owner positive/negative RLS tests NOT RUN. Leaked-password protection remains WARN.
- Production URL probes fail DNS (curl 6, HTTP 000); headers, CAPTCHA/auth, scanner endpoint and rollback NOT VERIFIED.
- Signed Android APK/AAB, Windows EXE/MSI, macOS DMG and iOS IPA remain NOT EVIDENCED.

No production setting, migration, merge, or deployment changed.