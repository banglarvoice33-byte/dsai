# Supplied DSAI v4.0 Script — Compatibility and Safety Audit

**Audit status:** Rejected for direct execution; selected architectural ideas may be reused only through controlled adapters.  
**Input:** User-supplied `DSAI v4.0 — Final Production Deploy` Bash script.  
**Scope:** Syntax, data integrity, architecture compatibility, security, deployment safety, media execution, and migration risk.

## Executive decision

এই script-টি বর্তমান DSAI project-এর replacement বা deployment script হিসেবে ব্যবহার করা যাবে না। এটি existing project directory-কে update না করে নতুন `dsai-final` directory তৈরি করে একটি ভিন্ন React 18 + tRPC 10 + SQLite + PM2 stack লিখতে চায়। এতে current DSAI-এর React 19, tRPC 11, Express/core runtime, Drizzle/MySQL schema, Manus OAuth, governance surfaces, scholarship controls, provider-gated Creative Studio, environment contract, and credential-free release workflow হারিয়ে যাওয়ার ঝুঁকি আছে। এটি সরাসরি চালালে migration নয়, কার্যত parallel unverified project তৈরি হবে।

## Findings

| Category | Evidence in supplied script | Risk | Decision |
|---|---|---|---|
| Destructive project divergence | `DIR="dsai-final"`, then writes a new `package.json`, `src`, `server`, and `data` tree | Existing DSAI routes, schema, auth, governance, and release contract are bypassed | Reject direct execution |
| Stack drift | React 18, tRPC 10, Tailwind 3, SQLite/`better-sqlite3`, PM2; current DSAI uses React 19, tRPC 11, Tailwind 4, Drizzle/MySQL and supervised release tooling | Type/API/schema incompatibility and duplicated operational model | Do not merge as a replacement |
| Syntax error | The visible JSX contains `<{mode==="i2v"&&<input ...`, which is invalid JSX syntax | Build failure | Reject until independently rewritten and tested |
| Likely heredoc corruption | The supplied pasted content shows `EOF'75 import Database...` around the backend section | Generated source may be syntactically invalid or altered during copy/paste | Never execute the pasted script |
| Authentication weakness | The supplied `AuthLogin` uses an email mutation and navigates to workspace; no demonstrated OAuth state, passwordless verification, CAPTCHA, or session security | Account takeover and false authentication boundary | Reject auth implementation |
| Fake/demo data | Admin dashboard renders a hardcoded `১২০` user count and “সক্রিয়” status | Misleading production claims and governance failure | Must not import |
| Media execution gap | Video UI calls `trpc.video.create/status`, but no verified current DSAI-compatible provider adapter, durable job schema, webhook verification, storage lifecycle, moderation, quota ledger, or idempotency is shown | Unbounded cost, lost jobs, unsafe outputs, and false live-generation promise | Reuse only the concept of async job UX |
| Secret and dependency risk | Installs Node from a remote shell script and globally installs PM2; dependency versions are unpinned ranges | Supply-chain drift and irreproducible deployment | Do not run in production |
| Data integrity | Creates local SQLite `dsai.db` under `data/` | Splits production data from the existing MySQL/TiDB contract and complicates backup/restore | Reject database layer |
| Process supervision | PM2 is installed and started without an existing service contract, log policy, rollback, or port ownership reconciliation | Duplicate process/port conflicts and unclear restart behavior | Use existing systemd handoff instead |
| Privacy and retention | No demonstrated S3/object lifecycle, deletion propagation, malware scan, or source-rights workflow | Uncontrolled user/media data retention | Reject upload/media implementation |
| Legal/operational claims | “Final Production Deploy” label is not evidence of provider, OAuth, payment, DNS, TLS, or security verification | Overstatement of readiness | Treat as unverified input only |

## What is potentially useful

The supplied script contains a few ideas that can be considered without importing its code. A dedicated Video Studio route, a visible queued/processing/succeeded/failed state model, bounded polling, and a user-facing output player are reasonable product patterns. They should be implemented on top of the current DSAI Creative Studio contract, not through the script’s tRPC 10, SQLite, or passwordless email design.

A safe DSAI media implementation needs a durable provider-neutral job record, idempotency key, provider job ID, lease and retry state, signed webhook or bounded polling, private object-storage output, moderation verdict, quota/cost ledger, cancellation, deletion, and clear AI-generated disclosure. These requirements are documented in [DSAI_TRUE_LIVE_MEDIA_AND_PRODUCTION_PLAN_BN.md](./DSAI_TRUE_LIVE_MEDIA_AND_PRODUCTION_PLAN_BN.md) and [DSAI_MEDIA_PROVIDER_RESEARCH_2026-08.md](./DSAI_MEDIA_PROVIDER_RESEARCH_2026-08.md).

## Safe integration decision

No file from the supplied script should be copied over the current DSAI source tree, no dependency replacement should be performed, no SQLite database should be introduced, and no PM2 process should be started from it. The safe next step is an adapter-level design review: compare any genuinely useful component against the current route, router, schema, auth, storage, and test contracts; rewrite it natively; add tests; run typecheck/build/accessibility; and only then save a checkpoint.

The correct current classification remains **DSAI Controlled Alpha / production-ready foundation**. The supplied v4.0 script does not upgrade that classification and cannot make real audio/video generation live without provider credentials, durable jobs, storage, moderation, quotas, and external production verification.

## Verification boundaries

This audit is based on static inspection of the user-supplied text and the current DSAI repository. The supplied script was not executed. No external credentials were used, no remote VPS command was run, and no provider side effect was created.


## Latest validated handoff

The credential-free release was refreshed after adding the non-mutating remote production-gate report. The ZIP SHA-256 is `455319d9b7efb70c2d7cf113431161c7fde8c620739601a37e69f6ad7cf108c1`; the self-extracting `.run` file embeds that same ZIP payload hash and has standalone SHA-256 `a594c39d7c0557f96bb888e8a7b4b050086847c5a9b78695636e0841d73fb626`. The refreshed archive includes `scripts/remote-production-gate-report.sh` and this compatibility audit. Final validation passed with 39 test files/118 tests, TypeScript, production build, the authoritative accessibility contract, shell syntax, and document checks. The existing large shared JavaScript chunk warning remains a performance optimization item, not a build failure.
