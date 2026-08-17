# DSAI Manus Credential Setup Guide

এই guide-এ কোনো বাস্তব secret value রাখা যাবে না। DSAI-এর Manus/Forge credential server-side secret হিসেবে provision করতে হবে; frontend, Git, screenshot, chat, browser console বা সাধারণ admin form-এ secret value দেওয়া যাবে না। Assistant কোনো private Manus key সংগ্রহ, extract, reveal বা rotate করতে পারে না। Authorized project owner-কে Management UI বা approved secret manager ব্যবহার করতে হবে।

## Credential map

| Variable | ব্যবহারের স্থান | উৎস | Browser-এ যাবে? |
|---|---|---|---|
| `BUILT_IN_FORGE_API_URL` | Server-side Forge/Manus services | Project Management UI বা approved environment manager | না |
| `BUILT_IN_FORGE_API_KEY` | Server-side Forge/Manus authorization | Project Management UI বা approved environment manager | না |
| `DATABASE_URL` | DSAI MySQL/Drizzle database | Database operator | না |
| `JWT_SECRET` | Session signing | Owner-generated random value | না |
| `VITE_APP_ID` | OAuth application identity | Authorized OAuth/project configuration | এটি public app identifier হতে পারে; secret নয় |
| `OAUTH_SERVER_URL` | Server-side OAuth token/callback service | Authorized OAuth configuration | না |
| `VITE_OAUTH_PORTAL_URL` | Browser login portal URL | Authorized OAuth configuration | URL হিসেবে frontend-এ যেতে পারে |

Current DSAI code uses the `mysql2` driver and `DATABASE_URL` must use `mysql://...`, not PostgreSQL. Current login callback is `/api/oauth/callback`; a Google-specific `/auth/google/callback` value is not automatically compatible with this release.

## Management UI flow

Management UI-তে project খুলে **Settings → Secrets** নির্বাচন করুন। Required server-only values field-এ provision করুন, Save করুন, এবং value chat বা UI screenshot-এ প্রকাশ করবেন না। `BUILT_IN_FORGE_API_KEY`-এ `VITE_` prefix দেবেন না। Save-এর পর latest checkpoint Publish বা server restart করুন।

এরপর admin user OAuth দিয়ে `/auth/login?returnTo=/admin/connectors` খুলবেন। Account-এর `role=admin` না হলে console access হবে না। `/admin/connectors`-এ `Test environment` শুধু environment readiness পরীক্ষা করে। Policy enable করলেও provider action চালু হয় না; adapter, permission, provider health, staging approval, cost/rollback controls এবং audit requirements পূরণ করতে হয়। `/admin/platform` এখন readiness preview; scale buttons provider API call করে না।

## Self-hosted VPS flow

```bash
cd ~/apps/dsai-platform
cp .env.production.example .env.production
chmod 600 .env.production
nano .env.production
```

Placeholder বদলে approved values দিন:

```dotenv
NODE_ENV=production
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/DB_NAME
JWT_SECRET=NEW_LONG_RANDOM_SECRET
VITE_APP_ID=YOUR_OAUTH_APP_ID
OAUTH_SERVER_URL=https://YOUR_OAUTH_SERVER
VITE_OAUTH_PORTAL_URL=https://YOUR_OAUTH_SERVER/login
BUILT_IN_FORGE_API_URL=https://YOUR_FORGE_SERVER
BUILT_IN_FORGE_API_KEY=YOUR_SERVER_ONLY_FORGE_KEY
VITE_APP_TITLE=DSAI
```

Random session secret তৈরি করতে:

```bash
openssl rand -hex 32
```

Value না দেখিয়ে validation চালান:

```bash
cd ~/apps/dsai-platform
chmod 600 .env.production
node scripts/validate-production-env.mjs .env.production
```

Forge-backed features বাধ্যতামূলক হলে strict mode ব্যবহার করুন:

```bash
DSAI_REQUIRE_FORGE=1 node scripts/validate-production-env.mjs .env.production
```

তারপর one-command deployment:

```bash
bash deploy-genesis.sh
```

Installer build-এর আগে validator চালায়। ভুল configuration হলে build ও process start হবে না। Successful start-এর পরে chosen port যাচাই করুন:

```bash
PORT=$(cat .dsai-runtime/port)
curl -fsS "http://127.0.0.1:${PORT}/healthz"
curl -fsS "http://127.0.0.1:${PORT}/readyz"
tail -n 100 .dsai-runtime/app.log
```

## Rotation and revocation

কোনো key terminal output, repository, screenshot বা chat-এ প্রকাশিত হলে compromised ধরে provider dashboard-এ পুরোনো key revoke করুন। নতুন key secret manager-এ দিন, file mode `600` নিশ্চিত করুন, তারপর deployment পুনরায় চালান। Database password rotate করলে `DATABASE_URL` update করে `/readyz` ও a protected workflow test করুন। OAuth secret rotate করলে callback allow-list, origin, session cookie এবং returning-session flow পরীক্ষা করুন। পুরোনো `.env.production` backup plaintext অবস্থায় রাখবেন না।

## Troubleshooting

`DATABASE_URL` error হলে `mysql://` scheme, port 3306, database existence এবং network access যাচাই করুন। OAuth failure হলে final HTTPS origin, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `/api/oauth/callback` এবং exact callback allow-list যাচাই করুন। Forge feature unavailable হলে URL/key দুটো server-side উপস্থিত কি না দেখুন এবং strict validator চালান। Admin console 401/403 হলে session login, cookie policy এবং `role=admin` যাচাই করুন। Provider cards gated থাকা স্বাভাবিক—এটি missing adapter বা deliberate safety gate নির্দেশ করে, key failure নয়।

> DSAI-এর accurate release claim: secret-safe provisioning, environment validation, admin authorization এবং provider-gated fallback implemented। Private Manus key retrieval, live provider activation, real OAuth success, production database recovery, and third-party security approval remain operator-owned gates.
