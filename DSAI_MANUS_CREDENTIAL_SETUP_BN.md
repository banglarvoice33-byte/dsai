# DSAI Credentials and Legacy Manus Dependency Guide

এই নথি credential-সংক্রান্ত operational boundary নির্ধারণ করে। কোনো secret value GitHub, chat, screenshot, browser, frontend bundle বা log-এ রাখা যাবে না।

## 1. Primary authentication

DSAI account login-এর primary identity provider হলো **Supabase Auth**। Email/password signup, email confirmation, login, refresh ও logout Supabase Auth client দিয়ে পরিচালিত হয়। Manus OAuth variables Supabase login-এর জন্য প্রয়োজনীয় নয়।

## 2. Optional legacy Manus OAuth

নিচের variables কেবল legacy Manus callback/session বা external scheduled-task identity verification চালু থাকলে প্রয়োজন:

| Variable | ব্যবহার | প্রয়োজনীয়তা |
|---|---|---|
| `VITE_APP_ID` | Legacy Manus application identity | Optional |
| `OAUTH_SERVER_URL` | Legacy OAuth token exchange এবং Manus JWT task identity lookup | Optional |
| `VITE_OAUTH_PORTAL_URL` | Legacy browser OAuth portal | Optional |

বর্তমান code-এ `/api/oauth/callback` route আছে, কিন্তু `OAUTH_SERVER_URL` এবং `VITE_APP_ID` না থাকলে callback disabled থাকে। Legacy Manus JWT verification ছাড়া `/api/scheduled/cleanupFileAssets` cron request গ্রহণ করা হয় না। Repository `vercel.json` বা GitHub workflows-এ কোনো Vercel Cron schedule নেই; বাহ্যিক Manus scheduler আছে কি না তা account/dashboard থেকে নিশ্চিত করতে হবে। তাই cron verifier এখনই মুছে ফেলা হয়নি।

**কোনো placeholder URL বা fake application ID যোগ করবেন না।** External scheduler/legacy session ব্যবহার না হলে এই তিনটি variable unset রাখুন। ব্যবহার প্রমাণিত হলে exact provider-issued values secret manager-এ provision করুন এবং callback/state/task identity/rollback পরীক্ষা করুন।

## 3. Forge image-generation credentials — Manus OAuth থেকে আলাদা

`BUILT_IN_FORGE_API_URL` এবং `BUILT_IN_FORGE_API_KEY` হলো server-side Forge ImageService credentials। `server/_core/imageGeneration.ts`-এ image generation এবং model listing-এর জন্য এগুলো সরাসরি ব্যবহৃত হয়।

এগুলো Manus account login-এর credential নয়। DSAI-এর Creative Studio image generation যদি Forge service-এর ওপর নির্ভর করে, তাহলে যাচাই ছাড়া এগুলো remove/rotate করবেন না। `DSAI_REQUIRE_FORGE=1` হলে production environment validator দুটো value বাধ্যতামূলক করে; অন্যথায় অনুপস্থিত থাকলে Forge-backed features gated থাকে।

## 4. Core production environment

বর্তমান VPS template-এ database URL PostgreSQL format-এ হতে হবে:

```dotenv
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>?sslmode=require
JWT_SECRET=<server-only-random-secret>
```

Public production login protection-এর জন্য active hostname অনুযায়ী Turnstile site key, server secret এবং hostname configure করতে হবে। Secret value কখনো browser-এ পাঠানো যাবে না।

## 5. Safe provisioning and validation

- Production environment file application tree-এর বাইরে রাখুন এবং permission `600` নিশ্চিত করুন।
- Vercel/Supabase secrets কেবল তাদের নিজ নিজ dashboard/secret manager-এ রাখুন।
- `node scripts/validate-production-env.mjs <env-file>` দিয়ে name/value format ও required core settings validate করুন; script secret values print করে না।
- `node scripts/preflight-dsai.mjs <env-file>` core settings ও optional integrations-এর presence report করে।
- Supabase Auth primary flow পরীক্ষা না করে OAuth বা Forge configuration পরিবর্তন করবেন না।
- Key exposed হলে সংশ্লিষ্ট provider dashboard-এ rotate/revoke করুন; কখনো existing working key অনুমান করে মুছবেন না।
