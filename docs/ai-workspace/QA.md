# DSAI AI Workspace — QA

Updated: 2026-11-24

## Repository and feature verification
- Repository: `banglarvoice33-byte/dsai`; stack: React 19, Vite 7, TypeScript, Wouter, Express 4, tRPC 11, Drizzle/PostgreSQL, Tailwind 4, Vitest, pnpm 10.
- 14 categories and 140 unique directory entries verified.
- Work Desk execution paths verified in source: personal OpenRouter Free route and personal Gemini BYOK with explicit per-request consent.
- Existing file upload/quarantine, task queue/history/retry/cancel, result editing and route architecture preserved.
- `vercel.json` `__path` rewrites and cron routes preserved.

## Successful CI
- Earlier full run `45403685184` / #1334: success (32/32 steps).
- Exact PR #171 head `4317f971e327cd66cb3280dbb43e064884aa429e`: run `45405028873` / #1335, completed successfully.
- PR #172 documentation head `6a0e976b9f6a344526fa5c35cee33e3a85702d84`: run `45407092153` / #1337, completed successfully.
- TypeScript, dependency security audit, license inventory, Supabase Edge Function types, Supabase policy/RLS checks, accessibility checks and production-stub audit passed in the full application CI run.
- Unit tests: 70 files / 335 tests passed in the full verification run.
- Production build passed.
- Chromium browser acceptance: 107 checks across desktop, 320px mobile and Pixel 7 viewport; checked routes passed horizontal-overflow checks.
- AI Hub browser checks: 140 provider cards, 140 safe HTTPS official links, 30 priority provider searches, reset, no-result state and category filtering passed.
- Scanner gateway, ClamAV health/auth/clean/EICAR/outage fail-closed, Docker Compose liveness/readiness and YARA under 512 MiB passed; prior measured YARA runtime was 34.91 MiB.
- PR #170's older CI run failed at Chromium browser acceptance and was closed as superseded; it was not merged.

## Dashboard design consistency slice — passed and released
- Shared primary/focus tokens changed to `#176b4b` / `#27805b`; dashboard sidebar navigation target is 44px (`h-11`).
- Added a source contract assertion in `server/dashboard.sidebar.test.ts` for both changes.
- PR #175 exact-head CI run #1346 passed TypeScript, accessibility, unit tests, production build, Chromium acceptance and scanner/container checks.
- PR #175 merged; Vercel production deployment `dpl_EXyaNQrWXjde8mNCK2YoKvdpQ1n8` is READY for commit `247c317a013cf0a64c0bae285f1831827fb94577`.

## Production verification
- Latest deployment `dpl_3UM5XiQVBwgP84kir3fBXezZjzHD` is READY for production and points to merged commit `022ff1f6905c38f85e0f998ec115153758780a2d` (PR #172).
- This commit includes the application release from PR #171, merge commit `c087e02c38813d2f9964962121d3eced60d3a7ab`.
- Previous HTTP smoke checks returned 200 on `/`, `/ai-hub`, `/workspace`, `/admin`, `/healthz`, `/readyz`, `/ai-hub?q=chobi`, and `/workspace?panel=marketplace`.
- Previous `/readyz`: `databaseConfigured=true` and `databaseHandle=true`.
- Previous Vercel runtime error query over the preceding 24 hours: no runtime errors found.
- Vercel metadata confirms the latest deployment is READY. A fresh browser fetch in this session could not access the production routes, so no new live browser check is claimed.
- No production migration, provider key exchange, or live/billable generation was performed.

## AI Hub provider transparency — passed
- PR #173 exact-head CI run #1343 passed TypeScript, accessibility, unit tests, production build, Chromium acceptance and scanner/container gates.
- Provider details distinguish DSAI execution availability from external website access and unverified API/free quota claims.
- No provider credential, billing policy, backend execution or catalog record was changed.

## Multi-term search — pending
- Rebased PR #178 carries the same source/test change on the current main base and includes refreshed STATUS/QA records.
- Earlier PR #176 was closed as superseded; its exact-head run #1347 was not used as release evidence.
- PR #178 exact-head CI is pending; do not merge until the complete workflow succeeds.

## Not verified / remaining UAT
- [ ] Authenticated Work Desk task creation, cancellation, result editing, history and connector deep-link.
- [ ] Authenticated admin sidebar and route authorization.
- [ ] Real user-owned provider generation and account-specific quota/billing outcomes.
- [ ] Manual 320px/tablet/desktop, keyboard-only, zoom/reflow and light/dark/system review.
- 140 catalog entries are not 140 direct API integrations: OpenRouter and Gemini have user-owned Work Desk paths; the remaining 138 are directory entries pending official API/auth/terms and tested adapters.
- Automated accessibility checks do not constitute WCAG certification. HTTP route smoke checks do not prove authenticated user flows.
