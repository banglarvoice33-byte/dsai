# DSAI AI Workspace — Plan

## Scope
Incrementally polish the existing DSAI Work Desk, AI Hub, dashboard and public frontend. Preserve routes, stored user data, working task flows, provider consent, security controls and Vercel request routing. This is not a rebuild.

## Delivery checklist
- [x] Verify repository, current branch, framework, scripts and deployment rewrite.
- [x] Verify the 14-category / 140-entry public AI directory.
- [x] Verify actual connector lifecycle and distinguish it from external directory links.
- [ ] AI Hub search aliases, URL-restorable filters and connector hand-off.
- [ ] Work Desk responsive composition and connector deep-link.
- [ ] Dashboard navigation and public home polish.
- [ ] Add focused tests and run the repository verification contract.
- [ ] Review accessibility, theme and mobile states.
- [ ] Prepare a preview deployment; production release requires explicit approval.

## Guardrails
- Keep the current React/Vite + Express/tRPC architecture and `vercel.json` `__path` rewrite.
- Never remove catalog entries to simplify UI.
- Never claim that directory presence equals API integration.
- Keep OpenRouter Free route distinct from personal Gemini BYOK (provider quota/billing may apply and explicit consent is required).
- Do not expose provider secrets, invent provider integrations, or silently fall back to a different billable provider.
