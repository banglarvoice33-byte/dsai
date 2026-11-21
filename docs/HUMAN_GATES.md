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


## Isolated PostgreSQL RLS test
- CI now starts a disposable PostgreSQL 17.6 instance, applies the actual migration, and deliberately grants browser roles schema/table SELECT+INSERT privileges before asserting zero-row SELECT and denied INSERT for both `anon` and `authenticated`. It also checks server-role access and immutable snapshot/audit triggers.
- This provides a real negative RLS test against PostgreSQL, but does not replace a live Supabase staging test with the project's actual roles, grants, migration history and two distinct owner accounts.


## Recipient visible-time boundary
- The recipient timer now starts via a separate server mutation called from a React effect after the snapshot is committed to the page. Confirmation still checks the server/database timestamp and cannot be accelerated by changing the browser clock.
- CI must verify this regression. A real browser test with deliberate network latency and early-confirmation negative case remains required in staging.


## Supply-chain and license gates — 2026-11-21
- CI now runs Gitleaks v3.0.0 pinned to commit SHA `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e`, with full Git history and PR comments/artifact uploads disabled.
- CI runs `pnpm audit --audit-level=low` and emits a production dependency license inventory. Unknown or unlicensed packages fail the inventory step.
- The repository governance audit records the root package as MIT and explicitly says the final distribution license position is unresolved. No legal-approved license allow-list exists; an owner/legal reviewer must approve the allow-list before the license scan can become a legal-policy gate.
- No `lint` or `secret:scan` package script currently exists. Secret scanning is now a dedicated Gitleaks CI action; TypeScript and existing accessibility/unit checks remain separate.


## Dependency remediation and third-party xlsx publisher
- The latest completed audit (#925) found 157 vulnerabilities: 17 low, 78 moderate, 56 high and 6 critical. No GHSA was ignored.
- The xlsx package has no patched release in the registry advisory. A temporary compatibility alias to `@e965/xlsx@0.20.3` is being tested; it is not the official SheetJS publisher. Review its source provenance and license before production release. If not approved, replace the Excel export library with an owner-approved maintained alternative.
- CI's refreshed dependency lockfile and audit must pass before merge. The repository currently has no owner-approved license allow-list; legal approval remains open.


## Dependency audit gate — refreshed lockfile evidence
- Dependency lock refresh workflow #6 completed successfully: `pnpm audit --json` exit code 0, 802 dependencies, zero info/low/moderate/high/critical advisories.
- The patched `pnpm-workspace.yaml` overrides and `pnpm-lock.yaml` are committed at `e170b14c40f8c58285ab03075de62fb2f3bd7010`.
- The full CI on that exact commit has not yet completed; the first workflow attempt was marked `action_required`. Do not call the complete PR acceptance green until a fresh exact-head run finishes.
- Owner/legal review of the independent `@e965/xlsx` republisher and final license allow-list remains required.
