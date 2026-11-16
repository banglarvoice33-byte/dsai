# DSAI User-Friendly & Production Capability Audit
**তারিখ:** ১৫ নভেম্বর ২০২৬  
**Production:** https://dsai-one.vercel.app  
**Repository:** https://github.com/banglarvoice33-byte/dsai  
**Audit branch:** `audit/production-stub-guard`  
**Audit purpose:** ব্যবহারকারী নিজের প্রয়োজনীয় কাজ খুঁজে পায় কি না, সংশ্লিষ্ট action দৃশ্যমান কি না, এবং backend-এ কী বাস্তবে configured/verified—তা আলাদা করে নথিবদ্ধ করা।

> **সতর্কতা:** Source/UI-তে কোনো action থাকা মানেই সেটি end-to-end Production-এ সফল—এমন নয়। এই রিপোর্টে UI inventory, configuration evidence, browser smoke, এবং authenticated user acceptance আলাদা রাখা হয়েছে।

## 1. ব্যবহারকারীর জন্য প্রধান প্রবেশপথ

| ব্যবহারকারীর লক্ষ্য | দৃশ্যমান প্রবেশপথ | কী করতে পারে | সীমা / যাচাই |
|---|---|---|---|
| প্রথমবার DSAI বোঝা | Home → Try First | account/document ছাড়াই sample work-plan preview | deterministic local preview; live AI/provider action নয় |
| কোনো বিষয়ে AI draft | Lead Composer | market, audience, language ও brief দিয়ে localized draft তৈরি; copy/save | OpenRouter-backed provider path configured; draft নিজে থেকে email/SMS/social-এ পাঠায় না |
| ছবি তৈরি | Creative Studio | prompt, generate, private history, refresh ও download | Agnes provider first, Cloudflare Workers AI fallback; production request/actual generated artifact এই audit-এ invoke করা হয়নি |
| নিজের কাজ গুছানো | Workspace | overview, AI assistance, Access cases, Creative briefs | authenticated account/session প্রয়োজন |
| ফাইল রাখা | Workspace → Documents | PDF/DOCX/XLSX/CSV/TXT/JSON/JPG/PNG/WebP/ZIP upload, list, download, delete | 10 MiB max; private storage; malware scan unavailable in Production |
| সরকারি সেবা / tender | Workspace → সরকারি সেবা | search, category filter, checklist, Workdesk-এ সংরক্ষণ, official portal open | DSAI official submission/payment/status system নয় |
| Student Pro / scholarship | Scholarship | eligibility information ও manual-review application | 18+ attestation; admin review; approval guaranteed নয় |
| ডেটা অধিকার | Workspace → ডেটা অধিকার / Privacy | privacy, deletion request ও data-rights guidance | request submit/processing live E2E আলাদা যাচাই দরকার |

## 2. Home page-এ কীভাবে কাজ খুঁজবেন

- Bengali/English language toggle এবং theme toggle আছে।
- Header navigation-এ Workflows, Creative Studio, Student Pro, Learn, Workspace ও Document Upload আছে।
- Search combobox বাংলা/Banglish/English query ও suggestion দিয়ে Try First, UAA workflow, Creative Studio, Privacy, Evidence, Governance, Plans ইত্যাদি খুঁজতে সাহায্য করে।
- Mobile navigation আলাদা menu হিসেবে খোলে।
- Search suggestion না পেলে Learn page-এর link দেখায়।

**ব্যবহারযোগ্যতার পর্যবেক্ষণ:** প্রথমবারের ব্যবহারকারীর জন্য Try First একটি নিরাপদ entry point; কিন্তু private কাজের জন্য login দরকার। Home-এর CTA-তে সেই পার্থক্য পরিষ্কার রাখা জরুরি।

## 3. Workspace-এর ভিতরের কার্যকর কাজের বিভাগ

Workspace-এর navigation-এ পাঁচটি section আছে:

1. **সারাংশ:** কাজের সংখ্যা, AI assistance, Access case, Creative brief, সরকারি সেবা এবং Document upload-এর shortcut।
2. **Access cases:** Notice/form/document-ভিত্তিক কাজের নাম দিয়ে draft case তৈরি ও তালিকা দেখা।
3. **Creative brief:** ছবি/creative ধারণা লিখে সংরক্ষণ; actual image generation-এর জন্য Creative Studio-তে যেতে হয়।
4. **সরকারি সেবা:** বিভাগ ও keyword দিয়ে সরকারি portal খোঁজা; preparation checklist ও Workdesk-এ যোগ করার action।
5. **Documents:** private upload/list/download/delete।

সরকারি সেবার UI স্পষ্টভাবে জানায় যে OTP, payment, tender submission, application এবং final approval সংশ্লিষ্ট সরকারি portal-এই করতে হবে। এটি সঠিক expectation-setting।

## 4. Document upload — ব্যবহারকারীর বাস্তব সুবিধা ও সীমা

- Supported: PDF, DOCX, XLSX, CSV, TXT, JSON, JPG, JPEG, PNG, WebP, ZIP।
- Max file size: 10 MiB।
- Production Vercel-এ R2 configuration আছে: bucket `dsai-user-file`, prefix `DSAI`, provider mode `auto`।
- UI-তে upload progress, saved files, refresh, download, delete এবং retention expiry দেখানোর ব্যবস্থা আছে।
- Production-এ malware scanner URL/API key নেই। এখন finalize endpoint HTTP 503 দিয়ে file private quarantine-এ রাখে; antivirus scan ছাড়া download বা AI processing হয় না।
- Live `file_assets` table-এ বর্তমানে ০টি row; বাস্তব user upload এখনো প্রমাণিত হয়নি। Legacy `validated` row থাকলেও সেটি download করা যাবে না।
- Upload feature OCR, document parsing, document Q&A বা automatic summary করে—এমন দাবি করা যাবে না।

**বর্তমান নিরাপত্তা আচরণ:** শুধু `Clean (ClamAV scan passed)` ফাইলেই Download দেখা যায়। `Quarantine` এবং legacy `Validated` ফাইল private থাকে; scanner unavailable হলে finalize 503 দেয় এবং download/AI processing বন্ধ থাকে।

## 5. AI ও Creative Studio — capability boundary

### Lead Composer / Workspace AI
- Production-এ `AI_PROVIDERS_ENABLED=true` এবং OpenRouter Vault secret entry আছে।
- Lead Composer-এর documented quota: প্রতি IP-তে ১০ মিনিটে সর্বোচ্চ ৫টি provider request।
- No live provider request was made during this audit; current reachability, latency, cost and response quality are not re-certified here.
- Generated content remains a draft; external sending is not enabled by the draft button.

### Creative Studio
- Current `CreativeStudio.tsx` has an actual image-generation action, saved image history, refresh and download path.
- Production Supabase Edge Function `dsai-image-generate` is ACTIVE (v12, JWT required).
- UI displays daily image quota (2 per user) and shared daily account cap (500).
- Provider call was intentionally not triggered in this audit to avoid unapproved external/billable generation.
- Video plan preview is not equivalent to a rendered MP4. No live video-rendering acceptance is claimed.

## 6. Authentication and privacy boundary

- Login/signup uses Supabase Auth password endpoints and Turnstile token verification.
- Production Vercel configuration includes `VITE_CAPTCHA_SITE_KEY`, `CAPTCHA_SECRET_KEY`, `CAPTCHA_ENABLED`, and `CAPTCHA_ALLOWED_HOSTNAME` for the canonical Production host.
- Production Supabase `auth.users` currently contains 1 account record (count only; no identity details accessed).
- This audit did not use a test user's credentials, submit CAPTCHA, create another account, or assert that an authenticated login succeeded.
- Guest/anonymous sessions are temporary and may be lost if browser data is cleared or another device is used.
- Private Workspace and document actions must remain protected by authenticated owner checks.

**Important:** A configured login screen is not proof of successful registration, email confirmation, login, token refresh, logout, or cross-user isolation. Those require authenticated browser tests.

## 7. Browser acceptance added to PR #26

The CI browser script uses real headless Chromium against the canonical Production URL and now covers:

- 20 public/user-facing routes: Home, Learn, Developer, Method, Platform, Workspace, Documents, Scholarship, Login, Signup, Quality Gates, Creative Studio, Capabilities, Plans, Try First, Lead Composer, Evidence, Privacy, Governance and Changelog.
- Desktop and 390px mobile viewport.
- Horizontal overflow check on every mobile route.
- Homepage search → Try First navigation.
- Mobile menu → Workspace navigation.
- Login form and Turnstile widget mount.
- `/healthz` and `/readyz`.
- Unauthenticated upload-init, finalize, download and delete requests must return HTTP 401.

This browser test does **not** submit login credentials or CAPTCHA, upload a real file, download an owned file, delete a real user object, or test cross-user isolation.

## 8. Acceptance status

| Area | Status | Meaning |
|---|---|---|
| Source/UI navigation inventory | Reviewed | Main user-facing routes and primary actions identified |
| Production R2 configuration | Configured | Does not itself prove a successful user upload |
| Production Turnstile configuration | Configured | Does not itself prove successful login |
| Text AI provider configuration | Configured | No live completion invoked in this audit |
| Image-generation function | Active | No paid/provider image generation invoked |
| Production antivirus scanner | Not configured | Do not call validated files antivirus-clean |
| Static stub guard / TypeScript / accessibility / unit tests / build | Passed on prior PR head | New head still requires complete CI |
| Chromium browser acceptance | Pending | Runner pinned to Ubuntu 24.04 after the previous runner-image failure |
| Authenticated upload/download/delete lifecycle | Not verified | Requires controlled test account and harmless test file |
| Cross-user isolation | Not verified | Requires two test accounts |
| Android Chrome real-device UAT | Not verified | Desktop/mobile viewport simulation is not a physical device |
| Government portal transaction integration | Not implemented | User completes official transaction on official portal |
| OCR/document Q&A | Not verified / not exposed as a live workflow | Do not promise this capability |
| Live video rendering | Not verified | Preview plan is not an MP4 output |

## 9. Release gates before declaring the website fully user-ready

1. Complete the current PR #26 CI run, including Chromium and Docker/ClamAV tests.
2. Complete controlled authenticated browser acceptance: signup, email verification, login, refresh, logout and return-to-route.
3. Use two dedicated test accounts to prove file owner isolation.
4. Upload one harmless file, list it, download and hash-compare bytes, delete it, then confirm object and metadata cleanup.
5. Test scanner-unavailable behavior and ensure `validated` is never presented as `clean`.
6. Test AI timeout, provider-disabled, quota-exhausted and malformed-response UX.
7. Test image generation only with explicit budget/usage authorization; confirm stored image and download path.
8. Test Android Chrome on a real device.
9. Confirm all user-visible unavailable/preview/provider-gated actions explain what the user can do next.
10. Only merge/deploy after CI passes and the authenticated UAT evidence is attached to the release.

## Final assessment

DSAI-এর প্রধান user journeys ও তাদের UI entry points আছে; Home search, Workspace shortcuts, document panel এবং government-service preparation flow-তে বাস্তব action রয়েছে। তবে সব feature সমানভাবে complete নয়। Production configuration থাকা, source code-এ action থাকা, browser route render হওয়া এবং authenticated user-এর কাজ সফল হওয়া—এগুলো আলাদা acceptance স্তর।

এই audit অনুযায়ী DSAI-কে এখনই 100% complete user-ready SaaS বলা যাবে না। PR #26-এর পরবর্তী CI ও authenticated UAT-ই সেই দাবির জন্য প্রয়োজনীয় প্রমাণ তৈরি করবে।
