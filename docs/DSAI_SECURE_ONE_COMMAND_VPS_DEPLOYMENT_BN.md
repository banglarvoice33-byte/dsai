# DSAI Secure One-Command VPS Deployment Plan

## নিরাপত্তা সিদ্ধান্ত

একটি uploadable file-এর ভিতরে real secret রাখা হবে না। DATABASE_URL, JWT_SECRET, Manus OAuth credentials, Turnstile secret, Forge key, payment credential এবং provider token ZIP, self-extracting bundle, checksum manifest, chat message, Git repository বা shell command line-এ থাকবে না। কারণ bundle কপি, backup, process listing বা ভুল permission-এর মাধ্যমে secret প্রকাশ হতে পারে। One-command deployment-এর অর্থ হলো **one-command orchestration**, secret-কে archive-এর মধ্যে hardcode করা নয়।

## নিরাপদ secret উৎস

দুটি অনুমোদিত উৎস আছে। প্রথমটি হলো VPS-এ আগে থেকে mode `600`-এর `/etc/dsai/dsai.env`; দ্বিতীয়টি হলো একই Linux VPS-এর running legacy process-এর allowlisted environment, যেখান থেকে migration helper secret values print না করে atomic mode-600 file লিখে। `scripts/migrate-legacy-env.mjs` কেবল allowlisted key নেয় এবং public production-এ CAPTCHA key অনুপস্থিত হলে fail করে। Private Alpha-তে no-CAPTCHA কেবল loopback bind `127.0.0.1` সহ চালানো যায়।

## One-command bundle কী করে

`DSAI_one_command_vps_deploy_2026-08-20.run` একটি self-extracting, credential-free file। এটি embedded release-এর checksum যাচাই করে, ZIP integrity পরীক্ষা করে, `$HOME/dsai/releases/<UTC timestamp>`-এ extract করে, `current` symlink তৈরি করে, protected environment file ব্যবহার বা legacy process migration করে, production validator চালায়, তারপর `deploy-genesis.sh` চালায় এবং local `/healthz` ও `/auth/login` পরীক্ষা করে। Environment validation pass না হওয়া পর্যন্ত previous process stop করা হয় না।

## Operator command: private Controlled Alpha

এই command no-CAPTCHA staging-এর জন্য। এটি public internet-এর জন্য নয়। `DSAI_LEGACY_PID`-এর মান শুধুমাত্র VPS-এ দেখা running legacy process-এর PID হবে; secret value command-এ লিখতে হবে না।

```bash
chmod 700 "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run"
DSAI_LEGACY_PID=30628 DSAI_PRIVATE_ALPHA=true bash "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run"
```

যদি environment file আগে থেকেই `/etc/dsai/dsai.env`-এ থাকে, migration না করে এই command ব্যবহার করা যাবে:

```bash
chmod 700 "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run"
DSAI_ENV_FILE=/etc/dsai/dsai.env DSAI_PRIVATE_ALPHA=true bash "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run"
```

এই mode-এ application loopback-এ bind না হলে validator fail করবে। Nginx দিয়ে public route খুলে দেওয়া যাবে না।

## Operator command: public production

Public production-এর জন্য live Turnstile site key, secret এবং active hostname `/etc/dsai/dsai.env`-এ আগে secure ভাবে provision করতে হবে। Public command-এ `DSAI_PRIVATE_ALPHA` দেওয়া যাবে না।

```bash
chmod 600 /etc/dsai/dsai.env
chmod 700 "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run"
DSAI_ENV_FILE=/etc/dsai/dsai.env DSAI_PRIVATE_ALPHA=false bash "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run"
```

যদি public CAPTCHA values অনুপস্থিত থাকে, validator fail-closed করবে। এটি bypass করার জন্য `CAPTCHA_ENABLED=false` বা `DSAI_PRIVATE_ALPHA=true` ব্যবহার করা যাবে না।

## Upload command

Local computer থেকে upload করতে হবে; VPS terminal-এ local path-এর `scp` command চালালে কাজ নাও করতে পারে। Local machine-এ:

```bash
scp "$HOME/DSAI_one_command_vps_deploy_2026-08-20.run" dulal_sarder90@dsai:~/
```

Upload-এর পরে VPS SSH terminal-এ কেবল উপরের mode-উপযুক্ত one-command চালাতে হবে। Bundle upload করলেই auto-run হবে না; operator-কে explicit command দিতে হবে। এটি নিরাপত্তার জন্য ইচ্ছাকৃত।

## Integrity verification

Bundle generator embedded release checksum নিজেই verify করে। অতিরিক্তভাবে operator চাইলে local machine-এ SHA-256 রাখতে পারেন, কিন্তু checksum output-এর সঙ্গে archive source মিলিয়ে না দেখে deploy করা যাবে না। Bundle mismatch হলে command সঙ্গে সঙ্গে থেমে যাবে এবং কোনো application process stop করবে না।

## Success এবং failure boundary

`DSAI_ONE_COMMAND_DEPLOY=PASS`, local health `200`, এবং local login route `200` কেবল VPS-local success বোঝায়। Public success দাবি করতে DNS resolution, TLS certificate, Nginx upstream, SPA history fallback, database readiness, OAuth callback allowlist, process supervision, backup/rollback এবং external provider gates আলাদাভাবে যাচাই করতে হবে।

## কী কখনো করা যাবে না

Real secret সহ ZIP তৈরি করা, secret chat-এ paste করা, `export DATABASE_URL=...` দিয়ে shell history-তে রাখা, `chmod 644 /etc/dsai/dsai.env` করা, public mode-এ CAPTCHA bypass করা, অথবা checksum mismatch উপেক্ষা করা যাবে না। Payment credentials-ও এই bundle-এ রাখা যাবে না; merchant gateway, webhook signature এবং entitlement logic provider/operator validation-এর পরে চালু হবে।
