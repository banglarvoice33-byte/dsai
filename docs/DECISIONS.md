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
