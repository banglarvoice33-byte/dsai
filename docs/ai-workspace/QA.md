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


## Successful CI verification — 2026-11-24
- PR #171 run: `45399848542`; commit: `753a669bd90403093408886eefb7a8abf127a9e3`; conclusion: success.
- TypeScript, Supabase Edge Function types, Supabase policy/RLS checks, accessibility, production stub audit, production build: passed.
- Unit tests: 70 files / 335 tests passed.
- Chromium browser acceptance: 73 checks passed on desktop and Pixel 7 viewport. AI Hub: 140 provider cards, 140 safe HTTPS official links, 30 priority provider searches, empty-state reset and category filter passed.
- Scanner gateway, ClamAV clean/EICAR/invalid-auth/outage fail-closed, Docker Compose liveness/readiness: passed.
- YARA scanner: passed under 512 MiB; measured runtime memory 34.66 MiB, image 176,865,432 bytes.
- Remaining: authenticated end-user UAT requires test credentials; no production deployment, production migration, or live provider billing test was performed.


## Work Desk quick-start slice
- Added a responsive task-first entry band in `client/src/pages/Workspace.tsx` with keyboard-visible focus styles and real links to prompt entry, AI Hub and the existing connector panel.
- No task API, provider selection, consent, file upload, task history or route behaviour was changed.
- Verification inherited from previous commit `753a669bd90403093408886eefb7a8abf127a9e3`: CI run 45399848542 passed all 27 steps, including TypeScript, accessibility, 335 unit tests, production build, Chromium acceptance, scanner/ClamAV/Docker/YARA and supply-chain gates.
- The new Workspace shell change is not yet covered by that run; a fresh CI run is required. No local device/browser check is claimed.


## Dashboard navigation polish
- Updated the existing admin sidebar to use Bangla-first/bilingual labels and added a direct route back to the public homepage.
- Existing admin routes and authorization guard remain unchanged.
- This change and the Work Desk quick-start shell were pushed after successful CI run `45399848542`; both require a fresh CI result. No production deploy or local device verification is claimed.
