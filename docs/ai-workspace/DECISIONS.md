# DSAI AI Workspace — Decisions

## 2026-11-24
1. Preserve the existing React/Vite + Express/tRPC architecture, routes, data and Vercel `__path` gateway. No framework migration.
2. Preserve all 140 catalog entries and 14 categories. Improve discoverability; do not inflate or prune the catalog.
3. Label external destinations as external services. Directory listing is not an API integration.
4. Expose Work Desk setup only for verified credential/execution paths: OpenRouter Free route and Gemini personal BYOK. Gemini must retain explicit provider-billing consent; no silent fallback.
5. OpenAI/xAI credentials may be stored, but they are not approved Work Desk execution routes in the current Free-only path.
6. Cloudflare Workers AI has a server adapter and exact model allowlist, but remains gated until the operator verifies account-level free allocation, billing configuration and the no-charge boundary.
7. Use URL query parameters for shareable AI Hub filters and a deep link to the Work Desk connector tab.
8. Do not deploy to production or apply database migrations without explicit approval; the owner explicitly requested the PR #171 production release on 2026-11-24.

## Work Desk entry shell (2026-11-24)
- Add a compact, responsive Bangla-first quick-start band above the existing Work Desk task panel.
- Keep it navigation-only: prompt anchor, AI Hub route and existing `?panel=marketplace` connector deep-link. It does not create a task, switch providers, grant consent or trigger paid work.
- Preserve the current task panel, durable queue, file quarantine, provider billing disclosures and all existing routes.

## Dashboard navigation (2026-11-24)
- Keep the existing admin dashboard and role guard; polish its current sidebar rather than introducing a second dashboard.
- Use Bangla-first/bilingual navigation labels and provide a direct link to the existing public homepage.
- Preserve every existing admin destination and route.
- Keep stable English `label` values for route/test compatibility and add separate `labelBn` values for bilingual display.
- Preserve existing admin role guard, routes and mobile drawer close behaviour.

## Production release (2026-11-24)
- PR #171 was marked ready only after exact-head CI run #1335 completed successfully, then merged as `c087e02c38813d2f9964962121d3eced60d3a7ab`.
- Vercel production deployment `dpl_CVusVnQLasePyuoYh1XaV44ndvPm` reached READY and was verified against public routes and health/readiness endpoints.
- No database migration, paid provider activation, secret change or live provider generation was performed.

## Dashboard design consistency slice (2026-11-24)
- Reuse the existing DSAI forest-green palette for shared dashboard primary actions and focus rings instead of introducing a second accent system; retain warm neutral surfaces and existing public-home branding.
- Set dashboard sidebar navigation items to 44px minimum height to improve practical touch access without changing routes, role guards, collapse behavior, or mobile drawer behavior.
- Add a source-level regression contract test. Keep the change isolated and reversible.


## Responsive Work Desk flow order — 2026-11-24
- Improve narrow-screen reading order using the existing Work Desk panel as a flex column: recent tasks first, composer and prompt ideas next, generated output below.
- Add accessible labels for task history, composer and recent result regions.
- Keep task state, tRPC requests, provider selection, billing consent, upload/quarantine, editing, copy/download/save, cancel/retry and persistence behavior unchanged.
- Require exact-head CI before merge; PR #179 passed run `45415209290` and merged as `b676e48e7391ca80e524f5d01942a38361beb894`.
