# DSAI Monorepo Audit Checklist — Adapted to the Current Repository

**Audit date:** 2026-10-06  
**Scope:** User-supplied 8-section architecture checklist, adapted to the actual DSAI repository.  
**Product scope:** Bengali-first AI Workdesk, multilingual lead composer, Creative Studio planning, admin/evidence surfaces, Android user wrapper, and deployment foundation. **Newspaper/newsroom functionality is intentionally excluded.**

## Executive decision

**Result: PASS for the adapted project-side controlled-alpha checklist; NOT a PASS for the supplied Next.js/Supabase/Expo architecture.**

The current repository is a working **React 19 + Vite + Express + tRPC 11 + Drizzle ORM + MySQL/TiDB** application. It is not a Next.js 14 monorepo, does not contain `apps/`, does not use Supabase migrations, and does not use Expo as its Android build system. Those are architecture differences, not hidden failures. The correct conclusion is:

> DSAI is a Bengali-first **Controlled Alpha / release-ready foundation** with project-side validation complete. Public production launch still requires operator-controlled VPS, database, DNS/TLS, OAuth, provider, backup/restore, Play signing, and physical-device evidence.

### Status vocabulary

- **PASS** — directly evidenced in source, automated validation, or controlled preview.
- **PARTIAL** — a safe foundation or UI contract exists, but the complete production capability is not proven.
- **FAIL** — the supplied requirement conflicts with or is absent from the current architecture; migration is required.
- **N/A** — intentionally outside DSAI scope, especially newspaper/newsroom features.
- **EXTERNAL GATE** — cannot be truthfully verified from this sandbox or without operator-controlled credentials/environment.

---

## Section 1 — Repository and architecture / রিপোজিটরি ও আর্কিটেকচার

| Checklist item | Status | Evidence / finding | Action |
|---|---|---|---|
| `apps/` + `packages/` monorepo structure | **FAIL against supplied plan; PASS as current app** | Current tree uses `client/`, `server/`, `shared/`, `drizzle/`, and `android/`; no `apps/` or `packages/` | Do not claim the supplied monorepo exists. Migrate only as a separate architecture phase. |
| Next.js 14 | **FAIL against supplied plan** | `package.json` uses Vite 7, React 19, Express 4; no Next dependency | Keep Vite/Express unless SSR is a deliberate future migration. |
| Supabase migrations | **FAIL against supplied plan** | Drizzle migrations and MySQL/TiDB contract are present; no Supabase directory | Do not run Supabase commands against this project. |
| Node/package reproducibility | **PASS** | `.nvmrc`, exact dependency declarations, frozen-lockfile verifier | Run `pnpm install --frozen-lockfile` in CI/VM. |
| Deployment files | **PASS** | Node 20 Alpine Dockerfile, Compose, README, `.dockerignore`, verifier, health routes | Execute Docker build on a Docker-enabled VM; sandbox could not run Docker. |
| Secret separation | **PASS** | Populated dotenv/key/keystore files are absent; production contract uses external `/etc/dsai/dsai.env` or protected operator env | Never put real secrets in Git, ZIP, Dockerfile, evidence console, or chat. |
| Repository hygiene | **PASS** | `.gitignore` excludes populated `.env*`, build output, logs, DB files, keys and runtime artifacts; only safe `.env.production.example` is allowed | Keep the allowlist narrow and review new exceptions. |

**Section result:** **PASS for current architecture; FAIL only if the supplied Next/Supabase monorepo claim is required literally.**

---

## Section 2 — Design system / ডিজাইন সিস্টেম

| Checklist item | Status | Evidence / finding | Action |
|---|---|---|---|
| Bengali-first interface | **PASS** | Bengali-first copy, bilingual navigation, Bengali lead preview, localized market workflow | Continue language-quality review by market. |
| Tactile Kinetic UI | **PASS** | CSS texture, kinetic typography, lightweight depth, hover/focus micro-interactions, responsive behavior, reduced-motion safeguards documented and preview-checked | Keep motion purposeful and accessible. |
| Supplied newsroom palette/fonts/icon set | **PARTIAL** | Some visual principles are adapted, but the supplied newsroom-specific design system is not an exact implementation | Treat supplied tokens as reference, not proof of a matching Figma system. |
| Semantic HTML and accessibility | **PASS** | Accessibility contract and regression checks pass; keyboard/focus and reduced-motion safeguards exist | Re-run on the final public domain and physical devices. |
| Dark mode and responsive dashboard | **PASS** | Dashboard sidebar, desktop icon-only state, mobile drawer, route preservation and keyboard shortcut are implemented and preview-checked | Add field performance measurements before public scale. |

**Section result:** **PASS for DSAI’s adapted design system; not an exact supplied newsroom design-system implementation.**

---

## Section 3 — Sitemap, routes, and critical frames / সাইটম্যাপ ও ফ্রেম

| Checklist item | Status | Evidence / finding | Action |
|---|---|---|---|
| Supplied 24-page sitemap | **FAIL as literal match** | Current routes serve Workdesk, lead composer, Creative Studio, admin/evidence and auth boundaries; they are not 24 newsroom pages | Do not report 24 pages as implemented. |
| Core user routes | **PASS** | Homepage, `/lead-composer`, `/creative-studio`, user-only Android route boundary | Test final-domain navigation and deep links. |
| Admin route and identity boundary | **PASS** | `/admin` is auth-gated; dashboard navigation and evidence surface exist | Require authenticated admin-role evidence for privileged actions. |
| Lead composer frame | **PASS** | 40/40 markets, search/filter, loading state, business context, consent, live preview and Excel export | Add server workspace persistence and CRM handoff. |
| Creative Studio frame | **PARTIAL** | Three planning modes, brief, variation, rights/safety declarations and provider-gated plan exist | Do not call a plan a generated image/video. |
| Newsroom/live hub/article/editor frames | **N/A** | Newspaper/newsroom features are explicitly excluded from DSAI scope | Keep them out of product claims and launch checklist. |

**Section result:** **PASS for the DSAI route set; N/A for excluded newsroom frames.**

---

## Section 4 — Database schema and API / ডেটাবেস ও API

| Checklist item | Status | Evidence / finding | Action |
|---|---|---|---|
| Supplied 13-table schema | **FAIL as literal match** | Current Drizzle schema models users, access, connectors, files, creative, scholarship, traces, gates, OAuth, lifecycle and billing-related concerns differently | Use current schema as source of truth; perform a planned migration before adopting another schema. |
| Drizzle/MySQL/TiDB contract | **PASS** | Drizzle ORM, `mysql2`, migrations and `db:push` contract are present | Verify migrations and latency on target database. |
| tRPC typed API | **PASS** | tRPC 11 server/client contract and route tests are present | Preserve typed procedures; avoid ad-hoc REST duplication. |
| `/health` and `/healthz` | **PASS** | Liveness endpoints are implemented and tested | Verify through Nginx/public TLS. |
| `/readyz` database probe | **PASS project-side; EXTERNAL GATE remotely** | Non-mutating `SELECT 1` readiness probe and regression coverage exist | Verify with real production DB credentials and migration state. |
| Workspace persistence, search, versioning, multi-device sync | **PARTIAL** | Local saved lead-draft library with restore/delete is implemented; server-side encrypted workspace foundation exists but is fail-closed pending a re-verified 32-byte key | Enable only with operator-managed key validation, ownership, deletion and migration tests. |
| Encryption | **PARTIAL / FAIL-CLOSED** | AES-256-GCM foundation exists; key is intentionally not accepted until validation is re-verified | Do not bypass validation or use a weak/generated production key. |

**Section result:** **PASS for current database/API contract; workspace persistence remains PARTIAL by design.**

---

## Section 5 — Core product capabilities / মূল ফিচার

| Capability | Status | Safe claim |
|---|---|---|
| Bengali-first AI Workdesk | **PASS** | Controlled-alpha workdesk with structured, reviewable workflows |
| 40-market multilingual lead composer | **PASS** | Any-language brief, market context, localized preview, consent/no-send boundary, Excel export |
| Saved draft library | **PASS** | Privacy-safe local storage with restore/delete; no cloud sync claim |
| Creative Studio | **PARTIAL** | Provider-ready planning and safety contract; no live rendering claim |
| Access/government/healthcare/legal workflows | **PASS / FOUNDATION** | Structured guidance and human-review workflow; not official submission automation |
| Agent trace/audit surfaces | **PASS** | Trace, step status, evidence and approval metadata |
| File upload/malware scanning | **PARTIAL / FAIL-CLOSED** | Security/lifecycle foundation; upload remains gated without configured scanner/storage adapter |
| Audio/video generation | **EXTERNAL GATE / NOT LIVE** | Planning/provider boundary only; no production output, quota or billing evidence |
| CRM/calendar/messaging | **EXTERNAL GATE / READ-ONLY PILOT** | Discovery/simulation and consent-aware design; no live send/create/invite/book claim |
| Payments | **DISABLED READINESS** | Policy/readiness console only; no live settlement or revenue claim |

**Section result:** **Core value loop is implemented at controlled-alpha level; live providers and outbound actions remain gated.**

---

## Section 6 — Workspace, CRM handoff, glossary, and quality benchmarks / ওয়ার্কস্পেস, CRM, ভাষা ও মান

| Workstream | Status | Current state | Next measurable gate |
|---|---|---|---|
| User-owned workspace | **PARTIAL** | Local drafts plus server encryption foundation | 10 ownership/restore/delete workflows pass with a verified key |
| Search/versioning/sync | **PARTIAL** | Not equivalent to ChatGPT Projects/Notion persistent workspace yet | Add encrypted metadata search, version history, conflict policy and multi-device tests |
| CRM/Sheets handoff | **PARTIAL / PLANNED** | Excel export and consent/no-send boundaries exist; live connector/write-back is not enabled | Implement preview → human approval → dedupe → export/write → audit → revoke/retry flow |
| Bengali glossary | **PARTIAL / ROADMAP** | Language-quality requirement documented; persistent glossary/terminology memory is not a complete live subsystem | Define per-market glossary, lock terms, transliteration and do/don’t rules |
| Correction feedback | **PARTIAL / ROADMAP** | Lead editing and review boundary exist; aggregate correction analytics are not production evidence | Store accepted/rejected edits with consent and publish denominator/sample/date |
| Lead-quality benchmark | **PARTIAL / ROADMAP** | Quality loop is specified; no fabricated conversion metrics are used | Benchmark terminology, consent, clarity, localization and edit distance on a named sample |
| Human approval and audit | **PASS foundation** | Preview-first, no-auto-send and evidence surfaces exist | Exercise authenticated approval, rollback, revoke and audit-log tests |

**Section result:** **High-value product direction is correct; the next implementation tranche is workspace + consent-aware handoff + measurable quality loop.**

---

## Section 7 — Production, security, and deployment / প্রোডাকশন ও নিরাপত্তা

| Gate | Status | Evidence / limitation |
|---|---|---|
| Fresh-VM Docker contract | **PASS BY CONTRACT** | Dockerfile/Compose/README/verifier are present; actual image build was not run because Docker is unavailable in this sandbox |
| Exact dependency versions | **PASS** | Verifier rejects range syntax; package declarations are pinned |
| External environment boundary | **PASS** | Production secrets remain outside source/release artifacts |
| Nginx reverse proxy | **EXTERNAL GATE** | Runbook exists; target VPS config and public route are not verified here |
| systemd/PM2 process supervision | **EXTERNAL GATE** | Operator handoff exists; remote service status is not evidence available in this sandbox |
| UFW/fail2ban/unattended upgrades | **EXTERNAL GATE** | Must be checked on the target VM; absence in sandbox does not prove VPS state |
| DNS/TLS/renewal | **EXTERNAL GATE** | Final public edge evidence required |
| OAuth final-domain click-through | **EXTERNAL GATE** | State/callback safeguards are project-side verified; real provider login is not |
| Backup/restore | **PARTIAL** | Contract/runbook exists; isolated restore drill, RPO/RTO and retention evidence are pending |
| Android wrapper | **PASS alpha / EXTERNAL release gate** | Debug-installable, user-only route boundary; production keystore, Play Console and physical-device evidence pending |
| Play release signing | **FAIL-CLOSED / EXTERNAL GATE** | No operator production keystore is present; unsigned/debug artifacts must not be labelled store-ready |
| Provider execution and billing | **EXTERNAL GATE** | Credentials, quota, storage, consent, webhook and reconciliation evidence required |

**Section result:** **Project-side production foundation PASS; public launch remains blocked by named external gates.**

---

## Section 8 — QA, observability, and release evidence / QA ও রিলিজ প্রমাণ

| Checklist item | Status | Evidence |
|---|---|---|
| TypeScript | **PASS** | `pnpm run check` passed in the latest validated checkpoints |
| Automated regression | **PASS** | Latest recorded full suite: 50 files / 154 tests; prior release verifier and feature suites also passed |
| Accessibility | **PASS** | `pnpm run check:a11y` passed and responsive/keyboard/reduced-motion checks are documented |
| Production build | **PASS** | `pnpm run build` passed; existing chunk-size warning is non-blocking but should be monitored |
| Credential-free release scan | **PASS** | No populated dotenv, private key, PEM, credentials JSON or production keystore in the repository/release artifact |
| Browser route preview | **PASS** | Homepage, lead composer, Creative Studio, admin boundary and health route were preview-verified |
| Lighthouse/PWA numeric score | **UNVERIFIED** | No final-domain field measurement; do not claim 94/100 |
| Real-user performance | **UNVERIFIED** | Requires target device/network and final edge |
| Remote observability/alerts | **EXTERNAL GATE** | Requires target VM/provider metrics and notification path |
| Backup restore drill | **EXTERNAL GATE** | Requires operator-owned storage and isolated restore evidence |

**Section result:** **PASS for repository QA; UNVERIFIED for real-world/remote measurements.**

---

## Final gap register and order of operations

### Must complete before public production claim

1. Verify the target VPS runtime, process supervision, Nginx, firewall, DNS and TLS.
2. Populate secrets only through protected external environment management; run migrations and verify `/readyz`.
3. Complete final-domain OAuth click-through and cookie/callback checks.
4. Run backup/restore drill with documented RPO/RTO and rollback.
5. Configure and test provider credentials, storage, quotas, consent, idempotency and audit logs.
6. Supply an operator-controlled Play upload keystore, produce a signed AAB/APK, record fingerprints, and test on a physical device.
7. Measure final-domain Lighthouse/PWA/performance results instead of reusing design-time targets.

### Highest-value next product tranche

1. Server-side encrypted workspace with verified 32-byte key, ownership, deletion and versioning.
2. Search/tags and multi-device sync with a clear conflict policy.
3. Consent-aware Sheets/CSV plus one CRM handoff: preview → approval → dedupe → write → audit → revoke.
4. Bengali glossary, market-specific terminology rules and correction feedback.
5. Quality benchmark report with sample size, evaluator method, model/provider, date, denominator and human-review outcome.

### Explicit non-claims

- Not a Next.js/Supabase/Expo monorepo.
- Not a newspaper/newsroom platform.
- Not live autonomous publishing or bulk messaging.
- Not live image/video generation merely because a planning UI exists.
- Not payment/revenue-ready merely because payment policy or UI exists.
- Not Play Store release-ready without the operator keystore and Play evidence.
- Not fully production-live until remote gates are independently verified.

## Final classification

**DSAI current state: Controlled Alpha — release-ready foundation.**  
**Project-side implementation and automated validation: PASS.**  
**Supplied architecture literal match: FAIL/NOT APPLICABLE in several areas because it describes a different product stack.**  
**Public production launch: BLOCKED only by explicitly listed external/operator gates, not by hidden repository defects found in this audit.**
