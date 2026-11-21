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
