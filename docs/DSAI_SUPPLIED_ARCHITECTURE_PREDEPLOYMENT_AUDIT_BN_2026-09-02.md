# DSAI supplied architecture বনাম বর্তমান project

## Executive conclusion

Final deployment-এর আগে এই supplied architecture যাচাই করা প্রয়োজন এবং করা হয়েছে। এটি DSAI-এর জন্য একটি উচ্চাকাঙ্ক্ষী media/news SaaS এবং AI-automation blueprint; বর্তমান DSAI repository তার সমান architecture নয়। বর্তমান system হলো Bengali-first React/Vite + Express + tRPC + Drizzle ORM + MySQL/TiDB ভিত্তিক controlled-alpha Workdesk। তাই supplied document-এর কয়েকটি ধারণা বাস্তব project-এর সঙ্গে মেলে, কিন্তু Next.js 14, Prisma, PostgreSQL, Redis/BullMQ, Python workers, Meilisearch, Qdrant, n8n, Prometheus/Grafana/Loki, ad revenue, subscription MRR, 2FA/TOTP এবং 24/7 autonomous publishing—এগুলোর অধিকাংশ বর্তমান source tree-তে নেই বা provider/remote gate হিসেবে আছে।

> কোনো local route, schema table, preview card, unit test, বা design frame আলাদা VPS, production database, provider credential, backup restore, DNS/TLS বা real-user metric-এর প্রমাণ নয়।

## Architecture comparison

| Supplied claim | Current DSAI evidence | Accurate classification | Deployment implication |
|---|---|---|---|
| Next.js 14 | `package.json`-এ Vite 7, React 19, Express 4; Next dependency নেই | Not implemented | Next-specific deployment instructions ব্যবহার করা যাবে না |
| Prisma + Postgres | Drizzle MySQL core এবং `mysql2` ব্যবহৃত | Different implemented stack | Postgres migration ছাড়া Prisma schema/commands চালানো যাবে না |
| Redis, BullMQ, Python workers | package/runtime/source-এ নেই | Unsupported in current release | Queue/worker compose যোগ করলে তা নতুন subsystem হবে, existing feature নয় |
| Sharp WebP/AVIF pipeline | Sharp dependency বা image-processing worker নেই | Not implemented | Image optimization claim করা যাবে না |
| 24-page sitemap | বর্তমান `App.tsx`-এ public, user, admin মিলিয়ে routes আছে, কিন্তু supplied newsroom page set নয় | Partially mapped, not equivalent | Figma frame count এবং route count এক বলা যাবে না |
| 13-table ER diagram | বর্তমান Drizzle schema-এ users, access, connectors, files, creative, scholarship, traces, gates, OAuth, lifecycle এবং billing-related tables আছে | Schema breadth exists, model differs | Supplied table names/relationships সরাসরি production schema নয় |
| AI 90% autonomous, human approve | Creative ও external integrations preview-first; lead drafting no-send; media/provider action gated | Safety foundation/preview | 24/7 autonomous operation claim নিষিদ্ধ |
| Ads, 3.4k subscribers, 91% delivery, MRR ৳45k | readiness/admin surfaces আছে; live provider/revenue data নেই | Unsupported metrics | কোনো revenue, delivery, subscriber বা MRR number ব্যবহার করা যাবে না |
| Daily S3 backup 2 AM, weekly restore | backup contracts/runbooks আছে; target VPS drill প্রমাণিত নয় | Operational foundation | restore evidence ছাড়া public go নয় |
| Lighthouse 94 / PWA score 100 | project tests/build আছে; field Lighthouse/PWA measurement নেই | Unverified metric | নতুন lab/field measurement প্রয়োজন |
| 2FA OTP/TOTP, RBAC Admin/Editor/Reporter | admin/user role boundary আছে; supplied 2FA/RBAC matrix নেই | Partial security foundation | final-domain auth, recovery, MFA and role test প্রয়োজন |
| Cloudflare/Bunny/WAF/Nginx rate limiting | docs and handoff exist; target edge not verified | Remote gate | DNS, TLS, proxy, firewall and public route checks প্রয়োজন |
| Play release signing | external-keystore fail-closed script আছে; keystore absent | Prepared, not signed | owner-controlled keystore ছাড়া Play upload করা যাবে না |

## Current implemented feature posture

| Feature area | Current status | What is safe to say |
|---|---|---|
| Bengali-first Workdesk | Controlled alpha | Bengali/Banglish/English request-to-checklist and Work Packet flow আছে |
| Universal lead composer | Implemented controlled-alpha | Any-language brief, 40-market context, preview, consent, no-auto-send, local XLSX export আছে |
| Creative Studio | Preview-only | Provider-ready plan, storyboard, provenance and safety checks আছে; live media render নয় |
| Access/government workflows | Implemented/foundation | Bounded summaries, checklists and human-review boundaries আছে; official submission automation নয় |
| Scholarship | Controlled alpha | 100-seat entitlement/usage model and review metadata আছে; identity/anti-fraud provider fully connected নয় |
| External CRM/calendar/messaging | Read-only pilot/provider-gated | discovery/simulation আছে; create, send, invite, book বা delete defaultভাবে নয় |
| Files and malware scanning | Foundation | quarantine/scan/lifecycle schema and fail-closed contracts আছে; real scanner/storage adapter গেটেড |
| Payments | Disabled readiness console | Card, bKash, Nagad, Rocket activation policy আছে; live charge নয় |
| Admin operations | Implemented control surface | capability pulse, operator queue, gate evidence, traces, quality gates and privacy queue আছে |
| Audio/video generation | Not live | planning and provider boundary আছে; production output, quota and billing evidence নেই |
| 24/7 AI automation | Not implemented | no BullMQ/Python worker/autonomous publishing path exists |

## Supplied six automation workflows: decision

১. **Auto ingestion:** source-aware planning এবং human-review boundary-এর ধারণা বর্তমান agent traces-এর সঙ্গে সামঞ্জস্যপূর্ণ; কিন্তু supplied MANUS/CLAUDE → BullMQ → GPT-4o → Tavily → Slack pipeline বর্তমান source tree-তে নেই। Draft/PENDING_REVIEW semantics আংশিকভাবে safe design principle, production workflow নয়।

২. **Auto SEO:** lead/creative quality contracts ও evidence surfaces আছে; supplied SEO 78 score, OG image generator, NewsArticle schema এবং one-click auto-apply প্রমাণিত নয়।

৩. **Auto moderation:** safe moderation policy documented হতে পারে, কিন্তু toxicity model, spam classifier, 90% auto-approve threshold এবং 30-second SLA নেই। Auto-approve চালু করা যাবে না।

৪. **Breaking-news detection:** কোনো authoritative 3-source ingestion, view-spike detector, push pipeline বা phone approval workflow নেই। এটিকে roadmap/unsupported claim হিসেবে রাখতে হবে।

৫. **Auto translation/multi-format:** multilingual lead drafting আছে; TTS, video script production, social publishing এবং automatic variant dispatch নেই। Human review ছাড়া public dispatch করা যাবে না।

৬. **Auto backup/self-healing:** health/readiness endpoint, deployment rollback-aware scripts এবং backup runbook আছে; Docker auto-restart, S3 schedule, restore test, anomaly detector এবং alerting target environment-এ প্রমাণিত নয়।

## Production go/no-go

| Gate | Current result | Decision |
|---|---|---|
| Source build and tests | Pass | Project-side ready |
| TypeScript and route contracts | Pass | Project-side ready |
| Secret separation | Pass | External `/etc/dsai/dsai.env` boundary required |
| `/health`, `/healthz`, `/readyz` | Implemented; `/readyz` performs database probe | Target VM verification required |
| Android user wrapper | Debug-installable; admin routes blocked | Play signing remains external |
| Database | Drizzle/MySQL/TiDB contract | Live migration, backup, restore and latency evidence required |
| Public edge | Nginx/TLS/DNS runbooks | VPS evidence required |
| OAuth | OAuth state and callback safeguards | Final-domain click-through required |
| AI media providers | Preview/provider-gated | Provider credentials, quota, storage, rights and human-review test required |
| Payments | Disabled | Merchant, webhook, refund, reconciliation and legal review required |
| 24/7 automation | Not present | Do not claim or enable through a compose overlay |
| Backup/restore | Contract and runbook | Isolated restore drill with RPO/RTO required |
| Real-device performance | Not measured here | Android physical-device test required |

## Recommended action

বর্তমান DSAI-কে **Bengali-first Controlled Alpha — release-ready foundation** হিসেবে deploy করা যায়, যদি operator external environment, database, TLS, OAuth, rollback এবং backup gates সম্পন্ন করেন। Supplied enterprise stack-কে “আগের Docker ZIP-এর সঙ্গে compose যোগ করলেই Production Grade Ready” বলা সঠিক নয়; সেটি একটি নতুন architecture migration এবং আলাদা project phase হবে।

এখন যোগ করা নিরাপদ বিষয় হলো: এই audit, capability matrix, non-secret evidence console, fail-closed provider boundaries, deployment runbook, release signing handoff এবং truthful UI labels। এখন যোগ করা নিরাপদ নয়: fake KPI, synthetic revenue/subscriber metrics, unverified Lighthouse score, autonomous publishing, invented reviews, placeholder provider success, বা unsupported Postgres/Redis/worker infrastructure-কে live feature হিসেবে দেখানো।

## Final operator evidence required

Public promotion-এর আগে operator-কে target VPS-এ deployment bundle চালিয়ে `/health`, `/healthz`, `/readyz`, systemd restart, Nginx upstream, DNS, TLS renewal, final-domain OAuth, database migration, backup restore, rollback এবং real-device route test-এর named evidence সংরক্ষণ করতে হবে। Play release-এর জন্য upload keystore আপনার নিয়ন্ত্রণে রাখতে হবে এবং signed AAB/APK-এর public certificate fingerprint Play Console-এ নথিভুক্ত করতে হবে। কোনো private key, password, database URL বা token evidence console, Git, ZIP বা chat-এ রাখা যাবে না।
