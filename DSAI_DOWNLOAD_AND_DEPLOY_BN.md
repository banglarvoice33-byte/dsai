# DSAI সম্পূর্ণ Project Download ও ১-কমান্ড Deployment Guide

এই release archive হলো **credential-free**। এতে source code, frontend, backend, database schema/migrations, PWA assets, deployment script, production guides এবং tests আছে। এতে কোনো production password, API key, OAuth secret, `.env.production`, `node_modules`, `.git`, `dist` বা runtime PID/log নেই।

## ১. সম্পূর্ণ Project Download

Management UI-তে সর্বশেষ checkpoint খুলে **Download Code / Download as ZIP** নির্বাচন করুন। এই release-এর project version:

```text
manus-webdev://59bda190
```

যদি command-line archive প্রয়োজন হয়, checkpoint থেকে project files download করে নিজের computer-এ যাচাই করুন:

```bash
unzip dsai-platform-release.zip -d dsai-platform
cd dsai-platform
find . -maxdepth 1 -type f -print | sort
```

Archive-এ `.env.production` বা কোনো credential থাকলে সেটি production server-এ upload করবেন না। আলাদা secret manager বা server-এর protected environment file ব্যবহার করুন।

## ২. Server প্রস্তুতি

Linux server-এ SSH করে project archive upload ও extract করুন:

```bash
scp dsai-platform-release.zip USER@SERVER_IP:/home/USER/
ssh USER@SERVER_IP
mkdir -p ~/apps/dsai-platform
unzip -o ~/dsai-platform-release.zip -d ~/apps/dsai-platform
cd ~/apps/dsai-platform
chmod +x deploy-genesis.sh
```

Server-এ Node.js 20 বা পরের LTS, `corepack`, `curl`, এবং database network access প্রয়োজন। Installer সমর্থিত Debian/Ubuntu host-এ missing prerequisite থাকলে `apt-get` ব্যবহার করতে পারে। Production server-এ package installation policy আগে যাচাই করুন।

## ৩. Production environment তৈরি

প্রথম deployment-এর আগে একই project directory-তে protected environment file তৈরি করুন:

```bash
cat > .env.production <<'EOF'
NODE_ENV=production
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/DB_NAME
JWT_SECRET=একটি-দীর্ঘ-random-secret
VITE_APP_ID=আপনার-oauth-app-id
OAUTH_SERVER_URL=https://আপনার-oauth-server
VITE_OAUTH_PORTAL_URL=https://আপনার-oauth-portal/login
EOF
chmod 600 .env.production
```

বাস্তব value বসানোর সময় বাংলা placeholder রাখবেন না। প্রয়োজনীয় built-in integration environment values host secret manager বা protected shell environment-এ দিন। কোনো secret frontend source, Git repository, screenshot, chat বা সাধারণ user form-এ দেবেন না।

Database অবশ্যই আগে তৈরি থাকতে হবে এবং production migration/schema state যাচাই করতে হবে। OAuth provider-এ final HTTPS origin ও callback অনুমোদিত না থাকলে website public হলেও login কাজ করবে না।

## ৪. এক কমান্ডে deployment

Project directory থেকে এই একমাত্র deployment command চালান:

```bash
cd ~/apps/dsai-platform && bash deploy-genesis.sh
```

Script ধাপে ধাপে Linux prerequisite, pnpm, previous DSAI process, free port, `.env.production`, frozen dependency install, production build, server start এবং `/healthz` check সম্পন্ন করে। Default port range `3010–3099`; `3000–3009` occupied থাকলে এটি সাধারণত ১১তম application slot থেকে free port বেছে নেবে, তবে কোনো port অনুমান না করে listener check করবে।

অন্য range দরকার হলে:

```bash
cd ~/apps/dsai-platform && DSAI_START_PORT=4010 DSAI_END_PORT=4099 bash deploy-genesis.sh
```

## ৫. Deployment সফল হয়েছে কিনা যাচাই

Installer যে port দেখাবে সেটি যাচাই করুন:

```bash
cd ~/apps/dsai-platform
PORT=$(cat .dsai-runtime/port)
curl -fsS "http://127.0.0.1:${PORT}/healthz"
curl -fsS "http://127.0.0.1:${PORT}/readyz"
curl -I "http://127.0.0.1:${PORT}/manifest.json"
curl -I "http://127.0.0.1:${PORT}/sw.js"
tail -n 100 .dsai-runtime/app.log
```

`/healthz` process liveness এবং `/readyz` database readiness নির্দেশ করে। এগুলো OAuth click-through, provider credentials, Android AAB, Play approval, malware-scanner availability বা independent security review প্রমাণ করে না।

## ৬. Domain ও HTTPS

Web hostname হিসেবে ব্যবহার করুন:

```text
dsai.banglarvoice24news.com
```

`dsai@banglarvoice24news.com` সাধারণত email address, web subdomain নয়। `info@banglarvoice24news.com` public contact email হিসেবে ব্যবহার করতে হলে mailbox, SPF, DKIM এবং DMARC operator-কে configure করতে হবে।

Reverse proxy-তে `dsai.banglarvoice24news.com`-এর DNS record, TLS certificate এবং application port forwarding দিন। Application port firewall-এ public করার আগে hosting policy যাচাই করুন। OAuth provider-এ exact HTTPS origin ও callback path দিন। নতুন login এবং returning session connected browser-এ পরীক্ষা না হওয়া পর্যন্ত OAuth-কে verified বলবেন না।

## ৭. Update, stop, rollback

Code update-এর পরে একই command পুনরায় চালান:

```bash
cd ~/apps/dsai-platform && bash deploy-genesis.sh
```

শুধু বর্তমান DSAI process বন্ধ করতে:

```bash
cd ~/apps/dsai-platform
kill "$(cat .dsai-runtime/app.pid)"
```

Health check ব্যর্থ হলে public traffic বন্ধ রেখে log দেখুন:

```bash
tail -n 200 ~/apps/dsai-platform/.dsai-runtime/app.log
```

সর্বশেষ known-good Management UI checkpoint-এ rollback করুন; database destructive rollback করবেন না। `.env.production` backup এবং database backup আলাদাভাবে সংরক্ষণ করুন।

## ৮. Final production checklist

| বিষয় | যাচাই |
|---|---|
| Archive | Secret-free, extractable, expected files present |
| Server | Linux, Node LTS, curl, database network access |
| Environment | `0600` permission, real DB/JWT/OAuth values |
| Build | `pnpm install --frozen-lockfile` এবং `pnpm build` successful |
| Runtime | `/healthz` ও `/readyz` successful |
| Security | `.env.production` public নয়; admin/protected boundaries যাচাই |
| Domain | DNS, TLS, reverse proxy, firewall verified |
| OAuth | New login ও returning session connected browser-এ verified |
| Privacy | Deletion request path এবং operator review tested |
| Mobile | 320/360/390px, low-network, PWA, real Android device tested |
| Play Store | Signed AAB, target SDK, Data Safety, account deletion, Digital Asset Links, internal track pending until operator completes |

DSAI-এর বর্তমান release controlled-alpha production candidate। এটি one-command server deployment-এর জন্য প্রস্তুত, কিন্তু কোনো সফটওয়্যারের জন্য zero-defect, universal hosting compatibility, successful OAuth without credentials, বা Google Play approval-এর শতভাগ নিশ্চয়তা দেওয়া যায় না।

সম্পর্কিত canonical guide: `DSAI_PRODUCTION_RELEASE_GUIDE.md`।
