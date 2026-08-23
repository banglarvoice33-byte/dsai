# DSAI পুনরাবৃত্ত দাবি বনাম বাস্তবায়ন অনুসন্ধান প্রতিবেদন

**প্রতিবেদন তারিখ:** ২৩ আগস্ট ২০২৬  
**প্রকল্প:** DSAI — Bengali-first AI Workdesk  
**প্রস্তুতকারী:** Manus AI  
**মূল্যায়নের ধরন:** Code-, route-, test-, documentation- এবং operator-evidence ভিত্তিক implementation-gap investigation

## নির্বাহী সারাংশ

এই অনুসন্ধানের উদ্দেশ্য হলো আলোচনায় বারবার আসা feature ও deployment দাবিগুলো বর্তমান source code, route registration, tRPC contract, capability ledger, schema, tests, public copy, deployment artifacts এবং পূর্ববর্তী audit-এর সঙ্গে মিলিয়ে দেখা। মূল ফল হলো: DSAI-তে অনেক feature-এর **সুস্পষ্ট foundation, controlled preview বা planning contract** রয়েছে, কিন্তু সেগুলোর সবগুলোকে live external service, autonomous operation বা public production capability বলা যাবে না।

সবচেয়ে গুরুত্বপূর্ণ বিভ্রান্তির উৎস তিনটি। প্রথমত, database table বা UI থাকাকে অনেক সময় সম্পূর্ণ operational service হিসেবে ধরা হয়েছে। দ্বিতীয়ত, provider-ready planner-কে live media/payment/automation হিসেবে বোঝানো হয়েছে। তৃতীয়ত, local VPS health check-কে public domain, TLS, OAuth callback এবং operational readiness-এর সমতুল্য ধরা হয়েছে। এই প্রতিবেদন সেই তিনটি স্তর আলাদা করেছে।

> **Truthful product label:** DSAI Bengali-first Controlled Alpha — release-ready foundation; live provider execution, public high-risk production এবং independently security-certified operation এখনও প্রমাণিত নয়।

## প্রমাণের পদ্ধতি ও status vocabulary

আমি current capability matrix, master production audit, supplied v4 compatibility audit, live-media plan, 40-market lead documentation, environment/deployment handoff, route/UI references, regression evidence এবং project TODO-এর remaining gates মিলিয়ে status নির্ধারণ করেছি।

| Status | অর্থ |
|---|---|
| **Implemented** | Code path, validation এবং relevant test/evidence আছে; scope সীমাবদ্ধ হতে পারে। |
| **Foundation** | Schema, UI বা procedure contract আছে; সম্পূর্ণ external execution, staffing বা operational proof নেই। |
| **Preview / planning** | User-facing preview বা deterministic plan আছে; বাস্তব side effect বা final artifact নেই। |
| **Provider/VPS gate** | Third-party credential, signed callback, public infrastructure বা operator evidence ছাড়া কার্যকর বলা যাবে না। |
| **Intentional exclusion** | নিরাপত্তা, আইন, privacy বা consumer-protection কারণে ইচ্ছাকৃতভাবে যুক্ত করা হয়নি। |
| **Incomplete claim** | ভাষা বা দাবির পরিমাণ implementation evidence-এর চেয়ে বড়। |

## অনুসন্ধানের মূল ফলাফল

### ১. যেসব বিষয় বাস্তবভাবে যুক্ত হয়েছে

| বিষয় | বর্তমান প্রমাণ | সীমা |
|---|---|---|
| Bengali-first public Workdesk | React route shell, Bengali/English copy, semantic navigation, Try First এবং public discovery surfaces | Voice, পূর্ণ transliteration, OCR ও সব language-QA pipeline চালু নয় |
| Auth foundation | Manus OAuth entry, nonce/state boundary, protected/admin procedures, logout | Final custom-domain callback/session/revoke evidence operator-side বাকি |
| Universal multilingual lead composer | Any-language brief, source-language detection, target locale, tone/channel, AI refinement, deterministic fallback | Draft-only; external CRM/email/SMS/social/calendar action disabled |
| ৪০-মার্কেট business form | Market catalog, locale/language/currency/timezone/region defaults, business context, smart search/filter | Auto-filled context personal/company facts নয়; local compliance review প্রয়োজন |
| Live preview ও Excel export | Draft final করার আগে preview; local `.xlsx` export; formula-injection sanitization | Export reviewed draft; delivery বা campaign execution নয় |
| Try First | No-login, no-file, bounded deterministic planning preview | Real provider output বা full document processing নয় |
| Scholarship pilot foundation | ১০০-seat, entitlement/usage model, manual review এবং policy/UI | Real applicant operations, anti-fraud, reviewer staffing ও appeal evidence বাকি |
| Governance/privacy surfaces | Evidence, privacy, changelog, deletion, developer secret-safety ও capability ledger | Legal entity, DPA/terms review, incident-response staffing ও independent audit আলাদা বিষয় |
| Deployment packaging | Credential-free ZIP, self-extracting bundle, checksum, external environment, staged release ও rollback-aware switching | Final VPS public edge, TLS, DNS, OAuth এবং backup drill independently verified নয় |
| Tactile Kinetic UI | Visible marker, diagonal grid texture, depth shadows, orbit/float motion, reduced-motion guard | CSS-only visual treatment; WebGL/Spline runtime যুক্ত হয়নি |

### ২. বারবার দাবি করা হলেও সম্পূর্ণভাবে live হয়নি এমন বিষয়

| পুনরাবৃত্ত দাবি | প্রকৃত অবস্থা | কেন অসম্পূর্ণ বা gated |
|---|---|---|
| Text-to-image, text-to-video, image-to-video তৈরি | **Preview/provider-gated** | Planner ও storyboard আছে; live adapter, async worker, storage, moderation, quota, provenance, cancellation ও recovery নেই |
| Audio/video generation | **Planning/provider-gated** | Real model/provider, audio rights, likeness consent, output storage ও review pipeline নেই |
| “৩ সেকেন্ডে client ধরা” বা guaranteed fast agent | **Incomplete claim** | Local planner fast হতে পারে; real messaging latency, consent, provider/network p95 এবং field data মাপা হয়নি |
| ২৪/৭ Super Agent বা autonomous automation | **Foundation only** | Agent registry/trace/connector contract আছে; always-on worker, queue lease, retries, dead-letter, webhook এবং approval loop নেই |
| CRM, email, SMS, social messaging বা calendar booking | **Disabled/provider-gated** | Consent, opt-out, provider scopes, signed webhook, idempotency, audit and human approval ছাড়া side effect চালু করা হয়নি |
| Payment gateway: Visa/Mastercard, SSLCOMMERZ, bKash, Nagad, Rocket | **Prepared but disabled** | Merchant account, hosted flow, signed callback, replay protection, refund, reconciliation, tax/invoice ও entitlement integration নেই |
| Google ads/advertising revenue | **Policy only, disabled-by-default** | Publisher approval, consent management, `ads.txt`, placement QA, publisher identity ও revenue accounting নেই |
| File upload, OCR ও malware scanning | **Foundation/disabled** | Metadata/lifecycle contract আছে; real scanner, S3 deletion propagation, OCR এবং large-file worker নেই |
| Public domain live launch | **Not independently verified** | Local `127.0.0.1` health pass public DNS, Nginx, TLS বা final-domain route প্রমাণ করে না |
| Final-domain OAuth login | **Code-ready, operator-gated** | Callback allowlist, cookie/session behavior, consent, revoke এবং mobile/browser flow public domain-এ যাচাই হয়নি |
| “এক command-এ সম্পূর্ণ production deploy” | **Strong artifact, incomplete promise** | Bundle extraction/build/health করতে পারে; প্রথমবার environment, upload, database, DNS/TLS/OAuth এবং process supervision operator action চায় |
| Production database readiness | **Schema-ready, remote gate** | MySQL/TiDB schema ও ORM আছে; live connection, migration, backup/restore, failover ও latency evidence নেই |
| Super Fast performance | **Partially supported, not proven** | Route lazy loading আছে, কিন্তু shared chunk বড়; real-device Web Vitals, p95, CDN/compression ও image/font measurement বাকি |
| Leaderboard, rewards, badges, confetti/social sharing | **Not evidenced as production feature** | আগের product discussion-এ চাওয়া হয়েছিল; current authoritative capability/route/test evidence-এ complete operational module হিসেবে পাওয়া যায়নি |
| Real-time global notifications | **Foundation/provider-dependent** | Notification contract থাকতে পারে; durable delivery, preference/mute, retry, provider, audit ও user-visible end-to-end proof নেই |
| Crypto/device mining বা guaranteed income | **Intentionally absent** | আইনগত, নৈতিক, security এবং consumer-protection কারণে যুক্ত করা হয়নি; এটি defect নয় |
| Fake reviews/testimonials বা fabricated customer proof | **Intentionally absent** | Consumer-protection ও platform-policy boundary; fabricated social proof যোগ করা যাবে না |

## কেন বারবার অসম্পূর্ণতার ধারণা তৈরি হয়েছে

প্রথম কারণ হলো **contract বনাম execution** গুলিয়ে ফেলা। যেমন `creativeRequests`, payment tables, webhook event tables বা agent registry থাকা ভবিষ্যৎ execution-এর জন্য দরকারি foundation, কিন্তু এগুলো provider account, worker, callback verification, monitoring বা human operations তৈরি করে না।

দ্বিতীয় কারণ হলো **local verification বনাম public verification** আলাদা না করা। VPS-এ `curl http://127.0.0.1:3011/healthz` সফল হওয়া কেবল ওই VPS-এর loopback process সচল থাকার প্রমাণ। এটি domain DNS, public Nginx upstream, TLS certificate, firewall policy, OAuth callback অথবা phone browser reachability প্রমাণ করে না।

তৃতীয় কারণ হলো **marketing language-এর অতিরঞ্জন**। “AI media generation”, “24/7 agent”, “three-second client”, “one-command production” বা “Super Fast” শব্দগুলো planning contract বা local benchmark-এর চেয়ে বড় promise তৈরি করে। Public copy-তে এগুলোকে preview, provider-gated বা target হিসেবে label করতে হবে।

চতুর্থ কারণ হলো **environment এবং secret boundary** নিয়ে পুরোনো নির্দেশনার drift। বর্তমান সঠিক contract হলো `/etc/dsai/dsai.env`-এর protected external source; project, GitHub, ZIP, `.run` bundle বা public client-এ real secret থাকবে না। পুরোনো `.env.production`-কেন্দ্রিক copy থাকলে সেটি stale এবং সংশোধনযোগ্য।

## দাবির গুরুত্ব ও বর্তমান risk

| Risk level | বিষয় | বর্তমান সিদ্ধান্ত |
|---|---|---|
| Critical | Public OAuth, payment, external messaging, official submission, live media output | Evidence ছাড়া live বলা যাবে না; provider-by-provider gate দরকার |
| High | Database migration/backup, Nginx/TLS/DNS, process supervision, secret rotation | Public promotion-এর আগে operator evidence দরকার |
| Medium | Super Fast, three-second response, 24/7 automation, scholarship operations | Measured field evidence, staffing ও operational drill দরকার |
| Low/clarity | Changelog, search discovery, visual labels, capability status | Project-side copy ও ledger-এ status স্পষ্ট রাখা হয়েছে |

## বাস্তবায়নের জন্য সংশোধিত action plan

### প্রথম অগ্রাধিকার: public edge closure

Final DNS A/AAAA record, VM firewall/security-group, UFW, Nginx upstream, TLS certificate, public `/`, `/auth/login`, `/try-first`, `/lead-composer`, `/healthz` ও `/readyz` যাচাই করতে হবে। Nginx-এর মাধ্যমে app port loopback-only থাকবে; public port 80/443 হবে। Final OAuth callback allowlist একই domain-এর সঙ্গে মিলিয়ে browser login, logout, session expiry ও revoke flow পরীক্ষা করতে হবে।

### দ্বিতীয় অগ্রাধিকার: operational durability

Systemd automatic restart, log rotation, backup/restore drill, release rollback, database migration evidence, secret rotation, support/abuse escalation, scholarship reviewer process এবং data-deletion response স্থাপন করতে হবে। এগুলো ছাড়া deployment bundle শক্তিশালী হলেও production operation অসম্পূর্ণ থাকবে।

### তৃতীয় অগ্রাধিকার: provider activation

প্রথমে একটি provider এবং একটি capability sandbox-এ চালু করতে হবে। Adapter, consent scope, quota/cost ledger, signed webhook, replay protection, idempotency, retry/dead-letter, cancellation, deletion এবং human approval evidence ছাড়া একসঙ্গে media, payment, CRM এবং messaging চালু করা উচিত নয়।

### চতুর্থ অগ্রাধিকার: performance evidence

বর্তমান route-level lazy loading বজায় রেখে shared vendor chunk split, image/font optimization, CDN/cache headers, Brotli/Gzip, real-device Web Vitals, server/database p50-p95 এবং queue latency মাপতে হবে। এই evidence না পাওয়া পর্যন্ত “Super Fast” শব্দটি aspiration বা optimization target হিসেবে লেখা উচিত, guaranteed product claim হিসেবে নয়।

### পঞ্চম অগ্রাধিকার: product-copy governance

প্রতিটি public capability card-এ একই status vocabulary ব্যবহার করতে হবে: Implemented, Foundation, Preview, Provider-gated, Roadmap বা Not live। “Generate”, “send”, “book”, “pay”, “publish” শব্দের পাশে draft-only বা human-review boundary স্পষ্ট রাখতে হবে।

## Final findings

এই অনুসন্ধানে সবচেয়ে বড় gap পাওয়া গেছে **feature invention নয়, status communication এবং operational evidence-এ**। DSAI-তে public Bengali-first UI, authenticated foundation, Try First, scholarship policy foundation, universal multilingual lead composer, ৪০-মার্কেট business context form, preview/live export, governance surfaces, credential-free deployment artifact এবং Tactile Kinetic UI সত্যিকারভাবে যুক্ত হয়েছে।

অন্যদিকে live media rendering, audio/video output, payment execution, external CRM/calendar/messaging side effect, OCR/upload scanning, 24/7 autonomous operation, public custom-domain OAuth, backup/restore drill, field performance এবং independent security certification এখনও সম্পূর্ণ প্রমাণিত নয়। এগুলোকে “অকেজো” বলা ঠিক হবে না; সঠিক শব্দ হলো **foundation, preview বা external gate**।

> **Go/no-go conclusion:** Project-side feature implementation-এর জন্য DSAI শক্ত Controlled Alpha অবস্থায় আছে। Public high-risk production এবং live provider activation-এর জন্য remote infrastructure evidence, provider credentials, operational staffing, security controls, backup/restore এবং measured performance এখনও বাধ্যতামূলক।

## References

[1]: ./DSAI_COMPREHENSIVE_PRODUCTION_AUDIT_2026-08.md "DSAI Comprehensive Production Audit 2026-08"

[2]: ./DSAI_SUPPLIED_V4_COMPATIBILITY_AUDIT_BN.md "DSAI Supplied v4 Compatibility Audit"

[3]: ./DSAI_TRUE_LIVE_MEDIA_AND_PRODUCTION_PLAN_BN.md "DSAI True Live Media and Production Plan"

[4]: ./DSAI_40_MARKET_MULTILINGUAL_LEAD_FORM_BN.md "DSAI 40-Market Multilingual Lead Form"

[5]: ./DSAI_VPS_ONLY_ENVIRONMENT_SEPARATION_BN.md "DSAI VPS-Only Environment Separation"

[6]: ./DSAI_NGINX_TLS_REVERSE_PROXY_HANDOFF_BN.md "DSAI Nginx TLS Reverse Proxy Handoff"

[7]: ./DSAI_SQLITE_AND_DEPLOYMENT_SIMPLIFICATION_AUDIT_BN.md "DSAI SQLite and Deployment Simplification Audit"
