# DSAI AI Workspace — Plan

## Scope
Incrementally polish the existing DSAI Work Desk, AI Hub, dashboard and public frontend. Preserve routes, stored user data, working task flows, provider consent, security controls and Vercel request routing. This is not a rebuild.

## Delivery checklist
- [x] Verify repository, framework, scripts, route registration and Vercel `__path` rewrite.
- [x] Verify the 14-category / 140-entry public AI directory.
- [x] Verify actual connector lifecycle and distinguish it from external directory links.
- [x] AI Hub Bangla-first discovery, keyword aliases, URL-restorable filters, result/empty states and connector hand-off.
- [x] Preserve all 140 catalog entries and clearly label external website listings vs DSAI runtime connectors.
- [x] Work Desk connector deep-link and non-destructive skill replacement confirmation.
- [x] Responsive Work Desk quick-start shell with prompt, AI Hub and connector entry points.
- [x] Dashboard navigation and public Home AI Hub discovery polish.
- [x] Bilingual admin sidebar while preserving existing routes, role guards and navigation destinations.
- [x] Run exact-head repository CI; PR #171 merged after successful run #1335.
- [x] Deploy merged commit to Vercel production and verify READY state.
- [x] Smoke-test public routes, health/readiness endpoints and recent runtime errors.
- [ ] Authenticated Work Desk and admin-dashboard UAT; manual mobile/zoom/keyboard/theme review.
- [ ] Add and verify more provider adapters one at a time; do not mislabel directory entries as integrations.

## Guardrails
- Keep the current React/Vite + Express/tRPC architecture and `vercel.json` `__path` rewrite.
- Never remove catalog entries to simplify UI.
- Never claim that directory presence equals API integration.
- Keep OpenRouter Free route distinct from personal Gemini BYOK (provider quota/billing may apply and explicit consent is required).
- Cloudflare Workers AI remains gated until operator-level account/quota and billing boundary are verified.
- Do not expose provider secrets, invent provider integrations, silently fall back to a different billable provider, or apply production migrations without approval.

## Release record
- PR #171 merged as `c087e02c38813d2f9964962121d3eced60d3a7ab`.
- Exact-head CI: run `45405028873` / #1335, success.
- Vercel production: `dpl_CVusVnQLasePyuoYh1XaV44ndvPm`, READY.
