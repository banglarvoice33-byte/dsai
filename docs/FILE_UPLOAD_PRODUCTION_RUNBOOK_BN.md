# DSAI Secure File Upload — Production Runbook

## বাস্তব অবস্থা

DSAI backend-এ upload route, account ownership check, 10 MiB limit, SHA-256 verification, MIME allowlist, basic file-signature checks, authenticated ClamAV adapter, private Supabase Storage adapter, clean-only download এবং retention cleanup যোগ করা হয়েছে। কোনো scanner/storage secret না থাকলে upload fail-closed থাকবে।

## Components

- Supabase Storage bucket: `dsai-user-files` (private)
- API: existing Express/Vercel application
- Scanner: ClamAV daemon + authenticated HTTP gateway
- Database: existing `file_assets` table
- UI: Workspace → Documents

## Required Vercel Production environment variables

Set these names only; never commit values:

- `SUPABASE_URL`: existing Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: service-role key (server-only; never use a VITE_ prefix)
- `MALWARE_SCANNER_URL`: HTTPS URL ending in `/scan`
- `MALWARE_SCANNER_API_KEY`: long random secret shared with scanner gateway

ClamAV host/port are private to the scanner compose network. Do not expose port 3310 publicly.


## বিকল্প A — Google Cloud Run (কম-খরচের serverless deployment)

Repository-তে `scanner/cloudrun-service.yaml` ও `scanner/deploy-cloudrun.sh` দেওয়া হয়েছে। এটি একই Cloud Run instance-এ দুটি container চালায়:

- `clamav/clamav:stable` sidecar: 4 GiB RAM, ClamAV signature database ও scan daemon
- DSAI scanner gateway: 512 MiB RAM; ClamAV-এর সঙ্গে `127.0.0.1:3310` দিয়ে যোগাযোগ করে
- Cloud Run HTTPS endpoint: managed TLS; scanner URL হয় `https://SERVICE-....run.app/scan`
- Cloud Run Secret Manager-এ 256-bit API key তৈরি হয়; key GitHub-এ commit বা deployment log-এ print হয় না
- Service scale-to-zero; max instance 1 এবং concurrency 1 দিয়ে initial cost/parallelism নিয়ন্ত্রিত

### Deploy (Google Cloud Shell বা নিজের Linux/Termux-এ gcloud CLI)

1. Google Cloud project নির্বাচন করুন এবং billing account সক্রিয় আছে নিশ্চিত করুন। Cloud Run free tier থাকলেও billing account প্রয়োজন; free quota ছাড়ালে বা অন্যান্য build/network services ব্যবহার হলে charge হতে পারে।
2. `gcloud auth login` করে project ID নির্ধারণ করুন।
3. Repository clone করা workspace-এর root থেকে চালান:

```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
bash scanner/deploy-cloudrun.sh YOUR_GCP_PROJECT_ID us-central1
```

4. Script প্রয়োজনীয় APIs enable, Artifact Registry repository, least-privilege runtime service account, Secret Manager secret, image build এবং Cloud Run service deploy করে। Deploy শেষে scanner URL দেখায়।
5. Secret key শুধু নিজের terminal-এ পড়ুন:

```bash
gcloud secrets versions access latest --secret=dsai-malware-scanner-api-key --project=YOUR_GCP_PROJECT_ID
```

এই output-টি ChatGPT, GitHub, issue বা terminal recording-এ paste করবেন না। Vercel project `dsai`-এ Production ও Preview environment-এর জন্য `MALWARE_SCANNER_API_KEY` নামে Encrypted variable হিসেবে সেট করুন; `MALWARE_SCANNER_URL`-এ deploy output-এর `/scan` URL দিন। তারপর দুই environment redeploy করুন।

6. `GET /healthz`-এ HTTP 200 ও `ready:true` না পাওয়া পর্যন্ত scanner ready নয়। Invalid key → 401, EICAR → 422, clean sample → 200 `clean:true`, scanner unavailable → 503 প্রমাণ করুন।
7. Google Cloud Billing-এ budget alert ও usage alert সেট করুন। Free-tier allowance চিরস্থায়ী/সীমাহীন নয়। Cloud Run scale-to-zero cold start-এ প্রথম scan ধীর হতে পারে; timeout ও Android browser acceptance test-এ তা মাপুন।

### Security note

Cloud Run endpoint HTTPS-এ public ingress নেয়, কারণ Vercel backend থেকে Google IAM identity token যোগ করার আলাদা integration এখানে নেই। তাই endpoint-এ high-entropy bearer secret আবশ্যক; Secret Manager শুধু Cloud Run runtime service account-কে secret access দেয়। Secret rotate করলে Cloud Run ও Vercel-এর value একই release window-তে update করে redeploy করতে হবে। Public URL-কে secret মনে করবেন না।

## বিকল্প B — নিজস্ব Linux VM/VPS

আগের `docker-compose.clamav.yml` পদ্ধতি বজায় আছে। এটি long-running service-এর জন্য উপযুক্ত, কিন্তু VM-এ ClamAV-এর 3–4 GiB RAM, disk, TLS/DNS, patching ও monitoring দিতে হবে। Free ephemeral/sleeping host production-এর জন্য নয়।

## Deploy scanner gateway

1. Use a maintained Linux host with Docker Compose and enough RAM/disk for ClamAV signature updates. A free ephemeral/sleeping container is not a reliable malware-scanning production service.
2. Point a DNS A/AAAA record for your scanner subdomain to that host. On the host, create a `.env` file containing `SCANNER_DOMAIN=scanner.your-domain.example` and a unique `MALWARE_SCANNER_API_KEY`; protect it with mode 600.
3. Run `docker compose -f docker-compose.clamav.yml up -d --build`. Set Vercel `MALWARE_SCANNER_URL` to `https://scanner.your-domain.example/scan`.
4. The included Caddy service obtains and renews HTTPS certificates automatically. Open inbound TCP 80/443; do not publish clamd port 3310. The scanner gateway listens only on localhost port 8080 and is proxied internally by Caddy.
5. Verify `GET /healthz` and authenticated `POST /scan`. An invalid API key must return 401; EICAR test file must return 422; a known benign test file must return 200 with `clean:true`.
6. Configure Vercel variables above and redeploy the application. Keep the API key identical on both sides; rotate it together.

## File types and limits

PDF, DOCX, XLSX, CSV, TXT, JSON, JPEG, PNG, WebP; 10 MiB per file. Legacy binary DOC/XLS and archives are intentionally excluded. DOCX/XLSX are ZIP-based formats: before enabling downstream document parsing, add archive entry-count, expanded-size, path traversal and decompression-ratio limits.

## Security invariants

- No anonymous upload; user ID comes from authenticated session, never from request body.
- File is first written only to the private quarantine namespace using a short-lived, single-object signed upload token; ClamAV must return an explicit clean verdict before the app exposes download or AI processing.
- Scanner timeout, DNS/network error, invalid response, missing credentials or Storage failure rejects upload.
- Never create public URLs. Downloads require authenticated owner and clean metadata.
- File response is attachment + octet-stream + nosniff + no-store.
- Retention cleanup removes Storage objects before database metadata; failures preserve metadata for retry.
- Do not log file contents, bearer tokens, service-role keys or signed URLs.

## Acceptance gate

Run in a non-production test account first:
- Upload benign PDF/TXT/CSV/JSON/JPEG/PNG/WebP and Office Open XML files.
- EICAR must be rejected; scanner outage must return 503.
- Wrong MIME/signature, checksum mismatch and >10 MiB must be rejected.
- User A must not list or download User B files.
- Expired objects and metadata must both be deleted.
- Repeat in Android Chrome and desktop browser.
Only publish “Production user acceptance is done” after all tests pass with recorded evidence.
