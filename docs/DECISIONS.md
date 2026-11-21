

## 2026-11-21 — DSAI-ENG-008: treat current PR CI run #880 as partial until every required step finishes

- **Context:** A fresh connected-account inspection confirms PR #105 is still open and draft at head `97744c2268d7778bd8cad3f723bc07a4eafdd54e`. Workflow run #880 is active on that commit. Dependency installation, TypeScript, Supabase Edge Function checks, free-image policy tests, accessibility, stub audit, unit tests and production build have succeeded; browser acceptance is still running and scanner/ClamAV/Compose/evidence steps are pending.
- **Options considered:** treat completed core checks as full CI; rerun the earlier cancelled workflow; wait for the current run and assess every required step on its exact head.
- **Evidence:** [PR #105](https://github.com/banglarvoice33-byte/dsai/pull/105), [workflow run #880](https://github.com/banglarvoice33-byte/dsai/actions/runs/44853309269), [CI workflow definition](../.github/workflows/ci.yml).
- **Decision:** Keep PR #105 in draft and do not merge/deploy. Run #880 is IN_PROGRESS, not a pass. The connected Vercel project metadata says the latest deployment is READY on production target, but this does not establish that this PR is deployed or that production smoke/security-header tests passed. Supabase exposes only one project in the connected inventory, so staging parity remains unverified.
- **How to reverse:** Update this decision only after run #880 (or a later run on the current head) completes with successful required browser, scanner, real ClamAV and Compose steps and its evidence is inspected. Production acceptance requires separate exact-commit deployment, URL, headers, auth, rollback and database evidence.


## 2026-11-21 — DSAI-ENG-009: run #880 cancellation and latest-head CI gate

- **Context:** After four documentation commits advanced PR #105 to `248dbba843e24ccef35ef3c7118b8fdf1afe21ed`, the earlier run #880 was observed cancelled. Its browser step was cancelled and scanner/ClamAV/Compose steps skipped. A PR-run lookup for the new exact head returned no workflow runs.
- **Options considered:** rerun the cancelled job on its old commit; claim the successful core steps as a complete pass; wait for a workflow on the current head and keep the PR draft.
- **Evidence:** [PR #105](https://github.com/banglarvoice33-byte/dsai/pull/105), [run #880](https://github.com/banglarvoice33-byte/dsai/actions/runs/44853309269), current head `248dbba843e24ccef35ef3c7118b8fdf1afe21ed`.
- **Decision:** Run #880 is CANCELLED, not green. Do not rerun its old commit as a substitute for testing the current head. Keep PR #105 draft and unmerged until a complete run for the current head is available.
- **How to reverse:** Verify a new workflow run's head SHA matches the current PR head and all required browser, scanner, ClamAV and Compose checks succeed.


## 2026-11-21 — DSAI-ENG-010: accept CI only for the exact tested SHA; schedule Node LTS security patch

- **Context:** PR CI run #886 completed successfully on `3fcb33e831c65175d3fc36a14fe4ec9799883c50`, including browser, scanner gateway, real ClamAV clean/EICAR/invalid-auth/outage, Docker Compose readiness, unit tests and production build. The repository baseline pins Node 24.22.2, while the official Node release feed shows Node 24.22.3 as a later LTS security release dated 2026-11-11 with multiple High CVEs.
- **Options considered:** treat CI success as permanent for later commits; update the runtime pin in the same documentation change; record the exact-SHA CI result and make a separate focused Node security update with its own full CI.
- **Evidence:** [CI run #886](https://github.com/banglarvoice33-byte/dsai/actions/runs/44853633216), [Node.js v24.22.3 security release](https://github.com/nodejs/node/releases/tag/v24.22.3), [Node.js v24.22.2 release](https://nodejs.org/en/blog/release/v24.22.2).
- **Decision:** Run #886 is PASS for its exact tested SHA only. Do not claim a later commit is tested by it. Keep the runtime-pin change separate and update all Node references coherently to the supported security patch after confirming compatibility; do not modify package lockfiles for a Node-only patch. No runtime change is made in this baseline PR.
- **How to reverse:** If compatibility testing disproves Node 24.22.3, document the specific failing test and select the newest vendor-supported patched Node 24 release, never silently roll back to a known vulnerable patch.


## 2026-11-21 — DSAI-ENG-011: keep baseline PR draft; prioritize patched Vite and Node pins

- Context: Connected GitHub recheck confirms PR #105 is open/draft at head 4bb151f97a47c058b215fa51d7713aa542b2c2ed and workflow run #889 succeeded on that exact head. Main still pins Vite 7.1.7 and Node 24.22.2. A new Vite Critical advisory published 2026-11-10 affects 7.0.0–7.3.7 and is fixed in 7.3.8; official Node 24.22.3 is a later security release.
- Options considered: merge the docs-only baseline PR and defer vulnerabilities; fold runtime/dependency changes into this PR without local toolchain; keep baseline PR draft and implement focused security updates on a trusted toolchain with regression tests.
- Evidence: PR #105 https://github.com/banglarvoice33-byte/dsai/pull/105, CI run #889 https://github.com/banglarvoice33-byte/dsai/actions/runs/44854731975, Vite GHSA-p4f5-76q4-ffq7 https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7, Node.js 24.22.3 https://nodejs.org/en/blog/release/v24.22.3, Node.js security releases https://nodejs.org/en/blog/vulnerability/november-2026-security-releases.
- Decision: Keep PR #105 draft and unmerged. Record Vite 7.1.7 as in the affected range and Node 24.22.2 as behind the current 24.x security release. Make a separate focused dependency/runtime patch after obtaining a trusted Node/pnpm environment; update all runtime pins consistently, regenerate the lockfile using the declared package-manager policy, add targeted regressions, and require a new full CI run. Do not claim production exploitability without verifying network exposure; do not treat production Vercel deployment metadata as evidence that the PR is deployed.
- How to reverse: Revisit only with vendor advisory evidence showing the installed version is not affected, or a tested patched version that fails compatibility. Never revert to a version inside the affected range without a documented risk acceptance.


## 2026-11-21 — DSAI-ENG-012: retain existing baseline PR and accept only exact-head CI evidence

- **Context:** Live GitHub API inspection found the requested branch and PR already exist. PR #105 is open/draft at head `591e86da68d565b08792e100d6611fb4bc2e424b`; run #892 completed successfully on that exact SHA. The source paths named in the user's instructions are absent from the actual root-level Vite/React/Express repository layout.
- **Options considered:** create duplicate branch/PR; alter application files despite the missing requested paths; retain the existing documentation-only PR, append the verified checkpoint, and defer local baseline/security edits until a trusted checkout exists.
- **Evidence:** [PR #105](https://github.com/banglarvoice33-byte/dsai/pull/105), [CI run #892](https://github.com/banglarvoice33-byte/dsai/actions/runs/44856027211), [main README](https://github.com/banglarvoice33-byte/dsai/blob/main/README.md), [main package.json](https://github.com/banglarvoice33-byte/dsai/blob/main/package.json).
- **Decision:** Keep PR #105 as the single baseline PR; do not create another branch or PR. Preserve the application and production environment. Treat run #892 as successful only for its exact head. Keep local baseline blocked until clone/network and pinned toolchain are available. Do not invent missing architecture/blueprint files or assume the apps/web layout.
- **How to reverse:** If the existing PR is closed or the branch changes unexpectedly, re-read refs and PR state before creating anything. Close the local baseline blocker only after a trusted checkout, matching supported Node/pnpm versions, and real local command results are recorded.


## 2026-11-21 — DSAI-ENG-013: record exact-head CI success without promoting blocked local/security gates

- **Context:** Rechecked GitHub identity, repository, current branch and PR. PR #105 remains open/draft at `c49a70167a5185f93a8280cc2c64c796489985de`; run #893 completed SUCCESS on that exact commit. A fresh local shell attempt again found no checkout, Node v22.16.0 and no pnpm. The complete root manifest/workflow show no secret-scan, dependency-audit, or license-check job. Vite 7.1.7 is in the maintainer advisory's affected range; Node 24.22.3 is listed in the official v24 archive after the repository's 24.22.2 pin.
- **Options considered:** treat remote CI as full acceptance; change dependencies without a trusted install/lockfile toolchain; keep the PR draft, record current evidence, and defer dependency/runtime changes until they can be installed and tested coherently.
- **Evidence:** [PR #105](https://github.com/banglarvoice33-byte/dsai/pull/105), [run #893](https://github.com/banglarvoice33-byte/dsai/actions/runs/44856892785), [Vite maintainer advisory GHSA-p4f5-76q4-ffq7](https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7), [official Node v24 archive](https://nodejs.org/en/download/archive/v24/), and the live root `.github/workflows/ci.yml`.
- **Decision:** Keep PR #105 OPEN + DRAFT. Accept run #893 only for `c49a70167a5185f93a8280cc2c64c796489985de`. Do not claim local checks, advisory clearance, supply-chain scanning, production acceptance, or RLS isolation. Do not change Vite/Node or the lockfile in this environment. Next security patch must align Vite to at least 7.3.8 and Node to a currently supported patched v24 release, reconcile the pnpm version policy, regenerate the lockfile with the matching toolchain, add regression checks, and require complete CI on the new exact SHA.
- **How to reverse:** Re-evaluate only against newer vendor advisories/releases and a trusted environment. If the patched Vite line is incompatible, select a supported patched line and document the evidence; never restore an affected version without explicit risk acceptance.


## 2026-11-21 — DSAI-ENG-014: do not mutate dependencies without a trusted checkout/toolchain

- **Context:** At 08:47 Asia/Dhaka, no repository checkout was present; Git commands failed (128), Node was v22.16.0, pnpm was absent (127), GitHub clone failed DNS (128), and production URL probes failed DNS (curl 6). Read-only GitHub/Supabase/Vercel APIs remained available.
- **Options:** install or upgrade tools without repository/network access; mutate manifests/lockfile remotely without a trusted install; preserve the branch and record blockers while completing read-only checks.
- **Evidence:** PR #105 https://github.com/banglarvoice33-byte/dsai/pull/105; PR CI run #893 https://github.com/banglarvoice33-byte/dsai/actions/runs/44856892785 succeeded only on SHA `c49a70167a5185f93a8280cc2c64c796489985de`; Vite advisory https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7; Node release https://nodejs.org/en/blog/vulnerability/november-2026-security-releases.
- **Decision:** Keep PR #105 draft. Do not change dependencies, lockfile, production, or database. Treat Vite 7.1.7 and Node 24.22.2 as urgent maintenance findings. Supabase organization is Free and only one production project/default branch is visible; do not claim independent staging or Pro-only leaked-password protection. No live two-user RLS test was run.
- **Reverse:** obtain trusted checkout and compatible Node/pnpm; patch Vite to at least 7.3.8 and Node to the current patched 24.x, regenerate lockfile, add regression tests, and require full CI on the exact new SHA. Close production gates only with HTTP/header/auth/scanner/rollback evidence.