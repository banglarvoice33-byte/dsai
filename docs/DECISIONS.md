# DSAI Engineering Decisions

## 2026-11-21 — DSAI-UX-ACK-001: keep customer acknowledgment disabled until live acceptance

- **Context:** The current Lead Composer already supports Bengali-first market, industry, stage, goal, tone and channel options, AI draft generation, local drafts, Excel export and owner-scoped CRM records. The Work Desk already supports durable text tasks and clean-file-gated TXT/CSV/JSON extraction. PDF/DOCX/XLSX/image OCR is not implemented. The repository did not contain a complete one-time customer acknowledgment flow.
- **Options:** treat CRM contact-consent as contract acknowledgment (rejected: it does not bind a customer to a specific immutable document); add a provider-based legal e-signature (rejected: no identity/signature provider is configured); implement a limited one-time document-receipt acknowledgment with a hashed bearer token and immutable text snapshot, while clearly disclaiming identity/legal signature.
- **Evidence:** Current implementation: `client/src/pages/LeadComposer.tsx`, `client/src/pages/Workspace.tsx`, `client/src/components/FileUploadPanel.tsx`, `client/src/components/WorkDeskTextPanel.tsx`, `server/routers.ts`, `server/workDeskTasks.ts`, and `server/workDeskTextTasks.ts`. Prior product decision selected customer acknowledgment, not identity-verified legal signature.
- **Decision:** Add a server-side acknowledgment ledger using a 256-bit random bearer token; persist only SHA-256(token); snapshot the exact user-entered title/body and persist SHA-256(snapshot); keep owner operations protected; expose recipient open/confirm only by the bearer token; enforce a 3-second minimum server-side from first view; make the acknowledgment transition atomic and one-time; retain append-only audit events; expire links after 7 days; cap creation at 20 per owner per UTC day. The customer supplies a name, but this is explicitly self-asserted. The link is manually shared and email ownership is not verified. This is not a legal e-signature.
- **Feature gate:** `CONTRACT_ACKNOWLEDGMENT_ENABLED=false` by default. Do not enable until the migration is applied to an independent staging database, owner isolation/replay/expiry/3-second negative tests pass, production privacy/legal wording is reviewed, and deployment is verified.
- **How to reverse:** keep the flag false; revert the UI/router/service commits and remove the migration only if it has not been applied. If applied, use a reviewed forward migration and preserve audit-retention obligations; do not manually delete evidence rows.

## 2026-11-21 — DSAI-UX-WORKDESK-002: make AI results reusable without claiming edits are persisted

- **Context:** Work Desk text task results were visible and copyable, but not editable or directly downloadable.
- **Decision:** Add in-session result editing plus copy and TXT download. Add TXT download for extracted file text. Explicitly state that edits are session-only and must be copied/downloaded; do not imply server persistence.
- **How to reverse:** revert the WorkDeskTextPanel/FileUploadPanel UI and corresponding regression assertions. No database migration is needed.


## 2026-11-21 — DSAI-SEC-ACK-003: start the recipient wait only after snapshot render

- **Context:** The first implementation recorded `first_viewed_at` while the recipient's initial API request was being processed. Network latency meant the three-second minimum could begin before the snapshot was actually displayed.
- **Options:** retain request-arrival timing (rejected: undercounts visible time); use only a browser timer (rejected: client clock is untrusted); split snapshot retrieval from a post-render `markViewed` call, with the database timestamp remaining authoritative (selected).
- **Decision:** `open` now reads the immutable snapshot without changing the timer. After React commits the snapshot to the recipient page, a `useEffect` calls the public token-only `markViewed` procedure. The server sets `first_viewed_at` once under a row lock; `confirm` still enforces `first_viewed_at <= now() - interval '3 seconds'` using PostgreSQL time. The browser countdown is advisory only.
- **How to reverse:** revert the `markViewed` procedure, service method, recipient effect and regression test together. Do not revert to request-arrival timing without changing the documented security boundary.


## 2026-11-21 — DSAI-SEC-CI-004: make RLS regression tests sensitive to policy removal

- **Context:** The first PostgreSQL negative test granted browser roles table privileges, but with no permissive policy a table with RLS enabled still defaults to deny. Removing only the restrictive browser-deny policy would therefore leave the test green.
- **Options:** keep default-deny only (rejected: false confidence); add a test-only permissive policy for browser roles so the production restrictive deny is required for the test to pass (selected).
- **Decision:** The disposable PostgreSQL CI test creates a permissive `USING (true) WITH CHECK (true)` policy after applying the migration. Anon/authenticated SELECT and INSERT must still be denied by the migration's restrictive policy. If that restrictive policy is removed, the existing negative assertions now fail.
- **How to reverse:** remove the test-only permissive policy only if the RLS regression test is replaced by an equally strong mutation-sensitive test. Never add this permissive policy to a deployed environment.
