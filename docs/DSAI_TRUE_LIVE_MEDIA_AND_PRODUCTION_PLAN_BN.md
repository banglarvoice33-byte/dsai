# DSAI সত্যিকারের Live Media ও Production Activation Plan

**তারিখ:** ২০ আগস্ট ২০২৬  
**প্রস্তুতকারী:** Manus AI  
**শ্রেণি:** Controlled Alpha থেকে provider-backed production-এ উত্তরণের implementation plan

## Executive decision

DSAI-এর বর্তমান codebase একটি শক্তিশালী **Controlled Alpha foundation**: Bengali-first product surface, authentication shell, scholarship controls, Try First preview, Creative Studio planner, governance disclosures, environment validator, credential-free release packaging, VPS local runtime, Nginx/TLS handoff, and a substantial regression suite exist. কিন্তু audio/video/image generation এখনো সম্পূর্ণ live provider execution নয়। Creative Studio-এর output plan ইচ্ছাকৃতভাবে `provider-gated` এবং `output: null` রাখে। তাই বর্তমান release-কে “সব media feature live” বলা evidence-বিরোধী হবে।

সত্যিকারের production media activation সম্ভব, তবে তা এক ধাপে নয়। Provider credential, billing/quota, asynchronous job processing, object storage, moderation, source-rights, retention/deletion, rate limits, cost ledger, callback verification, monitoring, and operator rollback—এই gates বন্ধ না করে public generation চালু করা যাবে না।

## Current evidence and truth boundary

| Area | বর্তমান অবস্থা | প্রমাণ | সিদ্ধান্ত |
|---|---|---|---|
| Product shell | Implemented | React/Tailwind/tRPC routes and build | Controlled Alpha-ready |
| Text planning | Implemented locally | Try First deterministic preview and tests | Public low-risk preview possible |
| Image/video planning | Implemented | `server/creativePipeline.ts` | Preview only; provider-gated |
| Real media rendering | Not verified | Preview returns `output: null` | Not live |
| Audio/TTS | Not wired as a production output path | No durable audio job/output contract verified | Not live |
| File ingress | Schema foundation exists | `file_assets` has quarantine/scan/retention fields | Upload pipeline and scanner still require execution/provider wiring |
| Async jobs | Not production-complete | `creative_requests` has basic status only | Durable worker/retry/dead-letter required |
| VPS local runtime | Verified by supplied terminal evidence | corrected bundle passed checksum, build, health and `/auth/login=200` on port 3011 | Local upstream live; public edge still separate |
| Public domain | Not fully verified | Nginx/DNS/TLS/OAuth require VPS evidence | Public launch gate pending |

## Media architecture that should be implemented

The safe architecture is a modular monolith with one controlled media worker at first. A request enters through a protected tRPC procedure, receives a server-generated idempotency key, passes prompt/source-rights/safety/quota/cost checks, and creates a durable `media_job`. The worker claims the job with a lease, calls a typed provider adapter, records provider job identifiers without secrets, and moves the job through `queued`, `submitted`, `processing`, `moderation`, `ready`, `failed`, `expired`, or `cancelled`. Provider callbacks must verify signatures over the raw request body; where callbacks are unavailable, bounded polling with exponential backoff and a dead-letter state is required.

Completed bytes must be written to object storage, not MySQL. The database stores provider, job ID, object key, MIME type, byte size, checksum, retention expiry, moderation verdict, provenance, and deletion state. The user must see a clear AI-generated disclosure and provider-gated status. Source images require authorization confirmation, malware/MIME/size checks, and deletion propagation. Paid or scarce operations require a quota ledger and idempotency record before any provider call.

## Provider options

| Approach | Tradeoffs | Cost | Setup complexity |
|---|---|---:|---:|
| Managed provider adapter using a current video/audio API | Fastest path to real output; provider policy, billing, regional availability, API lifecycle, and quota become operational dependencies | Usage-based provider charges | Medium to high |
| Self-hosted GPU media stack | Maximum control and potentially predictable unit economics at scale; requires GPU, model licensing, safety stack, storage, observability, and 24/7 operations | High infrastructure and maintenance cost | Very high |
| Continue provider-gated preview until demand is measured | Safest and cheapest; no real output for users and weaker launch conversion | Low | Low |

**Recommended sequence:** begin with one managed provider adapter behind the existing provider-gated Creative Studio, retain a second adapter interface for portability, and do not purchase GPU infrastructure until field demand, output cost, latency, and policy requirements justify it.

## Audio and video provider implications

Official provider documentation confirms that modern video generation is asynchronous: create a job, receive an ID/status, poll or receive a webhook, then fetch the completed MP4. This directly requires durable job state, retries, callback verification, storage, and quota controls. Current provider documentation also describes video models with image-based direction and native audio, but DSAI must treat model IDs, availability, pricing, and lifecycle as configuration rather than permanent constants. The official TTS path supports request-based speech output, multiple formats and voices, and requires clear disclosure that the voice is AI-generated. Bengali quality must be field-tested rather than assumed from generic language support.

## Required secret and provider contract

The following names may be configured through the server-side secret manager or `/etc/dsai/dsai.env`; real values must never enter a ZIP, chat, manifest, frontend bundle, or shell history:

| Secret/config category | Required purpose | Activation gate |
|---|---|---|
| Media provider API credential | Submit image/video/audio jobs | Provider account, billing, quota, allowed region |
| Provider webhook signing secret | Verify callbacks | Raw-body signature and replay tests |
| Object storage configuration | Store outputs and source assets | Private bucket, lifecycle, deletion test |
| Malware scanner configuration | Quarantine and inspect uploads | Scanner availability and fail-closed policy |
| Public CAPTCHA values | Protect public auth and high-risk forms | Production fail-closed validation |
| OAuth callback/consent configuration | Login and account recovery | Exact final-domain callback allowlist |
| Payment merchant credentials | Paid plans and entitlement | Licensed gateway sandbox, callback, refund and idempotency tests |

## Implementation gates

**Gate 1 — Provider adapter and data model.** Add a typed adapter interface and durable media-job/idempotency/output records. Add provider-neutral statuses, cost estimates, retry ceilings, leases, dead-letter state, and cancellation. Apply schema changes through the project’s schema-first migration process.

**Gate 2 — Secure file and prompt ingress.** Complete MIME/size validation, quarantine, malware decision, source-rights acknowledgment, prompt safety checks, retention, deletion, and object-storage authorization. Do not accept public uploads before this gate passes.

**Gate 3 — Worker and callback reliability.** Run one supervised worker, implement callback signature verification or bounded polling, add replay protection, retry/backoff, circuit breaking, and operator replay/dead-letter controls. Never run provider calls directly in a browser request.

**Gate 4 — Cost, quota, and abuse controls.** Add per-user and per-plan quotas, provider-cost ledger, distributed rate limiting, idempotency, daily/monthly caps, and a kill switch. Keep real generation disabled until spend limits are tested.

**Gate 5 — Human review and disclosure.** Add AI-generated labels, source-rights confirmation, harmful-content handling, appeal/review metadata, provenance, and export/delete controls. Scholarship users must receive the same safety boundaries as paid users.

**Gate 6 — Production operations.** Run systemd supervision, Nginx/TLS, backup/restore drill, log rotation, alerting, uptime checks, database health checks, and rollback rehearsal. Verify the final domain externally from a device that is not the VPS.

## Acceptance criteria

A true production launch should not be declared until all of the following are evidenced: a real provider job creates a completed image, video, and audio output; output bytes are stored privately and retrieved through authorized URLs; duplicate submissions do not double-charge; provider failures retry and eventually enter dead-letter state; signed callbacks reject forged/replayed events; quotas and cost ledger stop overuse; source deletion removes associated objects; Bengali audio/video quality is reviewed on representative prompts; public CAPTCHA/auth/OAuth work on the final domain; payments remain disabled until licensed gateway tests pass; and rollback restores the previous release without losing database integrity.

## Immediate next actions

1. Keep public media rendering disabled and preserve the existing provider-gated preview while provider selection, billing, and credentials are finalized.
2. Select one managed media provider and obtain its production terms, API access, webhook support, rate limits, pricing, regions, and content-policy requirements.
3. Implement durable media jobs, idempotency, output metadata, worker supervision, callback/polling, storage lifecycle, and moderation before enabling any user-visible provider call.
4. Add audio/TTS as a separate adapter with AI-voice disclosure and Bengali quality evaluation; do not treat video-native audio as a substitute for a controlled TTS product path.
5. Close the VPS public edge gates: systemd status, UFW status, Nginx config test, DNS, TLS, external `/healthz` and `/auth/login`, OAuth callback, backup/restore, and rollback evidence.

## References

[1]: https://developers.openai.com/api/docs/guides/video-generation "OpenAI Video generation with Sora"
[2]: https://ai.google.dev/gemini-api/docs/video "Google Gemini API video generation and Veo"
[3]: https://developers.openai.com/api/docs/guides/text-to-speech "OpenAI Text to speech"
[4]: https://developers.openai.com/api/docs/guides/audio "OpenAI Audio and speech"
[5]: ./DSAI_SECURITY_AUDIT_2026-08-16.md "DSAI security audit"
[6]: ./DSAI_ENVIRONMENT_CONTRACT_AUDIT_2026-08.md "DSAI environment contract audit"
[7]: ./DSAI_COMPREHENSIVE_PRODUCTION_AUDIT_2026-08.md "DSAI comprehensive production audit"
