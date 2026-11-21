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
- **Decision:** Treat that run as infrastructure-blocked. A later run #874 has since allocated a runner and is executing actual workflow steps; its final result must be assessed independently.
- **How to reverse:** No reversal needed; preserve this historical evidence and update only after run #874 completes.

## 2026-11-21 — DSAI-ENG-005: do not silently reconcile conflicting pnpm pins

- **Context:** Root `package.json` declares `packageManager: pnpm@10.4.1` and `devDependencies.pnpm: 10.15.1`; `pnpm-lock.yaml` uses lockfile format 9.0.
- **Options considered:** arbitrarily update one version; remove the devDependency; preserve the current declarations and test the actual install/setup path before changing either.
- **Evidence:** root [package.json](../package.json), [pnpm lockfile](../pnpm-lock.yaml), [pnpm CLI documentation](https://pnpm.io/pnpm-cli).
- **Decision:** Preserve the declarations during baseline capture. Verify which pin is intended and whether CI setup uses the `packageManager` field before making a one-purpose change.
- **How to reverse:** After a successful frozen install on Node 24.22.2, select one authoritative pnpm version, update manifest/lockfile/workflow consistently, and prove CI uses that exact version.

## 2026-11-21 — DSAI-ENG-006: record observed local runtime failures and Supabase Auth warning

- **Context:** The available container is not a repository checkout (`/`); local Git commands exited 128. Node is `v22.16.0`, below the repository's `24.22.2` pin. pnpm is missing; `pnpm -v`, install, typecheck, lint, test, build and secret-scan commands exited 127. The connected Supabase project is ACTIVE_HEALTHY, but its security advisor reports leaked-password protection disabled.
- **Options considered:** claim remote CI as a substitute; modify toolchain pins to fit this container; disable security controls; record exact local failures and preserve the existing security boundary until owner-controlled settings and a proper checkout are available.
- **Evidence:** [updated baseline report](BASELINE.md); [Supabase password security documentation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection); PR CI run [#874](https://github.com/banglarvoice33-byte/dsai/actions/runs/44852782930).
- **Decision:** Record the local environment as BLOCKED, do not modify dependency pins or lockfile, do not change Auth settings from this baseline phase, and keep the leaked-password protection gate open. Treat PR CI #874 as in progress at observation time, not green.
- **How to reverse:** Use a trusted checkout with Node 24.22.2 and an owner-approved pnpm pin; rerun the matrix. The project owner must enable leaked-password protection in Supabase Auth and provide a successful compromised-password rejection test before closing that gate.
