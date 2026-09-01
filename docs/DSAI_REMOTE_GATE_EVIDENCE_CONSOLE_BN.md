# DSAI Remote Gate Evidence Console

## উদ্দেশ্য

`/admin/gate-evidence` হলো admin-only একটি operator handoff surface। এখানে VPS/public edge, Google Play signing, OAuth, database, provider, backup এবং physical-device test-এর **sanitized evidence** draft করা যায়। এটি কোনো secret manager নয় এবং এটি নিজে থেকে deployment, signing, provider activation বা production approval সম্পন্ন করে না।

## কী রাখা যাবে

Public certificate fingerprint, public endpoint-এর status, HTTP result, app version, device model, sanitized test note এবং evidence timestamp রাখা যাবে। Play keystore-এর private file, password বা private key এখানে রাখা যাবে না। VPS-এর ক্ষেত্রে command output থেকে কেবল public status বা redacted result লিখতে হবে। Database-এর ক্ষেত্রে connection string নয়, কেবল `/readyz` বা equivalent machine-readable result লিখতে হবে।

| Gate | নিরাপদে যোগ করা যায় | যোগ করা যাবে না |
|---|---|---|
| Play signing | Public certificate fingerprint, package ID, track | Keystore file, password, private key |
| VPS/public edge | Public URL, HTTP status, TLS expiry, service status | SSH key, shell secret, private host credential |
| OAuth | Final callback result, timestamp | Cookie, state value, authorization header |
| Database | Readiness status, migration result summary | `DATABASE_URL`, password, dump |
| Provider | Sandbox result, connector label | API key, token, private provider response |
| Backup | Drill date, pass/fail, restore duration | Archive, database export, encryption key |
| Device | Model, Android version, app version, observed result | Personal user data, screenshots containing private data |

## ব্যবহার পদ্ধতি

প্রথমে [Remote Gate Runbook](./DSAI_REMOTE_GATE_HANDOFF_COMMANDS_BN.md) অনুসারে VPS বা build environment-এ পরীক্ষা চালান। এরপর console-এ কেবল sanitized result লিখুন এবং status হিসেবে `Reported pass`, `Reported fail`, বা `Pending` নির্বাচন করুন। `Reported pass` অর্থ operator-এর বক্তব্য; এটি server-verified pass নয়। Independent reviewer বা automated gate verification না হওয়া পর্যন্ত production readiness status পরিবর্তন করা যাবে না।

`Copy summary` কেবল status summary clipboard-এ রাখে। `Export JSON` local browser download তৈরি করে; export-এ একই non-secret draft evidence থাকে। Browser localStorage ব্যবহারের কারণে এটি authoritative audit database নয়। Browser profile পরিষ্কার হলে draft হারাতে পারে; formal audit trail প্রয়োজন হলে verified evidence আলাদা controlled system-এ সংরক্ষণ করতে হবে।

## নিরাপত্তা সীমা

Console-এ password, passphrase, secret, token, API key, private key, database URL, SSH output containing credentials, cookie, authorization header বা keystore upload করা নিষিদ্ধ। Built-in sensitive-text guard সাধারণ credential-like শব্দ শনাক্ত করলে entry block করে, তবে এটি পূর্ণ DLP ব্যবস্থা নয়—operator-কে নিজেকেও redaction নিশ্চিত করতে হবে।

APK user-facing only থাকে। `/admin/gate-evidence` Android wrapper-এর user navigation surface-এ নেই এবং Android wrapper admin/operator/internal route block করে। Admin console-এ প্রবেশের জন্য authentication এবং server-side role boundary দুটোই প্রযোজ্য।

## Preview ও acceptance

Preview route: `/admin/gate-evidence`। Desktop ও 375px mobile viewport-এ layout যাচাই করা হয়েছে; initial state-এ সব সাতটি gate `Not checked`, reported evidence `0/7`, এবং reported pass `0`। Acceptance-এর জন্য role gate, redaction guard, local draft/export behavior, responsive layout, এবং truthful “operator-reported—not server-verified” language বজায় থাকতে হবে।
