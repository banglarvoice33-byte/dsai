# Engineering decisions

This log records reversible implementation decisions for the DSAI repository. Entries are append-only; supersede an entry rather than silently rewriting its rationale.

## 2026-11-21 — DSAI-ENG-001: establish the baseline on the repository's actual architecture

- **Context:** The requested `docs/architecture.md`, `docs/blueprint-extract.md`, `apps/web/package.json`, `apps/web/src/lib/env.ts`, and `scripts/migrate.mjs` are absent from the current `main` tree. The repository README and package manifest identify a single-root Vite 7 + React 19 + Express 4 + tRPC + Drizzle application, not the requested apps/web monorepo layout.
- **Options considered:** (1) create placeholder copies of the missing files; (2) port assumptions from an older architecture; (3) record the mismatch and use the checked-in README, package manifest, current architecture audit, and source tree as the evidence baseline.
- **Evidence:** [README.md](../README.md), [package.json](../package.json), [supplied-architecture audit](DSAI_SUPPLIED_ARCHITECTURE_PREDEPLOYMENT_AUDIT_BN_2026-09-02.md), [main tree at dc849a8](https://github.com/banglarvoice33-byte/dsai/tree/dc849a831a5a3eed0b56a1b366236482e51e80d2).
- **Decision:** Option 3. Do not invent compatibility files or migrate architecture during baseline work. Mark the requested absent documents as a documentation/input gate. Use the real root scripts and lockfile.
- **How to reverse:** If the owner supplies the canonical architecture and blueprint files, add them in a separate reviewed commit and reconcile this entry with the supplied evidence.

## 2026-11-21 — DSAI-ENG-002: keep Phase 0/1 changes documentation-only

- **Context:** Baseline shell commands, local Git working-tree state, and the local toolchain cannot be truthfully reported from a GitHub API-only repository session. Current main CI run #871 is successful, but it is not equivalent to running the requested local baseline matrix.
- **Options considered:** claim CI as a local baseline; make code/config changes without a local baseline; record observed remote evidence and leave local-only checks explicitly unexecuted.
- **Evidence:** [CI run #871](https://github.com/banglarvoice33-byte/dsai/actions/runs/44768203560), [current main commit](https://github.com/banglarvoice33-byte/dsai/commit/dc849a831a5a3eed0b56a1b366236482e51e80d2), root [package.json](../package.json).
- **Decision:** Documentation-only Phase 0/1. No application code, dependency versions, secrets, Supabase migrations, or production settings changed. Do not equate GitHub CI success with a local shell command result.
- **How to reverse:** Once a trusted local checkout/terminal is available, run the full baseline matrix, update `docs/BASELINE.md`, and make any remediation in separate focused commits.

## 2026-11-21 — DSAI-ENG-003: preserve fail-closed authentication and file scanning boundaries

- **Context:** Recent merged authentication work explicitly retains mandatory Turnstile verification. Existing upload policy requires a configured scanner and independent clean-file verification.
- **Options considered:** relax controls to improve apparent availability; retain fail-closed behavior pending real production evidence.
- **Evidence:** [merged PR #104](https://github.com/banglarvoice33-byte/dsai/pull/104), [merged scanner-gate PR #69](https://github.com/banglarvoice33-byte/dsai/pull/69), [CI run #871](https://github.com/banglarvoice33-byte/dsai/actions/runs/44768203560).
- **Decision:** Keep authentication and malware-scanning controls fail-closed. Do not bypass CAPTCHA or accept unscanned files to make the UI appear functional.
- **How to reverse:** Only through a separately reviewed security design, documented threat analysis, negative tests, and verified provider-side configuration; never by deleting the control as a quick fix.
 

## 2026-11-21 — DSAI-ENG-004: treat PR CI runner allocation failure as infrastructure-blocked

- **Context:** Draft PR #105 triggered CI run #872. Both the initial attempt and the single rerun ended in failure before a runner was assigned; GitHub reported `runner_id: 0`, an empty steps array, and no downloadable job log.
- **Options considered:** alter application code or workflow commands without evidence; repeatedly rerun the same job; record the runner-allocation failure as an infrastructure blocker and avoid speculative code changes.
- **Evidence:** [CI run #872](https://github.com/banglarvoice33-byte/dsai/actions/runs/44852623330), [job details](https://github.com/banglarvoice33-byte/dsai/actions/runs/44852623330/job/136687419547).
- **Decision:** Treat PR CI as BLOCKED by runner allocation. No source-code change is justified by a job that did not execute a step. Do not mark the PR checks green.
- **How to reverse:** Once GitHub assigns a runner and the workflow executes, inspect actual step logs, fix any reproducible repository defect, and rerun the complete suite.
