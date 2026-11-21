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
- AI result preview, copy, in-session edit এবং TXT download থাকবে। In-session edit স্থায়ীভাবে server-এ save হয় না।
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
