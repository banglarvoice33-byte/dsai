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
