# DSAI AI Workspace — QA

## Baseline evidence
- Repository main HEAD inspected: `d6c99dffd24fc2002dd050e07c7253785ead4d52`.
- `package.json` scripts available: `check`, `test`, `build`, `check:a11y`, `check:stubs`, `verify`.
- Static source confirms 14 categories / 140 unique provider entries with HTTPS official URLs.
- Source review found stale test assertions: `shared/aiHubCapabilities.test.ts` expected OpenRouter only although current capability source and server connector implementation include Gemini BYOK; `shared/aiHubPublicCatalog.test.ts` expected older AIHub markup.
- No local TypeScript/Vitest/build/browser run has been performed from this GitHub-only editing environment.

## Required verification
- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm run check`
- [ ] `pnpm run test`
- [ ] `pnpm run check:a11y`
- [ ] `pnpm run check:stubs`
- [ ] `pnpm run build`
- [ ] Browser check: 320px, tablet, desktop; Bangla/English; keyboard-only; light/dark/system.
- [ ] Verify AI Hub filter URL restoration and Work Desk connector deep-link.
- [ ] Confirm no provider request is submitted by merely navigating to connector setup.


## PR #171 browser acceptance follow-up
- Run: `45398511623` (commit `9fcac54df8ad34615e42b962c9f05c48ed8026d3`).
- Passed: Gitleaks, dependency audit, license inventory, TypeScript, Supabase Edge Function type check, Supabase policy/RLS checks, accessibility checks, production stub audit, unit tests (70 files / 335 tests), production build, scanner gateway tests, ClamAV clean/EICAR/auth/outage, Docker Compose readiness and YARA under 512 MiB.
- Failed: Chromium browser acceptance. The run rendered all 140 official HTTPS provider links, then timed out because the search textbox accessible name did not match the established browser contract (`এআই সেবা খুঁজুন`).
- Fix: align the search input accessible name and empty-state reset action with the existing acceptance script; rerun CI before calling the slice verified.
