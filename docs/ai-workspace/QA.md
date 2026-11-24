# DSAI AI Workspace — QA

Updated: 2026-11-24

## Repository and feature verification
- Repository: `banglarvoice33-byte/dsai`; stack: React 19, Vite 7, TypeScript, Wouter, Express 4, tRPC 11, Drizzle/PostgreSQL, Tailwind 4, Vitest, pnpm 10.
- 14 categories and 140 unique directory entries verified.
- Work Desk execution paths verified in source: personal OpenRouter Free route and personal Gemini BYOK with explicit per-request consent.
- Existing file upload/quarantine, task queue/history/retry/cancel, result editing and route architecture preserved.
- `vercel.json` `__path` rewrites and cron routes preserved.

## Successful CI and production
- Full run #1334 passed (32/32 steps): TypeScript, dependency audit, license inventory, Supabase type/RLS checks, accessibility and production-stub checks.
- Unit tests: 70 files / 335 tests passed; production build passed.
- Chromium acceptance: 107 checks across desktop, 320px mobile and Pixel 7.
- AI Hub acceptance: 140 provider cards, 140 HTTPS official links, 30 priority queries, reset, no-result and category filters.
- PR #171 exact-head CI #1335 passed; PR #172 CI #1337 passed; PR #174 docs CI #1344 passed.
- Latest production deployment: `dpl_BGfrgihBRPZYMjqMzZ6e3ZkgtZH4`, READY, commit `ec5a7f205ea8959012726577c02fa48ad848b146`.
- Prior public route smoke checks returned HTTP 200 for `/`, `/ai-hub`, `/workspace`, `/admin`, `/healthz`, `/readyz`, `/ai-hub?q=chobi`, and `/workspace?panel=marketplace`. These are historical checks, not a new browser run.
- No production database migration, provider key exchange, or live/billable generation was performed.

## Current branch verification — pending
- Branch: `feat/ai-hub-multiterm-search-20261124`.
- Changed code: `shared/aiHubSearch.ts`; regression tests: `shared/aiHubSearch.test.ts`.
- Change: split normalized query into terms and require all terms to match category or provider searchable text. Existing catalog and alias data remain unchanged.
- Added test cases: `pdf scan`, `image design`, `speech to text`, `workflow automation`.
- [ ] Exact-head CI not yet run; do not treat tests as passed until CI reports success.
- [ ] Production deployment is not requested for this unmerged branch.

## Not verified / remaining UAT
- [ ] Authenticated Work Desk task creation, cancellation, result editing, history and connector deep-link.
- [ ] Authenticated admin sidebar and route authorization.
- [ ] Manual 320px/tablet/desktop, keyboard-only, zoom/reflow and light/dark/system review.
- [ ] Real user-owned provider generation and account-specific quota/billing outcomes.
- 140 directory entries are not 140 direct API integrations: OpenRouter and Gemini have user-owned Work Desk paths; the remaining 138 are directory entries pending official API/auth/terms and tested adapters.
- Automated accessibility checks do not constitute WCAG certification. HTTP route smoke checks do not prove authenticated task execution.
