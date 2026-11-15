# DSAI ব্যবহার নির্দেশিকা ও Production Acceptance Report

> **ঐতিহাসিক রিপোর্ট:** এই নথির Production verification snapshot ১২ নভেম্বর ২০২৬-এর। Authentication, Creative Studio ও বর্তমান UI/backend capability-র কিছু তথ্য পরে পরিবর্তিত হয়েছে। ১৫ নভেম্বরের নতুন source/configuration audit-এর জন্য [DSAI User-Friendly & Production Capability Audit](./DSAI_USER_FRIENDLY_ACCEPTANCE_AUDIT_2026-11-15_BN.md) দেখুন। পুরোনো এই রিপোর্টকে বর্তমান Production status হিসেবে ব্যবহার করবেন না।


**তারিখ:** ১২ নভেম্বর ২০২৬  
**Production:** https://dsai-one.vercel.app  
**Repository:** https://github.com/banglarvoice33-byte/dsai  
**Branch:** main  
**Verified commit:** 9974eaf5714f545b8ebabec0d083942efe11934b

---

## ১. DSAI কী এবং কার কাজে লাগে

DSAI হলো Bengali-first AI Workdesk। এর উদ্দেশ্য হলো জটিল তথ্য, ফর্ম, ব্যবসায়িক brief ও creative ধারণাকে সহজ ভাষায় বোঝা, পরিকল্পনা করা এবং মানুষের review-এর জন্য ব্যবহারযোগ্য draft/checklist তৈরি করা।

এটি এখনই কোনো স্বয়ংক্রিয় সরকারি আবেদন জমা দেওয়ার ব্যবস্থা, CRM-এ গ্রাহককে message পাঠানোর ব্যবস্থা, অথবা live image/video rendering service নয়। ঝুঁকিপূর্ণ কাজ user-এর অনুমোদন ও human review ছাড়া submit করার কথা নয়।

### ব্যবহারকারীর বাস্তব সুবিধা

- **বাংলায় শুরু করা:** ব্যবহারকারী নিজের ভাষায় কাজের বিবরণ লিখতে পারেন; প্রয়োজনমতো bilingual output পেতে পারেন।
- **পরবর্তী ধাপ পরিষ্কার করা:** বড় কাজকে ছোট checklist ও draft-এ ভাঙতে সাহায্য করে।
- **বিভিন্ন বাজারে যোগাযোগ:** Lead Composer-এ market/language context অনুযায়ী outreach draft তৈরি করা যায়।
- **সময় বাঁচানো:** একই brief থেকে subject, body, CTA-সহ একাধিক localized draft তৈরি করা যায়।
- **নিজের নিয়ন্ত্রণ বজায় রাখা:** draft তৈরি মানেই email, social post বা অন্য external action পাঠানো নয়।
- **সীমা সম্পর্কে স্বচ্ছতা:** কোন feature preview, কোনটি provider-backed, এবং কোনটি এখনো unavailable তা interface-এ প্রকাশ করা হয়।

## ২. প্রথমবার ব্যবহার: account ছাড়াই

1. [DSAI Production](https://dsai-one.vercel.app) খুলুন।
2. **Try First** নির্বাচন করুন অথবা সরাসরি [Try First page](https://dsai-one.vercel.app/try-first) খুলুন।
3. নিজের কাজটি সংক্ষেপে লিখুন। উদাহরণ: “একটি সরকারি ফর্ম বুঝে আমার করণীয় checklist বানাতে চাই।”
4. চাইলে page-এর example prompt ব্যবহার করুন।
5. **আমার preview দেখান** চাপুন।
6. তৈরি হওয়া work plan পড়ে দেখুন; ভুল বা অসম্পূর্ণ তথ্য থাকলে নিজের মতো সংশোধন করুন।

**গুরুত্বপূর্ণ:** Try First একটি local/deterministic preview। এটি আপনার brief থেকে workflow-এর নমুনা দেখায়; এটি authenticated private workspace বা live external AI action নয়।

## ৩. AI Lead Composer ব্যবহার

1. [Lead Composer](https://dsai-one.vercel.app/lead-composer) খুলুন।
2. আপনার উদ্দেশ্য ও business context লিখুন।
3. প্রয়োজনীয় market/region এবং ভাষা নির্বাচন করুন।
4. desired outcome, offer বা call-to-action নির্দিষ্ট করুন।
5. প্রয়োজনীয় consent/opt-out setting পরীক্ষা করুন।
6. **Localized draft তৈরি করুন** চাপুন।
7. তৈরি হওয়া subject, message body ও CTA যাচাই করে নিজের মতো সম্পাদনা করুন।
8. প্রয়োজনমতো copy বা export ব্যবহার করুন।

### Lead Composer কী কাজে আসে

- একই outreach brief বিভিন্ন market-এর উপযোগী ভাষায় সাজাতে;
- subject line, message body এবং CTA-এর প্রথম draft পেতে;
- যোগাযোগের আগে opt-out/consent reminder মাথায় রাখতে;
- বারবার একই ধরনের লেখা হাতে তৈরি করার সময় কমাতে।

### বর্তমান সীমা

- OpenRouter-backed generation Production-এ চালু ও বাস্তবে পরীক্ষা করা হয়েছে।
- বর্তমান database-backed quota: প্রতি IP-তে ১০ মিনিটে সর্বোচ্চ ৫টি provider request।
- quota শেষ হলে নিরাপদ fallback ব্যবহৃত হয়।
- Lead Composer নিজে থেকে email, SMS, WhatsApp বা social post পাঠায় না। তৈরি হওয়া লেখা user-এর review-এর জন্য draft।

## ৪. Creative Studio ব্যবহার

1. [Creative Studio](https://dsai-one.vercel.app/creative-studio) খুলুন।
2. একটি mode বেছে নিন:
   - Text → Images plan
   - Text → Video plan
   - Image → Video plan
3. আপনার visual brief লিখুন।
4. source image ব্যবহার করলে সেটির অধিকার/অনুমতি আপনার আছে কি না নিশ্চিত করুন।
5. **Preview plan তৈরি করুন** চাপুন।
6. পরিকল্পনা ও blocked reason দেখুন।

**বর্তমান সীমা:** Creative Studio এখন prompt ও output plan তৈরি করে; এটি এখনো বাস্তব image/video ফাইল render করে না। কোনো MP4/PNG output তৈরি হয়েছে বলে ধরে নেবেন না।

## ৫. অন্যান্য পৃষ্ঠা

| পৃষ্ঠা | ব্যবহার |
|---|---|
| [Capabilities](https://dsai-one.vercel.app/capabilities) | কোন কাজ কতটা প্রস্তুত, কোনটি preview/provider-gated তা বোঝা |
| [Scholarship](https://dsai-one.vercel.app/scholarship) | Student Pro ও scholarship-সম্পর্কিত তথ্য দেখা; live application availability আলাদাভাবে যাচাই করতে হবে |
| [Governance](https://dsai-one.vercel.app/governance) | দায়িত্বশীল ব্যবহার, AI output যাচাই ও human review-এর নীতি পড়া |
| [Privacy](https://dsai-one.vercel.app/privacy) | privacy এবং data-rights সংক্রান্ত তথ্য দেখা |
| [Changelog](https://dsai-one.vercel.app/changelog) | পণ্যের পরিবর্তন ও release history দেখা |

## ৬. Sign-in, Workspace ও Admin: বর্তমান অবস্থা

**এগুলো এখনো ব্যবহারযোগ্য account workflow হিসেবে চালু নয়।**

Production /auth/login পৃষ্ঠা স্পষ্টভাবে জানায় যে OAuth portal URL ও application ID configure করা হয়নি; CAPTCHA-র site key এবং server-side verification secret-ও অনুপস্থিত। তাই private Workspace-এ account দিয়ে প্রবেশ করা বর্তমানে সম্ভব নয়। Admin dashboard-ও authenticated access চায়।

Supabase Production database-এ বর্তমানে auth.users-এর সংখ্যা ০। অর্থাৎ Supabase Auth-কে এখনো DSAI-এর কার্যকর sign-in/session system হিসেবে সংযুক্ত করা হয়নি।

### নির্ভরযোগ্য সমাধান কী

DSAI-এর জন্য প্রস্তাবিত বাস্তব পথ হলো Manus OAuth dependency বাদ দিয়ে Supabase Auth Email OTP/Magic Link-কে application-এর user/session model-এর সঙ্গে নিরাপদে integrate করা। কিন্তু production email verification-এর জন্য Supabase-এর default SMTP যথেষ্ট নয়: এটি শুধু project team-এর pre-authorized email-এ পাঠায় এবং বর্তমানে প্রতি project-এ ঘণ্টায় ২টি email-এ সীমিত; production-এর জন্য custom SMTP বা Send Email Hook প্রয়োজন। তাই SMTP provider-এর account/credentials ও sender-domain configuration ছাড়া সকল ব্যবহারকারীর email verification চালু করা সম্ভব নয়।

Official references:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/quickstarts/react

**কোনো API key, SMTP password বা OAuth secret public chat, GitHub source বা browser-side environment variable-এ দেবেন না।**

## ৭. Production verification — ১২ নভেম্বর ২০২৬

| পরীক্ষা | ফলাফল | প্রমাণ/ব্যাখ্যা |
|---|---|---|
| Vercel Production deployment | PASS | Commit 9974eaf… deployment READY; production alias dsai-one.vercel.app সংযুক্ত |
| TypeScript | PASS | pnpm run check exit 0 |
| Unit/integration test suite | PASS | 51 test files, 161 tests passed |
| Accessibility contract | PASS | 5 automated checks, 103 client files |
| Production build | PASS | Vite build ও server bundle সফল |
| Health endpoint | PASS | /healthz HTTP 200 |
| Readiness endpoint | PASS | /readyz HTTP 200; database configured/handle checks true |
| Header responsive overflow | PASS | 1440, 1280, 1240, 1230, 1200, 1150, 1120, 1024, 960, 901, 900, 768 ও 390px-এ horizontal overflow পাওয়া যায়নি |
| Public page smoke test | PASS | Home, Try First, Lead Composer, Creative Studio, Capabilities, Scholarship, Login, Workspace ও Admin routes HTTP 200 |
| OpenRouter Lead Composer | PASS | আগের live test-এ actual provider response ও quota/fallback behavior যাচাই |
| Account registration/login | NOT PASS | OAuth/CAPTCHA config অনুপস্থিত; Supabase Auth integration হয়নি |
| Private Workspace data workflow | NOT PASS | কার্যকর authenticated user/session নেই |
| Real image/video rendering | NOT PASS | provider-gated preview; output file নেই |
| End-to-end real device acceptance | NOT VERIFIED | automated browser checks হয়েছে; বাস্তব Android/iOS device acceptance হয়নি |
| Billing, external CRM/social sending | NOT ENABLED | production external write path চালু নয় |

### Database security note

Supabase security advisor ২১টি RLS-enabled table-এ policy নেই বলে INFO notice দিয়েছে। বর্তমান schema deny-by-default; anon/authenticated-কে blanket access দেওয়া নিরাপদ সমাধান নয়। User ownership, authenticated identity mapping এবং exact CRUD needs নির্ধারণ না করে broad RLS policy যোগ করা হবে না।

## ৮. ব্যবহারকারীর জন্য নিরাপত্তা নির্দেশনা

- AI-generated লেখা/তথ্য যাচাই করে ব্যবহার করুন।
- জাতীয় পরিচয়পত্র, পাসওয়ার্ড, ব্যাংক তথ্য বা অন্য sensitive personal data অপ্রয়োজনে দেবেন না।
- কোনো সরকারি/আইনি/চিকিৎসা/আর্থিক সিদ্ধান্তে AI output-কে professional advice ধরে নেবেন না।
- draft তৈরি হওয়া মানে সেটি পাঠানো বা জমা দেওয়া হয়নি।
- Creative Studio-তে অন্যের ছবি/লোগো/কপিরাইটযুক্ত asset ব্যবহারের আগে অনুমতি নিশ্চিত করুন।
- account login চালু না হওয়া পর্যন্ত private workflow-এ confidential data জমা দেবেন না।

## ৯. চূড়ান্ত সিদ্ধান্ত

DSAI-এর Production deployment, build, automated test suite, accessibility contract, public route smoke test এবং responsive header correction যাচাই করা হয়েছে। Bengali-first public pages ও OpenRouter-backed Lead Composer ব্যবহারযোগ্য।

তবে **DSAI-কে এখনই ১০০% সম্পূর্ণ, account-enabled বা media-generation-ready SaaS বলা যাবে না**। Sign-in, private workspace, real image/video generation, external integrations এবং real-device acceptance এখনও অসম্পূর্ণ। এই সীমাগুলো গোপন না করে প্রকাশ করা হয়েছে যাতে ব্যবহারকারী জানেন কোন কাজ এখনই করতে পারবেন এবং কোনটির জন্য পরবর্তী activation দরকার।
