# DSAI Human Gates — Lead Generation, Work Desk and Customer Acknowledgment

Updated: 2026-11-21

## Confirmed by repository inspection
- Lead Composer route `/lead-composer` is public at route level but AI composition and CRM persistence require authenticated procedures.
- Lead options include country/market search and region filter, target language, audience, industry, business stage, lead goal, work region, offer, tone (professional/warm/concise/community), and channel (email/SMS/social DM/phone script).
- Lead drafts require explicit draft-only acknowledgment. The application states it does not send messages. CRM save requires contact name plus valid email or phone; contact consent remains a separate unknown/granted/withdrawn/not-required field.
- Work Desk route `/workspace` and `/documents` has a Files panel with text-only AI tasks and file upload. File extraction currently supports UTF-8 TXT, CSV and JSON only; PDF, DOCX, XLSX and image OCR are explicitly not enabled.
- Work Desk tasks expose queued/running/retry-wait/completed/failed/cancelled statuses, retry/cancel actions and owner-scoped reads. This change adds in-session text editing, copy and TXT download; extracted text also gains TXT download.
- New acknowledgment workflow stores only a SHA-256 hash of a high-entropy one-time token, immutable text snapshot/hash, first-view timestamp, acknowledgment name/time and audit events. Server enforces the three-second minimum and one-time status transition.
- Acknowledgment is a document-receipt record only; it is not identity-verified or a legal e-signature. Link is a bearer capability; email address is recorded but not verified. DSAI does not send email/SMS.

## Open / blocked — must remain open
- `CONTRACT_ACKNOWLEDGMENT_ENABLED=false`; feature is intentionally disabled until staging acceptance.
- New migration `20261121130000_dsai_contract_acknowledgment.sql` has NOT been applied to Supabase.
- Connected Supabase account previously exposed only the production project and its default main branch; no independent staging database was available. Do not apply this migration to production as a substitute for staging.
- No local checkout/toolchain was available in the current execution environment in the previous baseline: clone DNS failed, Node was v22.16.0 and pnpm was absent. Local typecheck/build/tests have not been run here.
- GitHub CI for the final feature branch head must pass before review/merge; any run must be tied to the exact final SHA.
- Live two-owner isolation, invalid token, expired token, replay, early-confirmation, successful acknowledgment, audit evidence and account-deletion behavior require staging integration tests.
- Security/legal review must approve acknowledgment wording, retention period, link-sharing risk and data deletion policy before enabling.
- No OCR for PDF/DOCX/XLSX/images; no automatic email/SMS sending; no identity proof, qualified electronic signature or legal contract acceptance.
- Production smoke, accessibility, Bengali font rendering and mobile keyboard checks remain to be run against the deployed version.

No production database migration, feature flag, Vercel environment, or outbound messaging integration was changed.


## Additional browser/accessibility gate — 2026-11-21
- Browser acceptance now installs `@axe-core/playwright@4.14.0` and runs axe WCAG 2.1 A/AA against `/lead-composer`, `/workspace?panel=files` (unauthenticated gate only), and `/confirm/invalid` in the same Chromium run; it also verifies keyboard focus enters Lead Composer.
- The first CI run #897 had one test-fixture spelling mismatch (`দ্বিতীয়` vs `দ্বিতীয়`); fixed in a subsequent commit. Run #900 on SHA `9d797faa9ed7a2ca9efce29ef65a7e4a1b3a15d7` was pending/in progress at last check. The later axe change requires a newer exact-head CI run.
- Authenticated Work Desk panel accessibility, keyboard order, reduced-motion behavior and Bengali conjunct rendering are not yet live-browser verified; retain these as open gates until a test account/browser session exercises the actual logged-in panel.
