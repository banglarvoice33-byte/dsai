# QA Record

## Repository evidence
- [x] package.json scripts and dependencies inspected.
- [x] Wouter route registration inspected; /workspace, /ai-hub, /documents and /admin retained.
- [x] Work Desk task and file upload flow inspected; merged PR #144 preserves queue, retry, cancellation, edits and quarantine integration.
- [x] AI Hub public catalog and connector setup allowlist inspected.
- [x] Vercel __path rewrites and cron configuration inspected; unchanged.
- [x] Existing production Vercel deployment is READY and production SPA shell responds on /, /ai-hub and /workspace.

## Feature branch changes
- [x] AI Hub visual/discovery refresh committed.
- [x] Bangla/Banglish task aliases and provider/category keyword search added.
- [x] Home bilingual navigation and search entry to AI Hub added.
- [x] Implementation records added.
- [ ] pnpm run check (not run; GitHub/Vercel CI pending).
- [ ] pnpm run test.
- [ ] pnpm run build.
- [ ] pnpm run check:a11y.
- [ ] pnpm run check:stubs.
- [ ] 320px/mobile/tablet/desktop, keyboard, zoom and light/dark/system browser tests.
- [ ] Authenticated Work Desk, upload/quarantine and provider connector smoke tests.
- [ ] Feature branch Preview READY and route verification.

No unchecked test or deployment gate is represented as passed.
