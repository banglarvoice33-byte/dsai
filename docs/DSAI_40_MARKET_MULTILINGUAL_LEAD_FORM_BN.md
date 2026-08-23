# DSAI ৪০-মার্কেট Multilingual Business Lead Form

## উদ্দেশ্য

এই capability Bengali-first ব্যবহারকারীকে বাংলা, Banglish, English বা অন্য যেকোনো ভাষায় business brief লিখে target market-এর জন্য reviewable lead draft তৈরি করতে দেয়। Formটি lead generation-এর ভাষাগত ও business context প্রস্তুত করে; এটি recipient-এর ব্যক্তিগত তথ্য খুঁজে বের করে না এবং অনুমতি ছাড়া কোনো outreach পাঠায় না।

## Form workflow

| ধাপ | ব্যবহারকারীর কাজ | সিস্টেমের আচরণ |
|---|---|---|
| ১ | Priority market নির্বাচন | দেশ, default language, locale, currency, timezone এবং working-region-এর safe default দেখায়। |
| ২ | Brief লেখা | Source language `auto` রাখা যায়; Bengali/Banglish, Latin, Arabic, Cyrillic, Devanagari এবং Han-script-এর প্রাথমিক detection হয়। |
| ৩ | Business context দেওয়া | Industry, business stage, lead goal, audience, offer/value proposition এবং working region নেওয়া হয়। |
| ৪ | Style নির্বাচন | Professional, warm, concise বা community tone এবং email, SMS, social-DM বা phone-script channel বাছাই করা যায়। |
| ৫ | Consent দেওয়া | Explicit consent ছাড়া draft generation শুরু হয় না। |
| ৬ | Draft review | AI-assisted localized draft অথবা provider unavailable হলে deterministic fallback draft দেখায়। |

## Priority-market catalog

Catalog-এ ৪০টি curated market আছে: United States, Canada, United Kingdom, Australia, New Zealand, Germany, France, Italy, Spain, Portugal, Netherlands, Belgium, Switzerland, Sweden, Norway, Denmark, Ireland, Poland, Austria, Japan, South Korea, China, Singapore, Malaysia, United Arab Emirates, Saudi Arabia, Qatar, Kuwait, India, Bangladesh, Pakistan, Sri Lanka, South Africa, Nigeria, Kenya, Brazil, Mexico, Türkiye, Indonesia এবং Philippines। এটি product default catalog; users target country ও target language edit করতে পারেন, তাই catalog কোনো language restriction তৈরি করে না।

## Safety boundary

> এটি একটি draft composer, automatic outreach system নয়।

প্রতিটি result-এ human review requirement, recipient opt-out line এবং `outboundSendAllowed: false` contract থাকে। CRM write, email/SMS/social sending, calendar booking বা bulk campaign এই feature-এর অংশ নয়। Sensitive attribute, discriminatory targeting, fabricated company facts, invented contact details বা false claims তৈরি করার জন্য system design করা হয়নি।

## AI এবং fallback

Server-side `gpt-5-mini` structured output-এর মাধ্যমে target language-এ subject, greeting, body, call-to-action, opt-out এবং quality note তৈরি করে। Provider error, malformed output বা unavailable model হলে deterministic fallback ব্যবহার করা হয় এবং result-এ fallback provenance দেখানো হয়। User-এর brief সীমিত দৈর্ঘ্যে গ্রহণ করা হয়; output provider response-এর উপর নির্ভর করে quality check করা উচিত।

## Deployment status

Capabilityটি `/lead-composer` route-এ আছে এবং homepage-এর client-response section থেকে accessible। Current implementation stateless draft generation ব্যবহার করে; নতুন database migration প্রয়োজন হয়নি। Full test suite, TypeScript, production build এবং desktop/mobile preview validation সম্পন্ন হয়েছে।
