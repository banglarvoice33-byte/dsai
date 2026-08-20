# DSAI পূর্ণাঙ্গ Production-Readiness Audit

**Audit date:** ২০ আগস্ট ২০২৬  
**Project:** DSAI — Bengali-first AI Workdesk  
**Audit classification:** Evidence-based Controlled Alpha readiness review  
**Prepared by:** Manus AI

## ১. Executive decision

DSAI এখন একটি সুসংগঠিত **Bengali-first Controlled Alpha Workdesk foundation**। এর public discovery surface, Bengali/English discovery content, authenticated workspace foundation, OAuth entry path, scholarship pilot, admin governance surfaces, Creative Studio planning contract, Try First visitor demo, privacy/deletion workflows, rate and safety boundaries, release packaging, and VPS deployment handoff—সবই project code ও regression evidence দ্বারা সমর্থিত।

সর্বশেষ sandbox validation-এ **৩৯টি test file এবং ১১৮টি test pass করেছে**, TypeScript validation pass করেছে, production build pass করেছে এবং accessibility contract-এর ৫টি check ১০১টি client file-এর উপর pass করেছে। তবে production build-এ একটি performance warning আছে: মূল JavaScript chunk minification-এর পরে প্রায় ৭৯২.৭০ kB এবং gzip-এ ২১৭.২৪ kB; এটি immediate failure নয়, কিন্তু mobile-first “Super Fast” লক্ষ্য পূরণের আগে code-splitting ও manual chunking প্রয়োজন।

VPS transcript-এর evidence অনুযায়ী corrected one-command bundle checksum ও extraction pass করেছে, application build হয়েছে, `127.0.0.1:3011/healthz` সফল হয়েছে এবং `/auth/login` local upstream-এ HTTP 200 দিয়েছে। কিন্তু ফোনের browser-এ `127.0.0.1:3011` খোলা public test নয়; `127.0.0.1` ফোনকেই নির্দেশ করে। Public launch-এর জন্য Nginx, DNS, TLS, final-domain route এবং OAuth callback আলাদা করে verify করতে হবে।

> **চূড়ান্ত সিদ্ধান্ত:** DSAI Controlled Alpha হিসেবে চালানোর জন্য যথেষ্ট শক্ত ভিত্তি অর্জন করেছে। এটিকে এখনো fully integrated 24/7 autonomous agent, live media-generation platform, live payment service, CRM/Calendar automation platform, বা independently security-certified public production বলা যাবে না।

## ২. Audit scope ও evidence method

এই audit-এ source tree, route registration, tRPC router, Drizzle schema, deployment scripts, release-packaging scripts, ৩৯টি test file-এর inventory, current validation output, user-provided VPS transcript, এবং পূর্ববর্তী launch/security/environment audit documents মিলিয়ে দেখা হয়েছে। Remote VPS-এর যে তথ্য user terminal থেকে দিয়েছেন, সেগুলোকে **operator-provided evidence** হিসেবে ধরা হয়েছে; sandbox থেকে remote service-এ সরাসরি প্রবেশ বা public-domain verification করা হয়নি।

প্রতিটি capability চারটি শ্রেণিতে রাখা হয়েছে: **Implemented** অর্থাৎ code এবং test boundary আছে; **Foundation** অর্থাৎ data model ও UI/backend contract আছে কিন্তু complete external execution নেই; **Provider-gated** অর্থাৎ preview/planning আছে, live provider side effect নেই; এবং **Unverified** অর্থাৎ remote/provider/operator evidence ছাড়া নিশ্চিত করা যায় না।

## ৩. শুরু থেকে সর্বশেষ সংযোজনের বিবর্তন

| পর্যায় | প্রধান উদ্দেশ্য | কী বাস্তবায়িত হয়েছে | বর্তমান মূল্য |
|---|---|---|---|
| প্রাথমিক foundation | Bengali-first public AI Workdesk, discovery, UAA ধারণা | React 19, Tailwind 4, tRPC 11, Express, Drizzle/MySQL schema, public narrative | Product identity ও technical foundation তৈরি |
| Authenticated workdesk | ব্যক্তিগত workflow ও account boundary | Manus OAuth entry, protected procedures, user-scoped access/creative records, logout ও OAuth-state rejection | Authenticated foundation বাস্তব |
| Governance ও operations | admin control, evidence, auditability | Admin overview, connectors, scholarship, deletion, search analytics, changelog, trace, performance ও release-gate surfaces | Operational visibility foundation |
| Security boundary | abuse, privacy, request safety | Zod validation, role checks, request IDs, response headers, body-size limit, rate-limit boundary, deletion workflow, CAPTCHA policy | Controlled Alpha security boundary |
| Creative Studio | text-to-image/video/image-to-video | ২–৩ image variation planner, single text-to-video planner, single source-image-to-video planner; fabricated media নিষিদ্ধ | Planning-ready, provider-gated |
| Try First | social-media visitor-এর low-friction demo | No-login, no-file, no-provider local planning; secret/harmful/short prompt blocking; bounded in-memory rate limit | Visitor conversion ও trust-এর জন্য কার্যকর |
| Scholarship | প্রথম ১০০ শিক্ষার্থীর pilot | ১০০ seat, ৩০ দিন, ২০/day, ৩০০/month, manual review, age/privacy/safety disclosures, entitlement/usage tables | Policy/UI/backend foundation |
| Payments ও advertising readiness | ভবিষ্যৎ commercial activation | Card/Visa–Mastercard, bKash, Nagad, Rocket fixed-order admin control; disabled-by-default payment surface; advertising policy disabled-by-default | Prepared, not active |
| Deployment hardening | VPS one-command release | Credential-free ZIP, self-extracting `.run`, checksum, migration helper, environment validator, private loopback Controlled Alpha, Nginx/TLS/systemd/UFW handoffs | Release-ready; public operation still gated |
| Latest corrective pass | runtime failureগুলো সরানো | Bundle marker bug, safe `.env.production.example` omission, environment propagation, command/session mistakes documented and corrected | Packaging confidence significantly improved |

## ৪. বর্তমান architecture ও ব্যবহৃত technology

| স্তর | ব্যবহৃত প্রযুক্তি/উপাদান | মূল্যায়ন |
|---|---|---|
| Frontend | React 19, Vite, Tailwind 4, Wouter, shadcn-style UI components | Responsive Bengali-first product surface; route-level lazy loading আছে |
| Backend | Node/Express, tRPC 11, SuperJSON, Zod | Type-safe procedure boundary ও validation শক্তিশালী |
| Database | Drizzle ORM, MySQL/TiDB schema, migrations | Users, access cases, connectors, scholarship, usage, traces, gates, OAuth tests, lifecycle, billing-event tables আছে |
| Auth | Manus OAuth, one-time state nonce, protected/admin procedures | Code-ready; final domain callback/session evidence বাকি |
| Storage | S3/storage helper ও file metadata model | File policy আছে, কিন্তু malware scanner adapter না থাকায় real upload disabled |
| AI/agents | Lead planner, Bengali benchmark, agent registry, trace store, Creative preview planner | Deterministic/local planning ও auditability আছে; live external generation/worker নেই |
| Operations | preflight, env validator, bootstrap, legacy migration, one-command bundle, deploy launcher | Clean-room deployment contract শক্ত; remote runtime ownership operator-side |
| Security | CAPTCHA boundary, security headers, bounded inputs, rate-limit foundation, secret exclusion, privacy/deletion | Controlled Alpha-এর জন্য যথেষ্ট boundary; high-risk public launch-এর জন্য further gates দরকার |

## ৫. কোন কোন public route ও product surface কাজ করে

বর্তমান route shell-এ homepage, `/learn`, `/developer`, `/method`, `/platform`, `/workspace`, `/scholarship`, `/auth/login`, `/quality-gates`, `/traces`, `/integration-pilot`, `/agents`, `/creative-studio`, `/capabilities`, `/plans`, `/advertising`, `/try-first`, `/evidence`, `/privacy`, `/governance`, `/changelog`, এবং admin routes রয়েছে। Route-level lazy loading এবং loading state আছে; unmatched route NotFound-এ যায়।

| Surface | বর্তমান অবস্থা | সত্যিকার অর্থ |
|---|---|---|
| Homepage/discovery | কাজ করছে | Bengali-first narrative, FAQ, limits, routes ও search discovery |
| `/try-first` | কাজ করছে | Local deterministic planning demo; real provider/media output নয় |
| `/auth/login` | code ও local VPS upstream-এ কাজ করছে | Final-domain OAuth configuration ছাড়া public login প্রমাণিত নয় |
| `/workspace` | protected foundation | Session থাকলে user-scoped cases/creative queue; unauthenticated হলে sign-in boundary |
| `/creative-studio` | preview/planning | ২–৩ image variation, এক text-to-video, এক source-image-to-video contract; rendering নয় |
| `/scholarship` | policy/UI/backend foundation | ১০০-seat pilot; real applicant operations/staffing এখনও operator gate |
| `/admin/*` | role-gated management foundation | admin login, recovery, audit and external side-effect tests এখনও final-domain gate |
| `/plans`, `/admin/payments` | discovery/control readiness | Payment disabled; merchant/webhook/entitlement live নয় |
| `/advertising` | policy surface | Ads disabled-by-default; publisher consent/ads.txt/approval নেই |

## ৬. Backend contracts, data model ও security boundary

`server/routers.ts`-এ public, protected এবং admin procedure আলাদা করা হয়েছে। Public boundary-তে waitlist, lead preview, guest demo, CAPTCHA configuration/verification, public changelog, search recording এবং privacy deletion request রয়েছে। Protected boundary-তে traces, performance list, OAuth test list, files policy/list, scholarship status/application/submit/consume, access cases, creative list/preview/request রয়েছে। Admin boundary-তে deletion review, changelog, search analytics, connectors, trace summaries, scholarship review, benchmark এবং release gates রয়েছে।

Drizzle schema-তে users, waitlist, access cases, integration connectors, deletion requests, changelog, search analytics, file assets, creative requests, scholarship program/applications/entitlements/usage, agent traces, performance snapshots, benchmark runs, release-gate checks, OAuth test runs, lifecycle events এবং billing webhook events-এর table আছে। এই data model breadth production planning-এর জন্য শক্তিশালী; তবে table থাকা মানেই provider side effect, webhook processing, backup/restore এবং operational staffing সম্পন্ন হয়েছে—এমন নয়।

Security audit অনুযায়ী unauthenticated protected access HTTP 401, unauthenticated admin access HTTP 403, invalid OAuth state HTTP 403, user-scoped query contract, Zod input bounds, request correlation, sensitive-log minimization, security response headers, body-size control এবং health/readiness endpoints verified হয়েছে। Public production CAPTCHA fail-closed; no-CAPTCHA কেবল loopback-bound private Controlled Alpha-তে অনুমোদিত।

অপূর্ণ security items হলো distributed rate limiter, cost/quota ledger, signed webhook/replay protection, durable worker/dead-letter queue, live malware scanner, full upload deletion propagation, formal key rotation, dependency advisory closure এবং independent penetration test। বর্তমান release controlled alpha বলা উচিত, security-certified production নয়।

## ৭. AI, Creative Studio ও performance বাস্তবতা

Creative pipeline ইচ্ছাকৃতভাবে output fabrication করে না। Text-to-image একটি prompt থেকে ২ বা ৩ variation-এর plan তৈরি করে; text-to-video একটি bounded plan তৈরি করে; image-to-video একটি approved single source asset reference চায়। Rights confirmation ও safety acknowledgement ছাড়া preview blocked হয়। Provider mode `provider-gated`, এবং output বাস্তব media asset নয়। এটি governance-এর দিক থেকে সঠিক; marketing copy-তে “live image/video generation” বলা যাবে না।

৩-second client-response লক্ষ্য সম্পর্কে বর্তমান evidence কেবল local deterministic planner core পর্যন্ত। External messaging delivery, provider latency, user consent, booking, retries, queueing এবং real field p95 latency মাপা হয়নি। তাই product promise হওয়া উচিত “fast bounded planning preview”, guaranteed three-second conversion নয়।

বর্তমান production build pass করলেও Vite/Rollup সতর্ক করেছে যে `index` chunk minified অবস্থায় প্রায় ৭৯২.৭০ kB এবং gzip-এ প্রায় ২১৭.২৪ kB। Mobile-first Super Fast লক্ষ্য পূরণের জন্য route-level lazy loading ইতিমধ্যে আছে, কিন্তু shared vendor chunk split, manual chunks, image/font optimization, caching strategy, Brotli/Gzip verification এবং Web Vitals field measurement এখনও প্রয়োজন।

## ৮. Scholarship, payment, advertising ও governance

Scholarship surface-এ প্রথম ১০০ approved seat, ৩০ দিনের non-renewing access, ২০ daily units, ৩০০ monthly units, manual review, ১৮+ age boundary, privacy/deletion guidance, suspension/appeal এবং AI-error/human-review disclosure আছে। এটি credible pilot policy; কিন্তু real applicants, reviewer staffing, entitlement observation, appeal handling এবং abuse/fraud evidence ছাড়া scholarship program operationally live বলা যাবে না।

Payment control surface-এ user-facing order এবং admin control order Card/Visa–Mastercard, bKash, Nagad, Rocket হিসেবে প্রস্তুত, কিন্তু সব disabled-by-default। No payment is executed. Live activation-এর আগে licensed merchant or hosted gateway, callback allowlist, webhook signature/replay control, idempotency, refund, entitlement, tax/invoice, support and reconciliation দরকার।

Advertising surface disabled-by-default এবং protected/auth/payment/workspace routes-এ ad exclusion policy আছে। Google publisher approval, consent management, `ads.txt`, publisher identity, ad placement QA এবং revenue accounting না হওয়া পর্যন্ত advertising active নয়। Governance, ownership/control register, privacy, changelog, evidence এবং explicit limitations-এর public surface আছে; তবে legal entity registration, trademark, tax, formal DPA/terms review, incident-response staffing এবং independent audit application-এর বাইরে।

## ৯. Deployment ও current VPS state

Credential-free `.zip` এবং self-extracting `.run` bundle-এ real secrets রাখা হয় না। Environment source হলো protected `/etc/dsai/dsai.env` বা legacy process-এর allowlisted migration। Environment validator file-based Forge policy, CAPTCHA mode, runtime mode, bind address, core keys এবং public/private boundary যাচাই করে। Validation সফল হওয়ার আগে old process বন্ধ না করার correction যুক্ত হয়েছে।

User-provided VPS evidence অনুযায়ী corrected `_5.run` bundle expected SHA-256 match করেছে, archive extraction pass করেছে, production build pass করেছে, app `127.0.0.1:3011`-এ শুরু হয়েছে, `/healthz` এবং `/auth/login` local upstream-এ 200 দিয়েছে। এরপর Nginx reverse proxy, TLS, UFW, systemd এবং fail2ban handoff commands প্রস্তুত করা হয়েছে। User transcript-এ UFW install শেষ হওয়ার evidence আছে, কিন্তু final UFW rules, systemd unit activation, Nginx public route, certificate issuance, DNS public response এবং OAuth final-domain flow এখনও এই audit-এ independently verified নয়।

গুরুত্বপূর্ণ operational distinction হলো: `127.0.0.1:3011` ফোনের browser-এ খুললে ফোনের loopback বোঝায়, VPS নয়। Public browser test করতে হবে `https://dsai.banglarvoice24news.com/` origin-এ; local health test করতে হবে VPS SSH terminal-এর `curl http://127.0.0.1:3011/...` দিয়ে।

## ১০. কী কাজ করছে, কী আংশিক, কী অকেজো/গেটেড

| শ্রেণি | বর্তমান বিষয় | সিদ্ধান্ত |
|---|---|---|
| কাজ করছে | Public Bengali-first UI, route shell, Try First local preview, UI disclosures, local build, unit/regression suite, local VPS app start | Controlled Alpha product foundation |
| কাজ করছে কিন্তু operator-gated | OAuth code path, protected workspace, admin routes, scholarship review, Nginx/TLS handoff, systemd/UFW commands | Real credentials, final domain, service setup ও non-secret verification দরকার |
| Foundation only | UAA case drafts, Creative queue, trace/evaluation/performance ledgers, connectors, payments controls, advertising policy | Durable external execution নেই |
| Preview/provider-gated | Text-to-image/video/image-to-video | Planner আছে, media renderer/worker/provider/storage/moderation নেই |
| Disabled by design | Live payment, live ads, live file upload, external CRM/Calendar/messaging, autonomous publishing | নিরাপদ; provider gates ছাড়া চালু করা যাবে না |
| Intentionally absent | Crypto mining, device mining, guaranteed income, fake reviews/testimonials, raw fingerprint admin login | আইনগত/নৈতিক boundary হিসেবে বাদ দেওয়া হয়েছে |
| Not independently verified | Public domain, Nginx/TLS, DNS, OAuth callback/session, DB readiness, backup/restore, field latency, penetration test | Launch blocker বা high-risk evidence gap |

## ১১. Production-ready হতে বাকি workstream

### Immediate closure: public reachability

প্রথমে DNS A/AAAA record, VM firewall/security-group, UFW rules, Nginx upstream, TLS certificate এবং public `/`, `/auth/login`, `/try-first`, `/creative-studio`, `/scholarship`, `/healthz`, `/readyz` route verify করতে হবে। Nginx upstream-এ app port `3011` loopback-only থাকবে; public port হবে 80/443। Public `/api/oauth/callback` path এবং exact final-domain callback allowlist একসঙ্গে যাচাই করতে হবে।

### Controlled Alpha operations

Systemd service, automatic restart, log rotation, backup/restore drill, release rollback, support mailbox, abuse escalation, scholarship reviewer workflow, data deletion response এবং admin recovery contact স্থাপন করতে হবে। UFW-তে SSH 22, HTTP 80, HTTPS 443 allow এবং 3011 external deny থাকতে হবে।

### Provider activation

প্রতিটি provider-এর জন্য পৃথক adapter, sandbox credential, consent screen, scopes, signed webhook, idempotency key, retry/dead-letter behavior, rate/quota ledger, audit record, cancellation/refund/deletion behavior এবং staging evidence লাগবে। Payment এবং external actions একসঙ্গে bulk enable করা যাবে না; provider-by-provider activation করতে হবে।

### Media ও upload productionization

Secure S3 upload, MIME/size validation, malware scanning, content safety verdict, provenance, object retention, deletion propagation, worker queue, cost ceiling, moderation, failed-job recovery এবং human-review state machine তৈরি করতে হবে। এগুলো ছাড়া Creative Studio-কে live generation বলা যাবে না।

### Performance ও reliability

Large shared chunk split, critical route bundle reduction, CDN/cache headers, Brotli/Gzip, image/font optimization, real-device Web Vitals, server p50/p95, database latency, queue latency, error budget এবং load test চালাতে হবে। “Super Fast” claim evidence ছাড়া ব্যবহার করা যাবে না।

### High-risk public launch

Dependency advisory review, independent penetration test, secret rotation, least-privilege IAM, incident response, audit-log retention, backup restore evidence, privacy/terms/tax/payment legal review, support SLA এবং final-domain OAuth mobile test সম্পন্ন না হওয়া পর্যন্ত high-risk public launch করা উচিত নয়।

## ১২. Prioritized go/no-go matrix

| Gate | বর্তমান ফল | Release decision |
|---|---|---|
| Source/build/tests | 39 files / 118 tests pass; TypeScript/build/accessibility pass | GO |
| Local VPS application | Corrected bundle, build, local health/login pass by operator transcript | Controlled-alpha GO |
| Protected environment | Validator/migration/secret exclusion implemented | GO after real values verified locally |
| Database readiness | Schema/model present; remote DB readiness not evidenced in current audit | BLOCK public promotion |
| Nginx/TLS/DNS | Handoff prepared; final public evidence absent | BLOCK public promotion |
| OAuth final-domain | Code boundary pass; real consent/session/revoke absent | BLOCK public promotion |
| Live media | Preview only | BLOCK activation |
| Payments | Disabled by default | BLOCK activation |
| File upload/malware | Disabled until scanner adapter | BLOCK activation |
| Backup/restore/rollback | Scripts/docs exist; live drill absent | BLOCK public promotion |
| Performance | Build warning; field p95 absent | BLOCK Super Fast claim |
| Independent security review | Not performed | BLOCK high-risk public launch |

## ১৩. Final assessment

DSAI-এর সবচেয়ে বড় অর্জন হলো এটি broad promise থেকে evidence-bounded product foundation-এ রূপান্তরিত হয়েছে। Product এখন visitor discovery, bounded Try First value, Bengali-first explanation, protected work drafts, scholarship pilot, Creative planning, governance, privacy এবং release operations-এর একটি coherent system। সবচেয়ে গুরুত্বপূর্ণ negative capability-ও পরিষ্কার: system fake media output দেখায় না, live payment চালায় না, public CAPTCHA bypass করে না, crypto mining বা guaranteed income claim করে না, এবং provider credentials না থাকলে external side effect শুরু করে না।

সবচেয়ে বড় অসম্পূর্ণতা code নয়; **production operation evidence**। Final domain routing, TLS, OAuth consent/session, database readiness, process supervision, firewall verification, backup/restore, provider credentials, webhook/idempotency, upload scanning এবং real-device performance এখনও সংযুক্ত ও প্রমাণিত হয়নি। সুতরাং বর্তমান truthful label হলো: **DSAI Bengali-first Controlled Alpha — release-ready foundation, public high-risk production নয়।**

## References

[1]: ./DSAI_FINAL_LAUNCH_AUDIT_2026-08-16.md "DSAI Final Launch-Readiness Audit"

[2]: ./DSAI_FINAL_GO_LIVE_READINESS_AUDIT_2026-08.md "DSAI Final Go-Live Readiness Audit"

[3]: ./DSAI_SECURITY_AUDIT_2026-08-16.md "DSAI Security Audit"

[4]: ./DSAI_ENVIRONMENT_CONTRACT_AUDIT_2026-08.md "DSAI Environment Contract Audit"

[5]: ./DSAI_ONE_COMMAND_DOUBLE_CHECK_2026-08.md "DSAI One-Command Deployment Double-Check"

[6]: ./DSAI_FOUR_ARTIFACT_AND_COMMAND_MATRIX_BN.md "DSAI Four-Artifact and Command Matrix"

[7]: ./DSAI_NGINX_TLS_REVERSE_PROXY_HANDOFF_BN.md "DSAI Nginx TLS Reverse Proxy Handoff"

[8]: ./DSAI_PRIVATE_ALPHA_AND_VPS_RECOVERY_BN.md "DSAI Private Alpha and VPS Recovery"

[9]: ./DSAI_STUDENT_PRO_SCHOLARSHIP_GUIDE_BN.md "DSAI Student Pro Scholarship Guide"

[10]: ./AUTHENTICATION_AND_ADMIN_GUIDE.md "Authentication and Admin Guide"

[11]: ../client/src/App.tsx "Current application route shell"

[12]: ../server/routers.ts "Current tRPC procedure contracts"

[13]: ../drizzle/schema.ts "Current Drizzle database schema"

[14]: ../todo.md "Current project checklist and operator gates"

[15]: https://owasp.org/API-Security/editions/2023/en/0x11-t10/ "OWASP API Security Top 10 2023"

[16]: https://docs.stripe.com/api/idempotent_requests "Idempotent request guidance"

[17]: https://docs.stripe.com/webhooks "Webhook security and processing guidance"

[18]: https://opentelemetry.io/docs/languages/js/ "OpenTelemetry JavaScript documentation"


## ১২. Latest re-audit: live media and provider activation

The latest provider research confirms that real video generation is an asynchronous job workflow rather than a synchronous browser request. A production implementation therefore needs durable job state, polling or signed webhooks, retries, idempotency, object storage, moderation, quota/cost controls, and deletion. Current DSAI Creative Studio correctly remains provider-gated and returns a planning contract with `output: null`; this is a safe preview boundary, not a live media renderer. Official provider documentation also confirms that current video products may support image direction and native audio, while text-to-speech requires explicit disclosure that the voice is AI-generated. Model IDs, pricing, availability, and lifecycle must remain configurable and verified at activation time.

The re-audit does not discover recoverable real secrets in the project or in the supplied masked environment transcript. Therefore no provider can be truthfully activated from this workspace alone. The next implementation boundary is a typed provider adapter plus durable media jobs, output metadata, storage lifecycle, moderation, quota/cost ledger, callback/polling reliability, and Bengali audio/video quality evaluation. Until those gates and the final VPS public edge are evidenced, the correct classification remains **Controlled Alpha / production-ready foundation, not fully provider-integrated public production**.

See [DSAI media provider research](./DSAI_MEDIA_PROVIDER_RESEARCH_2026-08.md) and [DSAI true-live media and production plan](./DSAI_TRUE_LIVE_MEDIA_AND_PRODUCTION_PLAN_BN.md).

[8]: https://developers.openai.com/api/docs/guides/video-generation "OpenAI Video generation with Sora"
[9]: https://ai.google.dev/gemini-api/docs/video "Google Gemini API video generation and Veo"
[10]: https://developers.openai.com/api/docs/guides/text-to-speech "OpenAI Text to speech"
[11]: https://developers.openai.com/api/docs/guides/audio "OpenAI Audio and speech"


## ১৩. Post-research validation status

After adding the provider research and true-live media plan, the current project validation was rerun. The result is **39 test files passed and 118 tests passed**, TypeScript check passed, production build passed, and the project’s actual accessibility command `pnpm run check:a11y` passed with 5 checks across 101 client files. An initial attempt to call a nonexistent `pnpm run accessibility` alias failed with `ERR_PNPM_NO_SCRIPT`; this was a command-name mistake, not a product failure, and the authoritative `check:a11y` script then passed. The production build continues to report the existing large shared JavaScript chunk warning, so the mobile performance gate remains open.
