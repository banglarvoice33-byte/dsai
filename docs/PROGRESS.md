# DSAI Progress — Lead Generation, Work Desk and Final Acknowledgment

Updated: 2026-11-21

## Done (implementation committed to feature branch; not yet accepted for production)
- Audited the actual main-branch Lead Composer, Workspace, FileUploadPanel, WorkDeskTextPanel, lead/workdesk routers, services and tests.
- Preserved the existing Bengali-first Lead Composer options, CRM ownership checks, draft-only consent boundary and no-auto-send behavior.
- Added Work Desk text-result in-session editing, copy and TXT download.
- Added TXT download for extracted TXT/CSV/JSON document text.
- Added a private acknowledgment ledger migration with forced RLS, restrictive browser-deny policies, server-role grants, immutable snapshot/recipient fields and immutable audit events.
- Added 256-bit one-time bearer token generation; only SHA-256(token) is persisted.
- Added exact text snapshot SHA-256, seven-day expiry, 20-link UTC daily owner cap, first-view timestamp, server-enforced three-second wait, atomic one-time acknowledgment and owner-only history.
- Added Bengali owner and recipient UI, manual link sharing, clear non-legal/non-identity-verified disclaimer, and route `/confirm/:token`.
- Added static/unit contract tests for snapshot canonicalization, token hashing, expiry/3-second/one-time boundaries, RLS grants and UX actions.
- Feature flag defaults to false.

## In progress
- Review code and migration diff; obtain exact-head CI results.
- Run staging integration tests once an independent staging database is available.

## Blocked / not production-ready
- Migration is not applied; feature flag remains false.
- No independent Supabase staging database is available in the connected account context.
- No local checkout/pnpm toolchain; local test/typecheck/build commands cannot be run in the current shell.
- No exact final-head CI evidence yet.
- No live end-to-end recipient test or production deployment.
- PDF/DOCX/XLSX/image OCR remains unsupported.
- No email/SMS sending, verified recipient email, identity verification or legal e-signature.

## Next
1. Review every changed file and the full branch diff.
2. Open a draft PR and wait for CI on its exact head SHA.
3. Fix any CI failures; do not merge while red or pending.
4. Obtain independent staging; apply migration there and run owner-isolation, replay, expiry, three-second and account-deletion tests.
5. Run browser accessibility/mobile/Bengali rendering tests.
6. Only after all gates pass, obtain explicit production migration/feature-flag approval and verify production deployment.


## CI and accessibility continuation — 2026-11-21

- First PR CI run #897 on SHA `582baee974e1d26e9b87cd76a519d2393fa6c455`: TypeScript, Supabase Edge Function typecheck, static accessibility contract, production stub audit and scanner/ClamAV security tests passed; Vitest had 1 failure / 291 tests due to the expected Bengali word `দ্বিতীয়` not matching the input `দ্বিতীয়`. This was a test-fixture spelling error, not a runtime failure.
- Corrected the expected fixture. New CI run #900 was triggered on SHA `9d797faa9ed7a2ca9efce29ef65a7e4a1b3a15d7`; its latest observed status was pending/in progress, not a pass.
- Added `@axe-core/playwright@4.14.0` to the same Chromium browser acceptance run. The browser suite now targets Lead Composer, the Work Desk file-route auth gate, and invalid public acknowledgment route, with WCAG 2.1 A/AA axe checks and keyboard-entry assertion. This was committed after run #900 started; wait for a new exact-head run.
- Authenticated Work Desk controls still require a logged-in browser E2E run; no test user/session was available in the current browser workflow. Do not claim that gate passed.


## Negative RLS proof added — 2026-11-21

- Added an isolated PostgreSQL 17.6 CI test: the workflow starts a disposable database, applies the actual acknowledgment migration, creates service/anon/authenticated roles, proves server-role access, proves anon and authenticated cannot SELECT or INSERT even after table/schema grants are deliberately given, and verifies snapshot immutability, event immutability and event-delete denial.
- The RLS script is also referenced by the Vitest contract suite. This is an automated CI test, not a live Supabase staging test; it does not close the staging migration-parity or production RLS gates.


## Recipient timer correctness refinement — 2026-11-21

- Code review found the original three-second timer began when the open API request arrived, potentially before the snapshot was rendered. This could undercount the recipient's visible time under network latency.
- Changed `open` to read-only; added `markViewed` which is called after the React snapshot render. The server starts the timer once under a database row lock; final confirmation remains enforced by PostgreSQL time.
- Added a regression contract test for the post-render timer boundary. Awaiting CI on the resulting exact branch head; no runtime test is claimed yet.


## Baseline command evidence — 2026-11-21T07:41:30Z UTC

- Added `docs/BASELINE.md` with actual command/exit-code results. Current shell is `/`, not a Git checkout; git status/branch/remote each exit 128. Node is v22.16.0 (exit 0); pnpm is absent (exit 127); shallow clone exits 128 because DNS cannot resolve github.com.
- Local pnpm install/typecheck/lint/test/build/secret-scan therefore remain NOT RUN. Do not infer success; use exact-head CI evidence.
- The current code has a post-render timer refinement and a separate terminal-state UI fix; only a CI run tied to the final head can validate them.


## CI supply-chain and regression-test hardening — 2026-11-21

- CI run #924 completed successfully on SHA `213d0eb2a59a9c0819dfc7a438385b3eeaf4432c`: dependency install, TypeScript, Edge Function checks, isolated PostgreSQL migration/RLS test, accessibility contract, stub audit, Vitest, production build, Chromium desktop/Pixel 7 browser acceptance, scanner gateway, real ClamAV and Docker Compose liveness/readiness all passed.
- Review found the original RLS test could remain green if the restrictive deny policy were removed, because no permissive policy existed. Added a test-only permissive policy so the negative anon/authenticated SELECT/INSERT cases now depend on the restrictive production policy.
- Added Gitleaks v3.0.0 pinned by commit SHA, pnpm audit, and a production dependency license inventory with unknown-license failure. The inventory does not invent a legal allow-list; final license approval remains an owner/legal gate.
- These CI changes require a fresh exact-head run; #924 does not include them.


## Dependency audit remediation started — 2026-11-21

- CI #925 completed with failure in the new dependency audit. Actual output: **157 vulnerabilities** (17 low, 78 moderate, 56 high, 6 critical). This is a real dependency finding, not a registry error.
- Direct upgrades started: AWS SDK S3 packages 3.1173.0, tRPC 11.29.5, Axios 1.21.1, Zod 4.6.7, Vite 7.3.8, Vitest 4.1.12, PostCSS 8.5.33, nanoid 5.1.6. Removed the pnpm devDependency and pinned packageManager to pnpm 10.34.9.
- Replaced the unpatched `xlsx@0.18.5` with `@e965/xlsx@0.20.3` through the existing `xlsx` import alias; this independent republisher requires source/provenance and compatibility review.
- Added a lockfile-refresh workflow that runs `pnpm audit --fix`, regenerates the lockfile without executing lifecycle scripts, and uploads package/lock/audit evidence. The main CI now continues the other tests after audit failure and enforces audit/license results at the end.
- No dependency remediation is accepted until the refreshed lockfile is committed, audit is clean, typecheck/tests/build/browser/security tests pass on that exact SHA.


## Dependency audit remediation result — 2026-11-21

- The dependency lock refresh workflow #6 completed successfully on input SHA `c7364026772b3db62310cf1326ebb3855f8e4047`.
- It ran `pnpm audit --fix`, regenerated `pnpm-lock.yaml` without lifecycle scripts, and then ran `pnpm audit --json`. **Audit exit code: 0; vulnerabilities: 0 (0 info, 0 low, 0 moderate, 0 high, 0 critical; 802 dependencies).**
- The workflow committed the resulting `pnpm-workspace.yaml` advisory overrides and `pnpm-lock.yaml` to branch commit `e170b14c40f8c58285ab03075de62fb2f3bd7010`.
- The lockfile refresh workflow itself passed. The main CI workflow for the bot-updated SHA was marked `action_required`; it has not yet validated the refreshed lockfile through typecheck, unit tests, build, browser, RLS, scanner and Docker gates. Trigger a new exact-head PR run after the documentation checkpoint commit.
- No advisory was ignored. The Excel export dependency now aliases `xlsx` to `@e965/xlsx@0.20.3`; independent publisher/provenance and license review remain open.


## Dependency compatibility corrections — 2026-11-21

- Exact-head CI #933: Gitleaks and dependency audit passed; TypeScript, Supabase Edge Function typecheck and negative PostgreSQL RLS integration passed. Unit tests: 293 passed / 1 failed across 65 files. The failing contract test requires exact dependency declarations; caret ranges introduced in the initial remediation violated that invariant. Direct versions are now exact.
- Production license inventory failed only for `khroma@2.1.0`: npm metadata omits the license field, but its published README declares MIT. Added a source-verified, package-specific metadata override with evidence URL; owner/legal distribution approval remains pending.
- Docker Compose smoke failed with `TypeError: pathRegexp is not a function`. Root cause: pnpm audit fixer resolved `path-to-regexp@>=0.1.13` to v9, incompatible with Express 4. Pinned the patched dependency to `0.1.13`; body-parser is pinned to compatible patched 1.20.9.
- Dockerfile's global pnpm was still 10.4.1; updated to 10.34.9. First-party Actions are updated to Node 24 releases. A fresh lockfile refresh and exact-head full CI are required.


## Compatible patched lockfile committed — 2026-11-21

- Lock refresh workflow #12 succeeded on input SHA `ffa2020bcf25134f8df05b365f486f80b5255088`, with zero dependency advisories after `pnpm audit --fix`.
- The workflow committed the corrected `pnpm-workspace.yaml` and regenerated `pnpm-lock.yaml` at `b7768271ace583d33fa362fbd483c9a1f3ab7b3f`.
- This commit includes exact dependency declarations, Express-compatible `path-to-regexp@0.1.13` and `body-parser@1.20.9` overrides, Dockerfile pnpm 10.34.9, Node 24-compatible Actions, and the source-verified khroma license metadata exception.
- The previous CI #934 was running on the pre-lockfile SHA and is not final acceptance. A new exact-head run must validate the committed lockfile.


## Final security review correction — 2026-11-21

- Review of the full PR diff found that an expired bearer link was still returning the document snapshot alongside an `expired` status. Fixed the server to return no snapshot after expiry and the recipient page to clear snapshot state if expiry is discovered during the view call.
- Recipient page now resets all state and mutations when the bearer token changes, preventing a previous document from remaining visible during navigation.
- Confirmation wait status now uses PostgreSQL time rather than the application server clock; acknowledged name is returned consistently for replayed/parallel confirmation; migration trigger now makes first-view and final acknowledgment immutable and is safe to re-run for policy/trigger creation.
- These changes require a new exact-head CI run. Previous CI #938 does not cover this final security correction.


## PostgreSQL trigger syntax correction — 2026-11-21
- CI #940 failed in the isolated migration/RLS step with `syntax error at or near RAISE`. Root cause: an automated JS string replacement converted the closing `$$;` delimiter to `$;`. Corrected with a literal callback replacement.
- Extended the database guard to reject acknowledgment before three seconds have elapsed and to keep first-view/acknowledged state immutable. The SQL integration test now verifies both cases, in addition to snapshot immutability, event immutability, delete denial and negative browser RLS.
- CI #940 is not accepted; rerun the complete suite on the corrected migration.
