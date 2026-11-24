# Gemini BYOK release gate log — 2026-11-24

## Scope

Web-only DSAI AI Hub / Work Desk Gemini BYOK. No Android, iOS, Windows, or macOS release artifact is changed by this work.

## Gate register

| Gate | State | Evidence / reason | Exit condition |
|---|---|---|---|
| GitHub branch isolation | PASS | Feature changes are on `feat/gemini-byok-hybrid-ai`; `main` has no BYOK implementation. | Keep feature isolated until release approval. |
| Credential security | IMPLEMENTED / TEST PENDING | AES-256-GCM envelope v2 binds user ID + provider; legacy v1 remains readable; key IDs and batch rotation runner are included. | TypeScript + Vitest pass; production key rotation procedure verified. |
| Provider and billing isolation | IMPLEMENTED / TEST PENDING | Gemini uses the owner's key, server-controlled model allowlist, no DSAI shared provider quota, no platform-paid fallback, and explicit per-request/retry consent. | CI and post-deploy acceptance checks pass. |
| Supabase migration | CREATED / NOT APPLIED | Migration is additive and preserves existing rows. Current production connector table has zero rows; Work Desk has two existing rows, both compatible with the new constraints. | CI disposable-Postgres migration test passes; apply migration before application deployment; verify columns/constraints/RLS. |
| GitHub CI | PENDING | Full workflow includes TypeScript, accessibility, Vitest, production build, Docker build and the new disposable-Postgres migration test. | Latest PR head has a successful CI conclusion. |
| Supabase preview | SKIPPED | The Supabase GitHub check reports no associated Supabase branch. Vercel Preview environment points to the production Supabase project. No extra preview database or deployment is created. | Not required; use disposable CI PostgreSQL and production migration gate. |
| Live Gemini provider call | BLOCKED ON USER KEY | No user-owned Gemini API key is available in this engineering session. Tests use mocked provider responses and metadata-only verification; no billable generation request is sent. | After deployment, owner connects their key and completes one explicitly consented smoke test. |
| Production deployment | BLOCKED | Do not deploy feature code before CI passes and the Supabase migration is applied. | Merge PR, confirm Vercel Production READY, then verify health/readiness and Free route. |

## Verification history

- Initial full CI run: secret scan, dependency security audit, license inventory, scanner gateway security tests, ClamAV integration and Docker Compose smoke checks passed; TypeScript failed because the shared-quota adapter call did not narrow the provider union. The call site has been narrowed explicitly; a new full CI run is required before merge.

## Billing and rollback invariants

- DSAI Free route remains the default; the existing OpenRouter Free route is unchanged.
- Gemini BYOK requests use only the connected user's credential and may incur Google charges.
- Gemini BYOK never consumes DSAI shared provider quota or Free Credit and never falls back to a DSAI paid credential. A separate DSAI abuse-prevention limit applies (default 30 requests per 10 minutes, configurable up to 120).
- Provider timeout/cancellation after dispatch records `unknown`; automatic retry is disabled. Manual retry requires fresh confirmation.
- If deployment must be rolled back, the additive database migration is retained; the previous application version remains compatible with the added columns and widened provider check.
- Do not remove old connector encryption key IDs until the rotation runner reports zero remaining rows for those IDs and connector tests succeed.

