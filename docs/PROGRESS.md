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
