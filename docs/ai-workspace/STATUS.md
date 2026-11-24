# DSAI AI Workspace — Status

Updated: 2026-11-24

## Verified architecture and baseline
- Repository: `banglarvoice33-byte/dsai`; default branch: `main`.
- Stack: React 19, Vite 7, TypeScript, Wouter, Express 4, tRPC 11, React Query, Drizzle/PostgreSQL, Tailwind 4, Vitest, pnpm 10.
- Main preserves `vercel.json` `__path` rewrites and cron routes.
- AI Hub catalog: 14 categories and 140 unique public directory entries.
- Existing Work Desk task/history/file/quarantine and connector lifecycle preserved.
- Verified user-owned Work Desk connectors: OpenRouter Free route and personal Gemini BYOK with explicit per-request billing consent.
- OpenAI/xAI credentials are not enabled for Free-only Work Desk execution. Cloudflare Workers AI has a server adapter but remains operator-gated pending account-level no-billing verification.

## Implemented and released
- [x] AI Hub Bangla-first discovery layout, responsive provider cards, category filters, result count and empty state.
- [x] Curated Bangla/Banglish/English keyword aliases; keyword search is not represented as semantic AI search.
- [x] URL-restorable AI Hub query/category filters.
- [x] All 140 catalog entries retained; external-site listings are distinguished from DSAI execution connectors.
- [x] Public Home navigation, hero action and search expose AI Hub.
- [x] Work Desk responsive Bangla-first quick-start links to prompt entry, AI Hub and connector setup.
- [x] Existing task panel, provider execution, file upload/quarantine, task history, cancellation, retry and routes preserved.
- [x] Skill selection confirms before replacing a non-empty prompt.
- [x] Existing admin dashboard sidebar includes AI Hub, Work Desk and public-home navigation with bilingual labels; role guards and existing destinations retained.
- [x] Implementation records maintained.

## Implemented and released — dashboard visual consistency
- Shared primary/focus tokens now use the DSAI forest-green palette; warm neutral surfaces and the public-home art direction are preserved.
- Dashboard sidebar navigation hit area is 44px; existing route, role guard, collapse and mobile drawer behavior are retained.
- Regression contract test covers the theme tokens and touch target.
- PR #175 merged as `247c317a013cf0a64c0bae285f1831827fb94577`; exact-head CI run #1346 passed, including TypeScript, accessibility, unit tests, production build, Chromium acceptance and scanner/container gates.
- Vercel production deployment `dpl_EXyaNQrWXjde8mNCK2YoKvdpQ1n8` is READY for commit `247c317a013cf0a64c0bae285f1831827fb94577`.

## Additional AI Hub provider transparency release
- PR #173 merged as `51c5c649cf66560ea947793577c7547d93c55f40`; exact-head CI run #1343 passed.
- Provider cards expose DSAI execution status, website/API distinction, quota caveats and official links through keyboard-accessible progressive disclosure.
- This is transparency/UI work, not 140 provider integrations. OpenRouter and Gemini remain the two user-owned Work Desk execution paths; Cloudflare Workers AI remains operator-gated.
- Vercel production deployment for `51c5c649cf66560ea947793577c7547d93c55f40` was BUILDING at the latest check; do not claim it READY until Vercel confirms.

## GitHub release evidence
- PR #171 merged: https://github.com/banglarvoice33-byte/dsai/pull/171
- Application merge commit: `c087e02c38813d2f9964962121d3eced60d3a7ab`.
- Feature head: `4317f971e327cd66cb3280dbb43e064884aa429e`.
- Exact-head CI run `45405028873` / #1335 completed successfully.
- PR #172 documentation release record merged; its head CI run `45407092153` / #1337 completed successfully.
- Duplicate PR #170 was closed as superseded; its separate CI run failed during Chromium acceptance and it was not merged.

## Production deployment evidence
- PR #175 dashboard visual changes are deployed: `dpl_EXyaNQrWXjde8mNCK2YoKvdpQ1n8`, READY, commit `247c317a013cf0a64c0bae285f1831827fb94577`.
- PR #173 provider-transparency changes merged as `51c5c649cf66560ea947793577c7547d93c55f40`; the corresponding Vercel production deployment `dpl_FYBhKbDf8KPbAthZMayH6HxKBa17` was BUILDING at the latest check.
- Production URL: https://dsai-hub.vercel.app
- Prior route smoke checks returned HTTP 200 for `/`, `/ai-hub`, `/workspace`, `/admin`, `/healthz`, `/readyz`, `/ai-hub?q=chobi`, and `/workspace?panel=marketplace`; no new live browser fetch succeeded in this session.
- No production database migration, provider key exchange, or live/billable generation was performed.

## Verification
- [x] CI TypeScript, dependency security audit, license inventory, Supabase Edge Function types, RLS/policy checks, accessibility checks and production-stub audit passed.
- [x] Unit tests: 70 files / 335 tests passed in the preceding successful full verification run.
- [x] Production build passed.
- [x] Chromium acceptance: 107 checks across desktop, 320px mobile and Pixel 7 passed in the preceding full browser run.
- [x] AI Hub checks: 140 cards, 140 HTTPS official links, 30 priority search queries, reset, no-result state and category filtering passed.
- [x] ClamAV gateway integration, Docker Compose liveness/readiness and YARA 512 MiB verification passed in the full CI run.
- [x] Latest application exact-head CI run #1335 passed; documentation PR #172 CI run #1337 passed.

## Incomplete / release limitations
- [ ] Authenticated Work Desk and admin-dashboard UAT; no authenticated test credentials were supplied.
- [ ] Manual mobile/tablet/desktop, zoom/reflow, keyboard-only, light/dark/system review.
- [ ] Live user-owned provider generation and account-specific quota/billing verification.
- [ ] Additional provider adapters for the remaining catalog entries.
- 140 directory entries are not 140 direct API integrations. Two user-owned connectors have Work Desk execution paths: OpenRouter and Gemini. The other 138 remain discovery destinations until official API/auth/terms and a tested adapter exist.
- Cloudflare Workers AI is present in platform provider code but is not counted as a user-owned connector; the free-only runtime gate requires operator verification.
- Automated checks are not WCAG certification. Production HTTP route smoke checks do not prove authenticated task execution.

## Current search improvement slice — CI in progress
- Branch: `fix/ai-hub-multiterm-search-rebased-20261124`; PR #178.
- Keyword search now matches every normalized query term across curated category/provider text; regression cases cover `pdf scan`, `image design`, `speech to text` and `workflow automation`.
- Catalog entries, URL filter state and connector behavior are unchanged.
- Exact-head CI for PR #178 is pending; merge only after all required jobs succeed. The earlier PR #176 branch was closed as superseded after rebasing onto current main.

## Exact next action
Finish exact-head CI and merge the multi-term search fix after successful checks; then complete the Work Desk marketplace visual slice and continue responsive Work Desk/dashboard polish without replacing existing task, file-quarantine or connector flows.
