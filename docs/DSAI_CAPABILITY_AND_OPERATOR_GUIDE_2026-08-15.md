# DSAI Capability and Operator Guide

## Plain-language answer

DSAI এখন একটি Bengali-first AI Workdesk foundation। User-এর সাধারণ কাজের জন্য আলাদা API key লাগে না। User sign in করে UAA case draft বা Creative Studio brief queue করতে পারে। Operator যদি কোনো external provider connector চালু করতে চান, provider-এর key server-side secret manager বা `.env.production`-এ রাখতে হবে; browser, chat, Git repository, frontend code বা public form-এ API key কখনো দেওয়া যাবে না।

## Capability matrix

| User question | Current answer | Status |
|---|---|---|
| DSAI কীভাবে ব্যবহার করব? | Pathway map থেকে UAA বা Creative Studio বেছে নিন, protected workflow-এর জন্য sign in করুন, তারপর case draft বা creative brief queue করুন। | Implemented foundation |
| DSAI API key কী? | সাধারণ user-এর key লাগে না। Provider connector-এর key operator server-side secret হিসেবে রাখবেন এবং প্রয়োজনে rotate/revoke করবেন। | Safe guidance implemented; provider-specific keys gated |
| এক কমান্ডে deploy করা যায়? | First-time environment, database, domain/TLS এবং OAuth setup-এর পর `bash deploy-genesis.sh` dependency, build, port selection, restart এবং health check করে। | Implemented and smoke-tested |
| Super Agent কি live? | না। UAA, Creative queue এবং connector registry foundation আছে; 24/7 messaging, CRM, calendar, publishing এবং external actions live নয়। | Architecture/roadmap; provider and consent gates |
| Text-to-video কীভাবে তৈরি করব? | বর্তমান preview text-to-video engine চালায় না; Creative Studio brief queue করে। | Roadmap/provider gate |
| Live image generation কি আছে? | নেই; external image provider, quota, billing এবং provenance যুক্ত হয়নি। | Provider gate |
| API connector কি admin console থেকে যুক্ত করা যায়? | Registry state ও configuration visibility আছে, কিন্তু নতুন provider-এর server-side adapter, env declaration, credentials, webhook ও staging validation এখনও দরকার। | Implemented foundation, not arbitrary plug-and-play |

## One-command deployment

After uploading and extracting the credential-free release:

```bash
cd /path/to/genesis-platform-site
cp .env.production.example .env.production
chmod 600 .env.production
nano .env.production
bash deploy-genesis.sh
```

The first run still requires real production values for `DATABASE_URL`, `JWT_SECRET`, OAuth application values, database schema readiness, DNS/TLS, and reverse proxy configuration. The command cannot safely invent those values or create a mailbox/provider account. On later code updates, run the same `bash deploy-genesis.sh` command to reinstall locked dependencies if needed, rebuild, reuse the previous port where possible, restart the DSAI process, and probe `/healthz`; `/readyz` reports whether the database dependency is ready. Responses include an `X-Request-ID` correlation value for operator troubleshooting, while request bodies, prompts, documents, credentials, and query strings remain excluded from completion logs.

## API-key safety procedure

An operator should first create the provider account and restrict the key according to that provider’s own controls. Store the value only in the server secret manager or production environment. Use a least-privilege key, set spending/rate limits, record the provider and purpose, and test in a staging environment. If a key is exposed in a browser, chat, repository, screenshot, or log, revoke it immediately and issue a new key. DSAI should expose connector status and missing-variable state, not secret values.

The current connector layer recognizes examples such as Twilio, Google Calendar, Cal.com, CRM, and a media worker, but recognition is not the same as a live integration. Each connector still needs a server adapter, OAuth scopes or provider credentials, consent and opt-out behavior, webhook verification, audit logs, rate limits, failure handling, and a human approval policy before external actions are enabled.

## Super Agent status

The broad Super Agent architecture remains a roadmap. A production-grade agent would need a task model, durable queue, retry and idempotency rules, human approval checkpoints, consent records, provider adapters, webhook verification, audit logs, rate limits, opt-out handling, monitoring, rollback, and a process manager or always-on hosting choice. Until those are built and tested, DSAI must describe itself as a Workdesk foundation rather than an always-on autonomous operator.

## Text-to-video status

The current DSAI release does not create text-to-video output. To add it responsibly, implement a media provider adapter and worker, large-file storage, input validation, moderation, output provenance, usage quotas, billing/refunds, retry handling, job status UI, cancellation, access control, and human review for sensitive content. Then test provider credentials, cost ceilings, file-size limits, concurrency, failed jobs, and deletion/retention rules in staging before describing the feature as live.

## Operator launch gates

Before public promotion, verify final DNS and TLS, OAuth login persistence, database migration, contact mailbox delivery, Search Console/Bing property ownership, provider credentials, connector staging tests, and support/abuse handling. Do not claim Google, ChatGPT, or other platforms will automatically answer DSAI questions; publish clear crawlable Learn/FAQ content and submit the final sitemap, then measure actual discovery.
