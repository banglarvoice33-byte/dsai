# DSAI AI Workspace — QA

Updated: 2026-11-24

## Verified baseline
- Repository: `banglarvoice33-byte/dsai`; main HEAD at initial inspection: `d6c99dffd24fc2002dd050e07c7253785ead4d52`.
- Stack: React 19, Vite 7, TypeScript, Wouter, Express 4, tRPC 11, React Query, Drizzle/PostgreSQL, Tailwind 4, Vitest, pnpm 10.
- AI directory: 14 categories, 140 unique provider records and 140 HTTPS official destinations.
- Work Desk execution paths verified in source: OpenRouter Free route and personal Gemini BYOK. Gemini may incur provider charges and retains explicit consent.
- `vercel.json` `__path` rewrites and existing cron routes were preserved.

## Successful CI — current implementation
- Run: `45401856189`; commit: `980fefb7b688067b2a797dfd6af6b92dbe601d4f`; result: success.
- TypeScript, dependency security audit, license inventory, Supabase Edge Function types, Supabase policy/RLS checks, accessibility checks and production stub audit: passed.
- Unit tests: 70 files / 335 tests passed.
- Production build: passed.
- Chromium browser acceptance: 73 checks passed across desktop and Pixel 7 viewport.
- AI Hub browser checks: 140 provider cards, 140 safe HTTPS official links, 30 priority provider searches, search reset, no-result state and category filtering passed.
- Scanner gateway, ClamAV health/auth/clean/EICAR/outage fail-closed, Docker Compose liveness/readiness and YARA under 512 MiB: passed.
- YARA measurement from the previous successful full run: 34.66 MiB runtime memory and 176,865,432-byte image.

## Not verified / release blockers
- No authenticated test credentials were supplied. Work Desk quick-start and admin dashboard require authenticated/manual UAT for their signed-in states.
- No real provider key was used to execute a live billable request. Provider billing/quota behaviour remains dependent on each provider account.
- The 140 records are directory destinations, not 140 direct DSAI API integrations. Only OpenRouter and Gemini currently expose verified Work Desk setup paths; the other 138 remain external-site entries until official API/auth/terms and a tested adapter exist.
- No Vercel Preview or production deployment was performed. No production migration was applied.
- No manual 320px/zoom/keyboard-only/light-dark-system review or WCAG certification is claimed. Automated accessibility checks passed; they are not certification.

## Required next verification
- [ ] Authenticated Work Desk quick-start and connector deep-link UAT.
- [ ] Authenticated admin sidebar and route authorization UAT.
- [ ] Manual 320px, tablet and desktop review; keyboard-only, zoom/reflow, light/dark/system.
- [ ] Add provider adapters only after official API docs, auth, usage terms, user credentials and billing consent are verified.
