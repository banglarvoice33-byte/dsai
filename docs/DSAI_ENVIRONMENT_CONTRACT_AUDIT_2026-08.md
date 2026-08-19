# DSAI Environment Contract Audit — 2026-08

## উদ্দেশ্য

এই audit-এর উদ্দেশ্য ছিল সর্বশেষ release এবং তার পূর্ববর্তী release-গুলোর environment template, VPS setup helper, production validator, runtime mapping এবং deployment ordering মিলিয়ে দেখা। বিশেষভাবে যাচাই করা হয়েছে `DATABASE_URL` failure, Forge optionality, CAPTCHA optionality এবং পূর্ববর্তী process নিরাপদে রাখার বিষয়গুলো।

## প্রমাণিত মূল সমস্যা

প্রথমত, `scripts/setup-vps-env.mjs`-এ Forge values required তালিকায় ছিল, যদিও `.env.production.example`-এ Forge provider features-এর সঙ্গে যুক্ত এবং payment/media/provider activation gated হওয়ার কথা ছিল। ফলে provider credentials না থাকলেও setup unnecessarily আটকে যেতে পারত।

দ্বিতীয়ত, setup helper-এর default `DSAI_REQUIRE_FORGE=1` ছিল, কিন্তু validator strictness parent shell-এর `process.env` থেকে পড়ত। Environment file-এ `DSAI_REQUIRE_FORGE=1` লেখা থাকলেও validator parent shell-এ flag না থাকলে strict policy প্রয়োগ করত না। এটি একটি **file-to-validator policy mismatch**। এখন validator file value-কে অগ্রাধিকার দেয়।

তৃতীয়ত, validator-এর browser-secret detection `VITE_...KEY` pattern দিয়ে public Turnstile site key-কে ভুলভাবে secret হিসেবে reject করছিল। `VITE_CAPTCHA_SITE_KEY` browser-visible public site key; এটি server secret নয়। এখন এই public key এবং explicitly browser-safe frontend Forge key allowlist-এ আছে।

চতুর্থত, `deploy-genesis.sh` environment validation-এর আগে `stop_previous` চালাত। নতুন environment invalid হলে পুরোনো DSAI process অপ্রয়োজনীয়ভাবে বন্ধ হওয়ার ঝুঁকি ছিল। এখন validation সফল হওয়ার পরেই previous process stop করার ধাপ আসে।

পঞ্চমত, compile/build success এবং VPS runtime readiness আলাদা evidence হিসেবে যথেষ্ট স্পষ্টভাবে নথিবদ্ধ ছিল না। বর্তমান documentation-এ code/build/archive success, environment/database readiness, process health, proxy/TLS এবং OAuth evidence পৃথক launch gates হিসেবে চিহ্নিত করা হয়েছে।

## CAPTCHA policy-এর definitive সিদ্ধান্ত

CAPTCHA **public production-এর জন্য required এবং fail-closed**। এটি বর্তমান public login security boundary। কিন্তু CAPTCHA **private Controlled Alpha-এর জন্য optional** হতে পারে, যদি modeটি স্পষ্টভাবে `DSAI_RUNTIME_MODE=controlled-alpha`, `DSAI_PRIVATE_ALPHA=true` এবং `DSAI_PRIVATE_ALPHA_BIND=127.0.0.1` দিয়ে loopback-bound হয়। এই mode-এ public reverse proxy ব্যবহার করা যাবে না; এটি private/local testing-এর জন্য।

সুতরাং “CAPTCHA সম্পূর্ণ optional এবং public production-এও না থাকলেও deploy সফল হবে”—এটি সঠিক নয়। সঠিক contract হলো: public production-এ required; private loopback Controlled Alpha-তে optional।

## Implemented corrections

`setup-vps-env.mjs` এখন core keys সবসময় নেয়; Forge keys কেবল `DSAI_REQUIRE_FORGE=1` হলে নেয়; public production-এ CAPTCHA keys নেয়; private Controlled Alpha-তে CAPTCHA prompt বাদ দিতে পারে। `.env.production.example`-এ `DSAI_REQUIRE_FORGE=0` default করা হয়েছে এবং private-alpha fields documentation যোগ হয়েছে।

`validate-production-env.mjs` এখন environment file থেকেই `DSAI_REQUIRE_FORGE`, runtime mode, private-alpha flag এবং bind address পড়ে। Public production CAPTCHA ছাড়া fail করে; private loopback Controlled Alpha-তে CAPTCHA ছাড়া pass করতে পারে। Public site key ভুলভাবে secret হিসেবে reject হয় না।

`server/_core/env.ts` private-alpha mode শনাক্ত করে এবং `server/_core/index.ts` private-alpha হলে loopback bind করে। `deploy-genesis.sh` environment validation সফল হওয়ার আগে previous process stop করে না।

## Regression evidence

সংশোধনের পরে focused environment/deployment/CAPTCHA suite-এ 14 tests pass করেছে। TypeScript validation pass করেছে। Full project test suite এবং production build pass করেছে; accessibility automation `101 client files`-এ `5 checks` pass করেছে। CAPTCHA provider test-এর sandbox secret rejection একটি known external credential-quality warning; এটি code failure নয় এবং production credential rotation gate হিসেবে নথিবদ্ধ।

## Remaining gates

এই correction project-side consistency ঠিক করেছে; এটি remote VPS-এ populated environment, database connection, Nginx/TLS, public-domain route বা OAuth consent/revoke evidence তৈরি করে না। Public launch-এর আগে production CAPTCHA, database, OAuth এবং proxy/TLS gates সম্পূর্ণ করতে হবে। Private Controlled Alpha-তে no-CAPTCHA mode ব্যবহার করলে process loopback-এ রাখতে হবে এবং public Nginx route দিয়ে publish করা যাবে না।

## সিদ্ধান্ত

আগের environment file/validator/deployment contract পুরোপুরি internally consistent ছিল না। প্রধান ভুলগুলো ছিল Forge default অতিরিক্ত কঠোর হওয়া, validator-এর file policy না পড়া, public CAPTCHA site key false-positive, এবং validation-এর আগে old process stop করা। এগুলো এখন test-covered correction হিসেবে project-এ যুক্ত হয়েছে।
