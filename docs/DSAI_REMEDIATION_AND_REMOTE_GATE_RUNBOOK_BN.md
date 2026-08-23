# DSAI Remediation ও Remote Gate Runbook

**তারিখ:** ২৩ আগস্ট ২০২৬  
**উদ্দেশ্য:** Project-side remediation সম্পন্ন করা এবং যেসব gate বাস্তব VPS/operator action ছাড়া যাচাই করা যায় না সেগুলো নিরাপদভাবে বন্ধ করা

## বর্তমান project-side remediation

DSAI source tree-তে capability status, evidence, privacy, developer environment boundary, changelog, multilingual lead composer, ৪০-market business form, live preview, local Excel export, Tactile Kinetic UI, network retry behavior এবং reusable lead-workflow skill যুক্ত আছে। Production build-এ lead composer-এর Excel library এখন user export action-এর সময় lazy-load হয়; Vite-এ stable React/tRPC/UI vendor chunks সংজ্ঞায়িত করা হয়েছে, যাতে initial bundle কমানো যায়।

## Remote gate-এর সঠিক অর্থ

| Gate | Project-side অবস্থা | VPS/operator প্রমাণ প্রয়োজন |
|---|---|---|
| Database | Drizzle/MySQL/TiDB contract আছে | Live connection, migration, backup/restore ও latency |
| Process | Launcher ও bundle আছে | systemd active, restart, logs, rollback |
| Public edge | Nginx/TLS handoff আছে | DNS, security group, UFW, Nginx upstream, certificate |
| OAuth | State/nonce ও route code আছে | Final-domain allowlist, login, callback, logout, revoke |
| Security | Secret separation ও validators আছে | Real `/etc/dsai/dsai.env` permissions, rotation, clean-room check |
| Media/providers | Planner ও provider-neutral contracts আছে | Provider sandbox, webhook, quota, moderation, storage, worker |
| Performance | Lazy route/vendor split ও build checks আছে | Real-device Web Vitals, p50/p95, error budget, load evidence |

## নিরাপদ operator sequence

প্রথমে protected environment file VPS-এ তৈরি বা যাচাই করতে হবে। Secret value chat, GitHub, ZIP, bundle বা browser client-এ paste করা যাবে না। File path হবে `/etc/dsai/dsai.env`, permission হবে `600`, এবং application user ছাড়া অন্য কারও read access থাকবে না।

দ্বিতীয় ধাপে checksum-verified credential-free bundle চালাতে হবে। Bundle environment file read করবে, release stage করবে, validation সফল না হলে আগের release রেখে দেবে, তারপর build ও local health route পরীক্ষা করবে। App port loopback-only থাকবে; public exposure Nginx 80/443-এর মাধ্যমে হবে।

তৃতীয় ধাপে non-mutating gate report চালাতে হবে। Report-এ secret value, token, password বা environment content print করা যাবে না। কেবল service status, route code, DNS/TLS status, port binding এবং pass/fail evidence প্রকাশ করা যাবে।

## Public promotion-এর আগে বাধ্যতামূলক stop conditions

Database readiness, public DNS/TLS/Nginx, final-domain OAuth, systemd rollback, backup/restore, provider callback, rate/quota ledger, malware scanning এবং real-device performance-এর প্রমাণ না পাওয়া পর্যন্ত DSAI-কে **Controlled Alpha** label-এ রাখতে হবে। Local `127.0.0.1` health pass কখনো public-domain readiness-এর বিকল্প নয়।

## Provider activation order

একসঙ্গে payment, media, CRM, messaging এবং calendar চালু করা যাবে না। প্রথমে একটি sandbox provider, একটি capability, সীমিত test user, explicit consent, signed callback, idempotency, quota ceiling, human review এবং rollback সহ চালাতে হবে। Evidence pass করলে পরবর্তী provider আলাদা change record-এ চালু হবে।

## সত্যিকারের completion evidence

প্রতিটি gate-এর জন্য timestamp, environment name, command result-এর non-secret summary, reviewer/operator, rollback point এবং pass/fail সিদ্ধান্ত সংরক্ষণ করতে হবে। Secret content বা raw environment dump evidence হিসেবে গ্রহণযোগ্য নয়।
