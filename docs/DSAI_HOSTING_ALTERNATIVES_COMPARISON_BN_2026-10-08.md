# DSAI Hosting Alternatives — Official-Source Comparison

**তারিখ:** 2026-10-08  
**পরিধি:** Koyeb/VPS-এর বিকল্প; Docker, runtime secrets, AI provider keys, persistent database, GitHub deployment এবং open-source status। Newspaper/newsroom scope অন্তর্ভুক্ত নয়।

## Executive conclusion

একটি platform একই সঙ্গে **চিরস্থায়ীভাবে free, open source, persistent, high-availability এবং production-grade**—এই পাঁচটি সুবিধা সাধারণত দেয় না। অন্তত একটি শর্ত থাকে:

- free managed service হলে sleep, quota, expiry বা billing risk থাকে;
- open-source platform হলে নিজের VM/VPS বা cloud infrastructure দরকার;
- persistent database হলে backup, storage, network এবং operator responsibility থাকে;
- high availability হলে সাধারণত paid infrastructure লাগে।

### DSAI-এর জন্য সবচেয়ে শক্তিশালী বাস্তবসম্মত পথ

> **Oracle Cloud Always Free VM + Coolify + DSAI Docker container + MySQL/TiDB-compatible database volume + object-storage backup**

এটি Koyeb/Aiven-এর মতো approval-dependent managed trial নয়। তবে Oracle account approval, home-region capacity, idle reclamation, firewall, backup এবং maintenance-এর দায়িত্ব operator-এর। এটিকে প্রথমে **Controlled Alpha** হিসেবে চালানো উচিত; production SLA হিসেবে নয়।

## Option classification

| Option | শ্রেণি | Open source? | DSAI Docker | Persistent DB | Free/Trial সত্যতা | Overall fit |
|---|---|---:|---:|---:|---|---|
| **Coolify** | Self-hosted PaaS | **হ্যাঁ** | **হ্যাঁ** | **হ্যাঁ**, volume/backup operator-managed | Software free; VM free নয় | **সেরা overall** |
| **CapRover** | Self-hosted PaaS | **হ্যাঁ** | **হ্যাঁ** | **হ্যাঁ**, persistent directories/one-click DB | Software free; VM free নয় | সহজ deployment-এর জন্য খুব ভালো |
| **Dokku** | Self-hosted mini-PaaS | **হ্যাঁ** | **হ্যাঁ**, Docker/Git/plugin model | **হ্যাঁ**, storage plugin/host path | Software free; VM free নয় | কম resource, বেশি manual operations |
| **Oracle Always Free + Coolify** | Free infrastructure + OSS PaaS | **Stack open source** | **হ্যাঁ** | **হ্যাঁ**, OCI block volume | Always Free eligibility আছে; capacity/idle rules আছে | **শূন্য-cost alpha-র সেরা candidate** |
| **Northflank** | Managed PaaS | না | **হ্যাঁ** | **হ্যাঁ** | Sandbox: 2 free services, 1 free DB; plan/account rules verify করতে হবে | Managed alternative হিসেবে শক্তিশালী |
| **Zeabur** | Managed PaaS | না | হ্যাঁ | সীমাবদ্ধ/plan-dependent | Free plan, no card; auto-sleep, no SLA, no backup/import | Preview/alpha only |
| **Railway** | Managed PaaS | না | হ্যাঁ | Volumes/DB support | Free $0 with $1 resources; $5 free trial; paid usage | দ্রুত setup, billing risk |
| **Render** | Managed PaaS | না | হ্যাঁ | Free Postgres exists কিন্তু 30-day expiry | Free web service; sleep/ephemeral FS | Demo/preview only |
| **Fly.io** | Managed infrastructure | না | হ্যাঁ | Volumes available | **No free tier**; short trial; usage billing | Paid low-cost option |

## 1. Coolify — সবচেয়ে ভালো open-source alternative

Coolify নিজেকে open-source এবং self-hostable Vercel/Heroku/Netlify/Railway alternative হিসেবে বর্ণনা করে। এটি নিজের server, VPS, Raspberry Pi, EC2, DigitalOcean, Linode বা Hetzner-এ deploy করা যায়।

### DSAI-এর জন্য সুবিধা

- Dockerfile এবং Docker Compose দুটোই সমর্থন করে।
- Git repository থেকে branch-based deployment, webhook ও preview deployment সমর্থন করে।
- `${DATABASE_URL}`-এর মতো variable reference ব্যবহার করে secret dashboard-এ রাখা যায়।
- Compose volume এবং persistent storage সমর্থন করে।
- MySQL, MariaDB, PostgreSQL, Redis ইত্যাদি one-click service হিসেবে চালানো যায়।
- HTTPS/Let's Encrypt, custom domain, rollback, monitoring, cron এবং S3-compatible database backup সুবিধা আছে।
- DSAI-এর বর্তমান Docker + external secrets model-এর সঙ্গে সবচেয়ে কম conceptual mismatch।

### সীমাবদ্ধতা

- Coolify নিজে hosting provider নয়; একটি Linux server অবশ্যই লাগবে।
- Server, firewall, OS update, backup restore, disk usage এবং incident response operator-এর দায়িত্ব।
- একটি ছোট free VM-এ একই host-এ app + DB + Coolify চালালে resource pressure হতে পারে।

**Official sources:**

- [Coolify homepage](https://coolify.io/)
- [Coolify Docker Compose deployment](https://coolify.io/docs/applications/builds/docker-compose)
- [Coolify environment variables](https://coolify.io/docs/applications/configuration/environment-variables)

## 2. CapRover — সবচেয়ে সহজ Docker-native option

CapRover একটি free, self-hosted PaaS যা Docker, nginx, Let's Encrypt এবং Docker Swarm-এর ওপর কাজ করে। এটি নিজস্ব infrastructure-এ apps, databases, domains, TLS এবং persistent directories পরিচালনা করে।

### সুবিধা

- `captain-definition` ফাইল দিয়ে Dockerfile/image deployment।
- CLI, dashboard, webhook এবং GitHub branch deployment।
- Automatic HTTPS এবং one-click rollback।
- Environment variables, persistent directories, instance count ও ports manage করা যায়।
- MySQL, MongoDB, MariaDB সহ one-click app database ecosystem আছে।
- DSAI-এর current Docker image-এর জন্য সহজ migration path।

### সীমাবদ্ধতা

- Advanced audit, backup, multi-environment এবং observability-তে Coolify-এর চেয়ে বেশি manual কাজ লাগতে পারে।
- Database backup, secret rotation এবং restore runbook operator-কেই তৈরি করতে হবে।
- Docker Swarm layer যুক্ত হওয়ায় ছোট single-node deployment-এ architecture কিছুটা ভারী হতে পারে।

**Official sources:**

- [CapRover homepage](https://caprover.com/)
- [CapRover deployment methods](https://caprover.com/docs/deployment-methods)
- [CapRover one-click apps](https://caprover.com/docs/one-click-apps)

## 3. Dokku — সবচেয়ে lightweight open-source option

Dokku একটি open-source Heroku alternative। Docker-ভিত্তিক container-এ Git push workflow, plugins এবং server-side deployment দেয়।

### সুবিধা

- কম resource-এ চলে।
- Git push deployment ও Heroku-compatible workflow।
- Docker deploy এবং plugin ecosystem।
- Storage plugin দিয়ে host path বা Docker volume mount করা যায়।
- Single VPS-এ app + database চালানোর জন্য lightweight।

### সীমাবদ্ধতা

- Coolify/CapRover-এর মতো rich visual control plane নয়।
- Secrets, backups, monitoring, certificate lifecycle এবং database lifecycle বেশি CLI/operator-driven।
- DSAI-এর admin/evidence-heavy operational model-এর জন্য setup documentation বেশি দরকার।

**Official sources:**

- [Dokku homepage](https://dokku.com/)
- [Dokku persistent storage](https://dokku.com/docs~v0.35.0/advanced-usage/persistent-storage/)

## 4. Oracle Cloud Always Free + open-source PaaS

Oracle-এর official documentation অনুযায়ী Always Free resources account-এর lifetime-এর জন্য home region-এ পাওয়া যায়। 2026-06-12-এর documentation-এ:

- AMD `VM.Standard.E2.1.Micro`: সর্বোচ্চ দুইটি micro VM;
- Ampere A1 Flex: মোট **2 OCPU এবং 12 GB memory** equivalent;
- মোট **200 GB Always Free block volume**;
- Ubuntu image ব্যবহারযোগ্য;
- A1/VM capacity না থাকলে `out of host capacity` error হতে পারে;
- 7 দিনের period-এ CPU/network/memory utilization খুব কম থাকলে idle VM reclaim হতে পারে।

### DSAI architecture

```text
Oracle Always Free Ubuntu VM
        │
        ├── Coolify (or CapRover/Dokku)
        ├── DSAI Docker container
        ├── MySQL/TiDB-compatible database container + named volume
        ├── Reverse proxy + TLS
        └── Scheduled encrypted backup to external object storage
```

### কেন এটি Koyeb/Aiven-এর চেয়ে আলাদা

- Koyeb/Aiven trial approval বা trial credit-এর ওপর নির্ভর করতে হয় না।
- Open-source control plane এবং infrastructure access থাকে।
- Persistent storage নিজের volume-এ থাকে।
- তবে Oracle account, region capacity, idle reclamation এবং operational security-এর ঝুঁকি operator-এর।

**Official source:**

- [Oracle Always Free Resources — updated 2026-06-12](https://docs.oracle.com/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)

## 5. Northflank — managed free sandbox-এর শক্তিশালী candidate

Northflank-এর official pricing page-এ Sandbox tier-এর জন্য দেখা যাচ্ছে:

- 2টি free services;
- 1টি free database;
- 2টি free cron jobs;
- always-on compute/no sleeping দাবি;
- custom Dockerfile, GitHub/GitLab/Bitbucket integration, secret groups, volumes/persistence, logs, metrics, API/CLI এবং rollback ecosystem।

### সুবিধা

- Koyeb-এর চেয়ে DSAI-এর Docker + database + cron architecture-এর সঙ্গে বেশি মানানসই হতে পারে।
- একই platform-এ app এবং database রাখার সম্ভাবনা।
- AI workload, jobs, cron এবং secret management-এর জন্য শক্তিশালী operational model।

### সতর্কতা

- এটি open-source platform নয়; managed service।
- Free Sandbox-এর eligibility, region, verification ও resource limits account-specific হতে পারে।
- Usage/billing page-এ consumption-based billing আছে; payment terms আগে verify করতে হবে।
- Free service/DB-কে long-term production backup হিসেবে ধরে নেওয়া যাবে না যতক্ষণ না account-এ exact limits ও backup behaviour নিশ্চিত করা হয়।

**Official source:**

- [Northflank pricing](https://northflank.com/pricing)

## 6. Zeabur — no-card preview option

Zeabur-এর official Free Plan documentation-এ বলা হয়েছে:

- no credit card required;
- personal exploration ও learning-এর জন্য free tier;
- idle হলে auto-sleep এবং next request-এ cold start;
- no SLA;
- automated database backup/import এবং log forwarding free plan-এ নেই;
- continuous run দরকার হলে paid Dev Plan, যার listed price $5/month এবং 14-day trial।

### সিদ্ধান্ত

DSAI public preview, internal demo অথবা controlled alpha-এর জন্য ব্যবহারযোগ্য হতে পারে। কিন্তু persistent workspace, quality benchmark history, CRM audit trail এবং database backup-এর জন্য **free plan যথেষ্ট নয়**।

**Official source:**

- [Zeabur Free Plan](https://zeabur.com/docs/en-US/pricing/free-plan)

## 7. Railway — দ্রুত setup, কিন্তু free নয় production

Railway-এর official pricing page-এ:

- Free: `$0/month`, কিন্তু মাত্র `$1` free resources;
- Hobby: `$5/month`;
- usage-based CPU, RAM, storage ও egress billing;
- Free Trial-এর জন্য `$5` free credits;
- RAM, CPU, egress ও volume storage আলাদা resource cost।

Railway variables documentation-এ runtime variables, shared variables এবং sealed variables আছে। Sealed variables UI/API থেকে পরে দেখা যায় না—secret isolation-এর জন্য ভালো।

### সিদ্ধান্ত

Developer experience ভালো এবং DSAI Docker app deploy করা সহজ হতে পারে। কিন্তু free tier ছোট, volume/database usage paid হতে পারে, এবং trial/usage শেষে billing exposure আছে। Payment method ছাড়া long-running production ধরে নেওয়া যাবে না।

**Official sources:**

- [Railway pricing](https://docs.railway.com/pricing)
- [Railway variables and sealed variables](https://docs.railway.com/variables)

## 8. Render — free preview, persistent production নয়

Render-এর official free documentation নিজেই বলে free instances production-এর জন্য ব্যবহার না করতে। Verified limitations:

- Free web service 15 মিনিট inbound traffic না পেলে spin down হয়;
- wake-up-এ প্রায় এক মিনিট লাগতে পারে;
- local filesystem ephemeral—restart, redeploy বা sleep হলে data হারায়;
- free service-এ persistent disk নেই;
- free Postgres database 30 দিন পরে expire হয়;
- free Postgres-এ backup নেই;
- free web service restart হতে পারে;
- outbound bandwidth/pipeline limit অতিক্রম করলে suspend বা billing/supplementary usage হতে পারে।

### সিদ্ধান্ত

Frontend preview বা disposable demo-এর জন্য ভালো; DSAI backend, persistent workspace অথবা audit database-এর জন্য উপযুক্ত নয়।

**Official source:**

- [Render free services](https://render.com/docs/free)

## 9. Fly.io — technically capable, কিন্তু zero-cost নয়

Fly.io Docker/Machines/Volumes দিয়ে শক্তিশালী deployment দেয়। Official pricing page-এ:

- no free tier;
- 7 দিন বা 2 ঘণ্টা Machine runtime পর্যন্ত trial;
- all organizations-এর জন্য card on file প্রয়োজন;
- smallest always-on 256 MB machine-এর listed cost প্রায় `$2.19/month`;
- volume, egress, IP এবং managed Postgres আলাদা cost।

### সিদ্ধান্ত

কম খরচের paid deployment হিসেবে শক্তিশালী, বিশেষ করে persistent volumes ও region selection দরকার হলে। কিন্তু “open-source” বা “forever free” option নয়।

**Official source:**

- [Fly.io pricing](https://fly.io/docs/about/pricing/)

## DSAI-এর জন্য ranked recommendation

### Rank 1 — Oracle Always Free + Coolify

শর্ত: account/region capacity পাওয়া গেলে। এটি সবচেয়ে ভালো সমন্বয় দেয়:

- open-source control plane;
- Docker Compose;
- runtime secrets;
- persistent volume;
- database container;
- custom domain/TLS;
- GitHub deployment;
- backup automation;
- provider keys server-side।

### Rank 2 — Northflank Sandbox

শর্ত: account-এর exact free limits, verification এবং billing rules আগে confirm করতে হবে। এটি managed convenience-এ সবচেয়ে ভালো candidate।

### Rank 3 — Oracle Always Free + CapRover

Coolify-এর তুলনায় সহজ UI/operation চাইলে CapRover ভালো। তবে DSAI-এর audit, backup, staging এবং provider evidence-এর জন্য Coolify বেশি উপযোগী।

### Rank 4 — Oracle Always Free + Dokku

Resource কম হলে Dokku ভালো। কিন্তু operator-এর CLI skill ও runbook দরকার।

### Rank 5 — Zeabur Free

শুধু preview/controlled demo। persistent production নয়।

### Rank 6 — Railway Hobby/Free

দ্রুত setup, কিন্তু free tier খুব ছোট এবং paid usage risk আছে।

### Rank 7 — Render Free

Frontend/demo-এর জন্য; DSAI persistent backend-এর জন্য নয়।

### Rank 8 — Fly.io

Paid low-cost infrastructure হিসেবে ভালো; zero-cost option হিসেবে নয়।

## Recommended minimum DSAI deployment

```text
Oracle Always Free Ubuntu VM
  ├── Coolify
  ├── DSAI app container: Node 20 / port 3000
  ├── MySQL 8-compatible database container + named volume
  ├── Redis only if a real queue/worker is activated
  ├── HTTPS reverse proxy
  ├── External provider secrets in Coolify variables
  ├── Nightly encrypted database dump to external S3-compatible storage
  └── GitHub Actions: check, test, build, Docker image validation
```

### Never do

- AI provider keys GitHub repository-তে commit করবেন না।
- `VITE_GEMINI_API_KEY`, `VITE_GROQ_API_KEY`, `VITE_OPENROUTER_API_KEY` ব্যবহার করবেন না।
- Free plan-কে backup না থাকা অবস্থায় production database ভাববেন না।
- SQLite-কে ephemeral container filesystem-এ primary database করবেন না।
- Trial credit-কে permanent free infrastructure হিসেবে ঘোষণা করবেন না।
- একটি VM-এ app/database চালিয়ে backup ছাড়া live launch করবেন না।

## Final decision

**Open-source ও zero-cost-এর সবচেয়ে বাস্তবসম্মত combination হলো: Oracle Always Free infrastructure + Coolify self-hosted PaaS।**

কিন্তু এটি “কোনো শর্ত নেই” সমাধান নয়। Oracle account approval/capacity, idle reclamation, security hardening, backups এবং maintenance থাকবে। Managed option চাইলে **Northflank Sandbox** প্রথমে যাচাই করা উচিত; no-card preview চাইলে **Zeabur Free** ব্যবহার করা যায়, কিন্তু persistent DSAI production-এর জন্য নয়।
