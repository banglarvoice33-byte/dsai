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

## Production verification
- Latest deployment `dpl_3UM5XiQVBwgP84kir3fBXezZjzHD` is READY for production and points to merged commit `022ff1f6905c38f85e0f998ec115153758780a2d` (PR #172).
- This commit includes the application release from PR #171, merge commit `c087e02c38813d2f9964962121d3eced60d3a7ab`.
- Previous HTTP smoke checks returned 200 on `/`, `/ai-hub`, `/workspace`, `/admin`, `/healthz`, `/readyz`, `/ai-hub?q=chobi`, and `/workspace?panel=marketplace`.
- Previous `/readyz`: `databaseConfigured=true` and `databaseHandle=true`.
- Previous Vercel runtime error query over the preceding 24 hours: no runtime errors found.
- Vercel metadata confirms the latest deployment is READY. A fresh browser fetch in this session could not access the production routes, so no new live browser check is claimed.
- No production migration, provider key exchange, or live/billable generation was performed.

## Not verified / remaining UAT
- [ ] Authenticated Work Desk task creation, cancellation, result editing, history and connector deep-link.
- [ ] Authenticated admin sidebar and route authorization.
- [ ] Real user-owned provider generation and account-specific quota/billing outcomes.
- [ ] Manual 320px/tablet/desktop, keyboard-only, zoom/reflow and light/dark/system review.
- 140 catalog entries are not 140 direct API integrations: OpenRouter and Gemini have user-owned Work Desk paths; the remaining 138 are directory entries pending official API/auth/terms and tested adapters.
- Automated accessibility checks do not constitute WCAG certification. HTTP route smoke checks do not prove authenticated user flows.
