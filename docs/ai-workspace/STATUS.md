# DSAI AI Workspace — Status

Updated: 2026-11-24

## Verified architecture and baseline
- Repository: `banglarvoice33-byte/dsai`; default branch: `main`.
- Stack: React 19, Vite 7, TypeScript, Wouter, Express 4, tRPC 11, React Query, Drizzle/PostgreSQL, Tailwind 4, Vitest, pnpm 10.
- Preserve `vercel.json` `__path` rewrites and cron routes.
- AI Hub catalog: 14 categories and 140 unique public directory entries.
- Existing Work Desk task/history/file/quarantine and connector lifecycle preserved.
- Verified user-owned Work Desk connectors: OpenRouter Free route and personal Gemini BYOK with explicit per-request billing consent.

## Implemented and released
- [x] AI Hub Bangla-first discovery layout, responsive provider cards, category filters, result count and empty state.
- [x] Curated Bangla/Banglish/English keyword aliases; keyword search is not represented as semantic AI search.
- [x] URL-restorable AI Hub query/category filters.
- [x] All 140 catalog entries retained; external-site listings are distinguished from DSAI execution connectors.
- [x] Work Desk quick-start links, existing task panel, provider execution, file upload/quarantine, task history, cancellation and retry preserved.
- [x] Dashboard sidebar includes AI Hub, Work Desk and public-home navigation; existing admin role guard retained.
- [x] PR #171 application changes merged; exact-head CI #1335 passed.
- [x] PR #172 and PR #174 documentation changes merged; PR #174 exact-head CI run #1344 passed.
- [x] Latest Vercel production deployment is READY: commit `ec5a7f205ea8959012726577c02fa48ad848b146`, deployment `dpl_BGfrgihBRPZYMjqMzZ6e3ZkgtZH4`.

## Current implementation slice — in review
- [x] Improve AI Hub keyword search so every term in a multi-word query can match curated category/provider text.
- [x] Add regression cases for multi-word aliases (for example `pdf scan`, `image design`, `workflow automation`).
- [ ] Exact-head CI and review for branch `feat/ai-hub-multiterm-search-20261124`.
- [ ] Merge and production deployment only after successful CI and explicit release gate.

## Integration truth
- Two user-owned connector paths currently verified: OpenRouter and Gemini.
- The other 138 catalog entries remain discovery destinations until official API/auth/terms and a tested adapter exist.
- OpenAI/xAI are not enabled for Free-only Work Desk execution. Cloudflare Workers AI remains operator-gated pending account-level quota and billing verification.
- Do not infer free API access from a provider website free plan, open-source model availability, or catalog presence.

## Verification and limitations
- Prior full CI run #1334 passed (32/32 steps); 70 test files / 335 tests passed; production build passed.
- Prior Chromium acceptance: 107 checks across desktop, 320px mobile and Pixel 7; AI Hub checks covered 140 cards, 140 HTTPS links and 30 priority searches.
- PR #171 exact-head CI #1335 and PR #172 CI #1337 passed. PR #174 exact-head CI #1344 passed.
- Latest Vercel production deployment metadata is READY. Prior route smoke checks passed; no fresh authenticated browser UAT is claimed.
- Authenticated Work Desk/admin UAT, keyboard-only and manual theme/reflow review, and live provider billing/quota verification remain outstanding.
- Automated accessibility checks are not WCAG certification.

## Exact next action
Run exact-head CI for the multi-term search slice, review the diff, then continue with a responsive/theme-consistent Work Desk and dashboard UI slice without replacing existing task, file quarantine, or connector flows.
