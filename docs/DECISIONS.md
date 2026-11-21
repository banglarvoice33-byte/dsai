# DSAI Engineering Decisions

## 2026-11-21 — DSAI-UX-ACK-001: keep customer acknowledgment disabled until live acceptance

- **Context:** The current Lead Composer already supports Bengali-first market, industry, stage, goal, tone and channel options, AI draft generation, local drafts, Excel export and owner-scoped CRM records. The Work Desk already supports durable text tasks and clean-file-gated TXT/CSV/JSON extraction. PDF/DOCX/XLSX/image OCR is not implemented. The repository did not contain a complete one-time customer acknowledgment flow.
- **Options:** treat CRM contact-consent as contract acknowledgment (rejected: it does not bind a customer to a specific immutable document); add a provider-based legal e-signature (rejected: no identity/signature provider is configured); implement a limited one-time document-receipt acknowledgment with a hashed bearer token and immutable text snapshot, while clearly disclaiming identity/legal signature.
- **Evidence:** Current implementation: `client/src/pages/LeadComposer.tsx`, `client/src/pages/Workspace.tsx`, `client/src/components/FileUploadPanel.tsx`, `client/src/components/WorkDeskTextPanel.tsx`, `server/routers.ts`, `server/workDeskTasks.ts`, and `server/workDeskTextTasks.ts`. Prior product decision selected customer acknowledgment, not identity-verified legal signature.
- **Decision:** Add a server-side acknowledgment ledger using a 256-bit random bearer token; persist only SHA-256(token); snapshot the exact user-entered title/body and persist SHA-256(snapshot); keep owner operations protected; expose recipient open/confirm only by the bearer token; enforce a 3-second minimum server-side from first view; make the acknowledgment transition atomic and one-time; retain append-only audit events; expire links after 7 days; cap creation at 20 per owner per UTC day. The customer supplies a name, but this is explicitly self-asserted. The link is manually shared and email ownership is not verified. This is not a legal e-signature.
- **Feature gate:** `CONTRACT_ACKNOWLEDGMENT_ENABLED=false` by default. Do not enable until the migration is applied to an independent staging database, owner isolation/replay/expiry/3-second negative tests pass, production privacy/legal wording is reviewed, and deployment is verified.
- **How to reverse:** keep the flag false; revert the UI/router/service commits and remove the migration only if it has not been applied. If applied, use a reviewed forward migration and preserve audit-retention obligations; do not manually delete evidence rows.

## 2026-11-21 — DSAI-UX-WORKDESK-002: make AI results reusable without claiming edits are persisted

- **Context:** Work Desk text task results were visible and copyable, but not editable or directly downloadable.
- **Decision:** Add in-session result editing plus copy and TXT download. Add TXT download for extracted file text. Explicitly state that edits are session-only and must be copied/downloaded; do not imply server persistence.
- **How to reverse:** revert the WorkDeskTextPanel/FileUploadPanel UI and corresponding regression assertions. No database migration is needed.


## 2026-11-21 — DSAI-SEC-ACK-003: start the recipient wait only after snapshot render

- **Context:** The first implementation recorded `first_viewed_at` while the recipient's initial API request was being processed. Network latency meant the three-second minimum could begin before the snapshot was actually displayed.
- **Options:** retain request-arrival timing (rejected: undercounts visible time); use only a browser timer (rejected: client clock is untrusted); split snapshot retrieval from a post-render `markViewed` call, with the database timestamp remaining authoritative (selected).
- **Decision:** `open` now reads the immutable snapshot without changing the timer. After React commits the snapshot to the recipient page, a `useEffect` calls the public token-only `markViewed` procedure. The server sets `first_viewed_at` once under a row lock; `confirm` still enforces `first_viewed_at <= now() - interval '3 seconds'` using PostgreSQL time. The browser countdown is advisory only.
- **How to reverse:** revert the `markViewed` procedure, service method, recipient effect and regression test together. Do not revert to request-arrival timing without changing the documented security boundary.


## 2026-11-21 — DSAI-SEC-CI-004: make RLS regression tests sensitive to policy removal

- **Context:** The first PostgreSQL negative test granted browser roles table privileges, but with no permissive policy a table with RLS enabled still defaults to deny. Removing only the restrictive browser-deny policy would therefore leave the test green.
- **Options:** keep default-deny only (rejected: false confidence); add a test-only permissive policy for browser roles so the production restrictive deny is required for the test to pass (selected).
- **Decision:** The disposable PostgreSQL CI test creates a permissive `USING (true) WITH CHECK (true)` policy after applying the migration. Anon/authenticated SELECT and INSERT must still be denied by the migration's restrictive policy. If that restrictive policy is removed, the existing negative assertions now fail.
- **How to reverse:** remove the test-only permissive policy only if the RLS regression test is replaced by an equally strong mutation-sensitive test. Never add this permissive policy to a deployed environment.


## 2026-11-21 — DSAI-SEC-DEP-005: remediate the verified dependency audit findings

- **Context:** CI #925 ran `pnpm audit --audit-level=low` against the current lockfile and reported 157 vulnerabilities: 17 low, 78 moderate, 56 high and 6 critical. Critical paths included Vitest 2.1.4, tinypool 1.1.1, proxy-addr 2.0.7 and fast-xml-parser 4.4.1; other high findings included Vite, tRPC, Axios, Zod, Rollup and xlsx 0.18.5.
- **Options:** suppress advisories (rejected); update direct packages to patched compatible releases, remove the vulnerable pnpm devDependency, replace the unpatched xlsx npm package with a versioned SheetJS CE republish, then let pnpm's audit fixer add only the necessary transitive overrides (selected).
- **Decision:** Update direct dependencies and packageManager to pnpm 10.34.9. Replace `xlsx@0.18.5` with the npm alias `@e965/xlsx@0.20.3`, which republishes the SheetJS 0.20.3 API under an independent publisher; this is a supply-chain tradeoff and must be verified by tests and license inventory. A lockfile-refresh workflow produces the resolved package.json/lockfile artifact without running lifecycle scripts. No advisory is ignored.
- **How to reverse:** revert the dependency and lockfile commit; if the xlsx republish fails compatibility or provenance review, revert only that alias and replace Excel export with a maintained alternative before enabling the release gate.


## 2026-11-21 — DSAI-SEC-DEP-006: apply audited pnpm overrides and commit lockfile

- **Context:** The first dependency audit found 157 advisories. Direct package upgrades and the xlsx compatibility alias were made; pnpm 10.34.9's `pnpm audit --fix` produced version-specific transitive overrides in `pnpm-workspace.yaml`.
- **Evidence:** Dependency lock refresh workflow #6 completed; `pnpm audit --json` returned exit 0 with 802 dependencies and zero advisories. The workflow ran lockfile-only resolution, without lifecycle scripts.
- **Decision:** Commit the generated `pnpm-workspace.yaml` and `pnpm-lock.yaml` together at `e170b14c40f8c58285ab03075de62fb2f3bd7010`. No advisory is ignored. Keep the full application CI as the acceptance gate.
- **How to reverse:** revert the workspace override and lockfile commit together with the direct dependency changes; do not delete overrides selectively without re-running `pnpm audit`.


## 2026-11-21 — DSAI-SEC-DEP-007: keep patched Express transitive APIs compatible

- **Context:** The automated audit fixer chose the latest version satisfying a lower-bound override. For Express 4, `path-to-regexp@>=0.1.13` resolved to v9, whose API is incompatible with Express 4's function export. Docker smoke reproduced `TypeError: pathRegexp is not a function`.
- **Options:** keep unbounded lower-bound overrides (rejected: cross-major API break); pin the patched compatible Express 4 dependency to `path-to-regexp@0.1.13` and `body-parser@1.20.9` (selected).
- **Decision:** Scope version-specific overrides to exact compatible releases, keep direct dependency declarations exact, and update the Docker build's pnpm to 10.34.9. Update first-party Actions to Node 24 releases.
- **How to reverse:** revert the two overrides and Docker/tooling updates together; never restore unbounded `>=` overrides for pre-1.0 APIs.


## 2026-11-21 — DSAI-ACK-SEC-008: never disclose expired snapshots

- **Context:** Final diff review found the public `open` endpoint returned the immutable document snapshot even when it marked the token expired. The page also retained a prior token's state during route changes.
- **Decision:** Return only `status: expired` for expired, unacknowledged links; clear snapshot state on expiry and reset all recipient state when the bearer token changes. Use PostgreSQL time for the three-second decision, return the actual acknowledged name, and enforce immutable first-view/confirmation state in the database trigger.
- **How to reverse:** do not restore snapshot disclosure after expiry. Any expiry grace period must be a separate, explicit product/security decision with a test and retention policy.
