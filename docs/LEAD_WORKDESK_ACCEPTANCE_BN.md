# DSAI Lead Generation → Work Desk → Final Confirmation Acceptance

## Lead Generation
- বাংলা নির্দেশনা দিয়ে শুরু; দেশ/অঞ্চল অনুসন্ধান, লক্ষ্য ভাষা, audience, industry, business stage, goal, work region, offer, tone এবং channel নির্বাচন করা যায়।
- AI ব্যর্থ হলে কোনো বানানো draft দেখানো যাবে না।
- Draft preview, local save/reopen/delete, Excel export এবং CRM save থাকবে।
- CRM save-এর জন্য contact name এবং email/phone প্রয়োজন।
- Draft তৈরি করার সম্মতি ও customer contact consent আলাদা থাকবে।
- কোনো email/SMS/social message স্বয়ংক্রিয়ভাবে পাঠানো হবে না।

## Work Desk
- নিরাপত্তা স্ক্যান সফল না হলে uploaded file ব্যবহার করা যাবে না।
- Text-only task scanner ছাড়াই চলতে পারে; task status, retry, cancel এবং owner-scoped history থাকবে।
- TXT/CSV/JSON extraction; PDF/DOCX/XLSX/image OCR এখনো unsupported।
- AI result preview, copy, edit, authenticated server-side save এবং TXT download থাকবে। Edited result original AI result-কে overwrite করবে না; reload-এর পর saved edit পাওয়া যাবে.
- Extracted text copy ও TXT download করা যায়।

## Final customer acknowledgment
- সম্পূর্ণ final text snapshot-ই hash করা হয়; মূল PDF/ছবি ফাইলের byte hash নয়।
- One-time 256-bit token; database-এ raw token নয়, token hash থাকে।
- সাত দিনের expiry; owner daily cap 20।
- First view timestamp server-side; confirmation-এর আগে server-side minimum 3 seconds।
- Atomic one-time acknowledgment; replay returns already acknowledged.
- Audit event and immutable document SHA-256 retained.
- Recipient email is recorded but not verified; link is a bearer capability and must be shared manually.
- This is not identity verification, legal e-signature, or proof that the recipient read/understood the document.
- Feature remains disabled until staging, CI, security and legal acceptance pass.


## প্রাপক নিশ্চিতকরণে ৩-সেকেন্ডের নিয়ম
- নথির immutable snapshot পৃষ্ঠায় render হওয়ার পরই client `markViewed` mutation পাঠায়। তার আগে server timer শুরু হয় না।
- Server/database timestamp-ই চূড়ান্ত; browser clock বদলে আগে নিশ্চিত করা যায় না।
- এই নিয়মের regression test CI-তে চলবে; staging-এ network latency ও early-confirmation negative test এখনো প্রয়োজন।
