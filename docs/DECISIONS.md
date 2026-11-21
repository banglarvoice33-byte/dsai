

## 2026-11-21 — DSAI-ENG-008: treat current PR CI run #880 as partial until every required step finishes

- **Context:** A fresh connected-account inspection confirms PR #105 is still open and draft at head `97744c2268d7778bd8cad3f723bc07a4eafdd54e`. Workflow run #880 is active on that commit. Dependency installation, TypeScript, Supabase Edge Function checks, free-image policy tests, accessibility, stub audit, unit tests and production build have succeeded; browser acceptance is still running and scanner/ClamAV/Compose/evidence steps are pending.
- **Options considered:** treat completed core checks as full CI; rerun the earlier cancelled workflow; wait for the current run and assess every required step on its exact head.
- **Evidence:** [PR #105](https://github.com/banglarvoice33-byte/dsai/pull/105), [workflow run #880](https://github.com/banglarvoice33-byte/dsai/actions/runs/44853309269), [CI workflow definition](../.github/workflows/ci.yml).
- **Decision:** Keep PR #105 in draft and do not merge/deploy. Run #880 is IN_PROGRESS, not a pass. The connected Vercel project metadata says the latest deployment is READY on production target, but this does not establish that this PR is deployed or that production smoke/security-header tests passed. Supabase exposes only one project in the connected inventory, so staging parity remains unverified.
- **How to reverse:** Update this decision only after run #880 (or a later run on the current head) completes with successful required browser, scanner, real ClamAV and Compose steps and its evidence is inspected. Production acceptance requires separate exact-commit deployment, URL, headers, auth, rollback and database evidence.
