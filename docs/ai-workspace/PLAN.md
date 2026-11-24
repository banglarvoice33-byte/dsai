# DSAI Work Desk & AI Hub Upgrade

## Scope
Improve existing Work Desk, AI Hub, dashboard entry points and public front site. Preserve working routes, account data, task execution, file quarantine, connectors and Vercel gateway.

## Delivery slices
- [x] Verify React/Vite/Wouter + Express/tRPC + PostgreSQL/Drizzle architecture and Vercel __path rewrite.
- [x] Verify current Work Desk task flow and existing upload/quarantine integration (merged PR #144).
- [x] Refresh AI Hub with Bengali-first discovery, responsive filters, shareable URL state, empty states and honest directory/runtime labels.
- [x] Add curated Bangla/Banglish task aliases to keyword search.
- [x] Add bilingual AI Hub entry to public navigation and homepage search.
- [ ] Run CI/typecheck/tests/build/a11y/stub checks for this feature branch.
- [ ] Verify preview deployment and authenticated Work Desk flow.
- [ ] Verify production promotion only after preview and CI pass; production deploy needs explicit approval.

## Provider boundary
Catalog entries are external directory listings unless a verified authenticated runtime connector exists. Current DSAI connector setup allowlist is OpenRouter and Gemini. Gemini is personal BYOK and may incur provider charges; OpenRouter routing and billing are governed by the configured account/connection. No free quota is implied.
