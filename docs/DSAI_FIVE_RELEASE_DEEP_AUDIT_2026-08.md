# DSAI Latest Five-Release Deep Audit — 2026-08

## Audit scope

এই audit-এ সর্বশেষ পাঁচটি project checkpoint এবং সংশ্লিষ্ট credential-free release handoff-এর ধারাবাহিকতা পর্যালোচনা করা হয়েছে। তুলনার কেন্দ্র ছিল environment contract, deployment scripts, path assumptions, CAPTCHA policy, OAuth provenance, frontend/backend claims এবং compile/build বনাম VPS runtime evidence।

## Release progression

| পর্যায় | মূল পরিবর্তন | প্রমাণিত ফল | অবশিষ্ট সীমা |
|---|---|---|---|
| `3543b5f1` | Clean-room handoff, checksum wrapper, environment preflight | Wrapper stale checksum coupling সরানো হয়; archive integrity pass | CAPTCHA sandbox credential rejection external gate হিসেবে থাকে |
| `6fa93e2d` | First-100 student pilot contract | 100 seats, 30 days, 20/day, 300/month, manual review এবং safety rules স্পষ্ট | Pilot approval ও production database/provider execution operator-gated |
| `142f615a` | Try First guest demo | No-login bounded planning, no persistence, no provider call, in-memory rate limit | এটি live media generation নয় |
| `e3e75a28` | Creative Studio scope correction | Text-to-image = 2–3 variations; text-to-video = 1 plan; image-to-video = 1 source image plan | Actual rendering/provider/storage/export এখনও gated |
| `f4d676fe` / `2e67812e` / `1eba2892` / `9522fd32` / `d00a6abd` | Final go-live audit এবং VPS-only command handoff | Domain 404, archive path, checksum, Nginx, OAuth এবং database gates আলাদা করা হয়; copy-paste VPS sequence তৈরি | Remote VPS-এ এই sandbox থেকে command execution হয়নি |

## Root causes found

সবচেয়ে গুরুত্বপূর্ণ stale-information ছিল build success-কে runtime success হিসেবে ব্যাখ্যা করা। Production build এবং 100+ tests pass করলেও `DATABASE_URL`, process environment, Nginx upstream, TLS, DNS এবং OAuth callback allowlist remote VPS evidence ছাড়া প্রমাণিত হয় না। দ্বিতীয় root cause ছিল credential-free archive-এ secret absence-কে deployment-ready environment উপস্থিতি হিসেবে ধরে নেওয়া; বর্তমান archive ইচ্ছাকৃতভাবে secret-free।

Environment-layer-এ Forge provider credentials default-এ অতিরিক্ত কঠোর ছিল; validator environment file-এর `DSAI_REQUIRE_FORGE` না পড়ে parent shell-এ নির্ভর করত; এবং `VITE_CAPTCHA_SITE_KEY` public browser key হওয়া সত্ত্বেও secret detector false-positive দিত। Deployment-layer-এ environment validation-এর আগে previous process stop হওয়ার ঝুঁকি ছিল। এই চারটি correction এখন code, documentation এবং regression test-এ যুক্ত।

## CAPTCHA decision

Public production-এ CAPTCHA required এবং fail-closed। No-CAPTCHA কেবল `controlled-alpha + DSAI_PRIVATE_ALPHA=true + 127.0.0.1` loopback mode-এ অনুমোদিত। Private Alpha-কে public Nginx বা public IP-তে expose করা যাবে না। এই distinction-ই পূর্ববর্তী “optional” ভাষার সঠিক, নিরাপদ ব্যাখ্যা।

## Current release evidence

সর্বশেষ refreshed archive-এর SHA-256 হলো `76c2bc27d68087348ea115b1b841ec4119adcba82d0b4ce95846b4639aaf2d3c`; archive size `718817` bytes। 110 Vitest tests, TypeScript, accessibility contract, shell/Node syntax এবং ZIP integrity pass করেছে। Release-এ কোনো real `.env.production`, private key, credential artifact, `node_modules`, `dist`, `.git` বা runtime state নেই।

## Final classification

| স্তর | বর্তমান অবস্থা |
|---|---|
| Source, UI, tRPC contracts, governance, scholarship copy, Try First, Creative preview | Implemented / preview-ready |
| Provider-backed media rendering, live payment, CRM/Calendar execution, Google/HubSpot grant flow | Provider/operator-gated |
| Public VPS service, database connection, process supervision, Nginx/TLS, DNS, OAuth callback persistence | Unverified external gate |
| Public no-CAPTCHA deployment | Not allowed |
| Private loopback Controlled Alpha without CAPTCHA | Allowed only with the documented bind policy |

## Recommended closure order

প্রথমে VPS-এ refreshed archive এবং manifest upload করে checksum verify করতে হবে। এরপর timestamped extraction, bootstrap, `/etc/dsai/dsai.env` creation, environment validation এবং local health pass করতে হবে। তারপর process supervision, Nginx SPA history fallback, DNS/TLS, public `/auth/login`, OAuth callback allowlist এবং database readiness আলাদাভাবে verify করতে হবে। কোনো ধাপে failure হলে legacy process বন্ধ না করে rollback বা correction করতে হবে।
