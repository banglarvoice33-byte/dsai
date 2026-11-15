# DSAI Secure File Upload — Production Runbook

## Free-tier storage architecture (current target)

- **Cloudflare R2 Standard** is the preferred document object store when enabled: the current R2 free allowance is 10 GB-month storage, 1 million Class A operations and 10 million Class B operations per month, with no egress charge. This is a quota, not unlimited storage.
- **Supabase Storage** remains the automatic fallback and existing private storage path: Free includes 1 GB Storage and 5 GB cached + 5 GB uncached egress across the organization. Existing generated images remain in their current bucket; document storage uses `dsai-user-files`.
- Combined nominal object capacity is up to approximately 11 GB across two independent providers, subject to each provider's separate quotas and current plan. No storage is pooled and no free-tier allowance is guaranteed forever.
- Storage selection: `FILE_STORAGE_PROVIDER=auto` (default) chooses R2 when all R2 credentials exist, otherwise Supabase. Set `r2` or `supabase` to pin a provider.
- New R2 objects are stored with an `r2:` provider prefix in the existing `file_assets.storageKey`; historical rows without a prefix continue to resolve to Supabase. This permits a later VPS scanner to read either backend without a data migration.
- Uploads can finish into private quarantine without a scanner. **No file is downloadable or available to downstream processing until ClamAV returns a clean verdict.** Scanner setup is a separate step; never interpret “uploaded” as “safe”.


## বাস্তব অবস্থা

DSAI backend-এ upload route, account ownership check, 10 MiB limit, SHA-256 verification, MIME allowlist, basic file-signature checks, authenticated ClamAV adapter, private Supabase Storage adapter, clean-only download এবং retention cleanup যোগ করা হয়েছে। কোনো scanner/storage secret না থাকলে upload fail-closed থাকবে।

## Components

- Preferred object store: Cloudflare R2 bucket `dsai-user-file` (private; enable R2 first; DSAI objects use the `DSAI/` key prefix)
- Fallback object store: Supabase Storage bucket `dsai-user-files` (private)
- API: existing Express/Vercel application
- Scanner: ClamAV daemon + authenticated HTTP gateway
- Database: existing `file_assets` table
- UI: Workspace → Documents

## Required Vercel Production environment variables

Set these names only; never commit values:

- `SUPABASE_URL`: existing Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: service-role key (server-only; never use a VITE_ prefix)
- `FILE_STORAGE_PROVIDER`: optional `auto` (default), `r2`, or `supabase`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME=dsai-user-file`, `R2_OBJECT_PREFIX=DSAI`: server-only Cloudflare R2 credentials and bucket
- `MALWARE_SCANNER_URL`: HTTPS URL ending in `/scan`
- `MALWARE_SCANNER_API_KEY`: long random secret shared with scanner gateway

ClamAV host/port are private to the scanner compose network. Do not expose port 3310 publicly.


## Cloudflare R2 setup (one-time account action)

1. In the existing Cloudflare account, open **R2 Object Storage** in the dashboard and enable R2. R2 activation is complete; the private `dsai-user-file` Standard bucket is verified in APAC.
2. Use the existing **private Standard** bucket `dsai-user-file` (not public). DSAI's app-side hard stops are set below 50% of the published free allowance: 4.5 GB current reserved object bytes (below 5 GB), 450,000 Class A operations/month (below 500,000), and 4,500,000 Class B operations/month (below 5,000,000). A 10% safety reserve remains inside DSAI's half allocation.
3. Create an R2 API token scoped only to this bucket with **Object Read & Write**. Copy the Access Key ID and Secret Access Key once; do not share them in chat, GitHub, screenshots or logs.
4. Add the four R2 environment variables above to Vercel Production and Preview as encrypted server-side variables. `R2_ACCOUNT_ID` is the Cloudflare account ID, and `R2_BUCKET_NAME=dsai-user-file` and `R2_OBJECT_PREFIX=DSAI`. Keep the existing Supabase variables as fallback.
5. Bucket CORS is configured for exact DSAI Production, main alias and current Preview origins. It allows `PUT`, `GET`, `HEAD`; `Content-Type` and `If-None-Match`; exposes `ETag`; preflight max-age 3600. Do not enable public bucket access.
6. Set `FILE_STORAGE_PROVIDER=auto`, redeploy Preview, and verify the API reports R2 as the selected provider without exposing credentials. Upload a harmless test file, verify its R2 object exists and owner isolation/download gates work, then remove the test asset.
7. Keep the Supabase private bucket and credentials in place as fallback and for existing assets. R2 does not automatically migrate the historical Supabase objects.

The repository's R2 adapter uses short-lived S3-compatible presigned PUT URLs. The browser sends bytes directly to R2; Vercel receives only metadata and scan-control requests. R2 API credentials never enter browser code.

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

6. `GET /healthz`-এ HTTP 200 ও `ready:true` না পাওয়া পর্যন্ত scanner ready নয়। মনে রাখুন: বর্তমান health check ClamAV PING পরীক্ষা করে, signature database-এর বয়স নয়। ClamAV `VERSION`/freshclam logs দিয়ে database freshness যাচাই করুন; stale database হলে upload fail-closed রাখুন। Invalid key → 401, EICAR → 422, clean sample → 200 `clean:true`, scanner unavailable → 503 প্রমাণ করুন।
7. Google Cloud Billing-এ budget alert ও usage alert সেট করুন। Free-tier allowance চিরস্থায়ী/সীমাহীন নয়। Cloud Run scale-to-zero cold start-এ প্রথম scan ধীর হতে পারে। Request-based billing-এ sidecar CPU startup ও active request চলাকালীনই পায়; continuous background signature updates দরকার হলে persistent Linux VM অথবা budget-সহ minimum instance/instance-based billing বেছে নিন। Timeout, signature freshness ও Android browser acceptance test-এ তা মাপুন.

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

PDF, DOCX, XLSX, CSV, TXT, JSON, JPEG, PNG, WebP; 10 MiB per file in this release. The current single-PUT browser path is intentionally capped while resumable multipart upload is not yet implemented. Legacy binary DOC/XLS and archives are intentionally excluded. DOCX/XLSX are ZIP-based formats: before enabling downstream document parsing, add archive entry-count, expanded-size, path traversal and decompression-ratio limits.

## Security invariants

- No anonymous upload; user ID comes from authenticated session, never from request body.
- File is first written only to the private quarantine namespace using a short-lived, single-object signed upload token; ClamAV must return an explicit clean verdict before the app exposes download or AI processing.
- Scanner timeout, DNS/network error, invalid response or missing scanner credentials leaves the file quarantined and returns a retryable service error; the file must remain unavailable. Missing storage credentials rejects upload.
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


## DSAI namespace and free-tier budget policy (2026-11-15)

- R2 bucket name is exactly `dsai-user-file`; the visible folder is a key prefix, not a real directory. New R2 keys must be `DSAI/<authenticated-user-id>/quarantine/<random-id>-<safe-name>`.
- The R2 adapter refuses a different bucket or prefix. Existing Supabase objects retain their historical `<user-id>/quarantine/` paths and remain in the existing private `dsai-user-files` bucket.
- Create the R2 API token with **Object Read & Write** and **Apply to specific buckets only → dsai-user-file**. Do not create an account-wide token or reuse this token in any other application. Keep credentials server-side in Vercel encrypted environment variables only.
- Target budget (50% of the published R2 Standard free allowance): 5 GB-month storage, 500,000 Class A requests/month, 5,000,000 Class B requests/month. Alert at 70% and 85% of these DSAI targets and stop issuing new upload/download authorizations at 90%.
- Important enforcement limitation: Cloudflare's free allowance is account-level and shared across buckets. A bucket-scoped token isolates object access, but it does not reserve half of the account quota or prevent other account projects from consuming it. Cloudflare does not provide a native hard monthly spend/usage cap for this free allowance. The app must maintain its own atomic monthly usage ledger and fail closed at the DSAI thresholds; account usage must also be monitored in Cloudflare Billing. Until that ledger and alerts are deployed and tested, the 50% figures are targets, not a verified hard cap.
- The current release still has no confirmed R2 subscription, bucket or credentials. R2 API returned error 10042 until the account owner completes dashboard activation. Do not claim R2 active until the bucket-scoped token and an actual signed PUT/GET test succeed.


### Enforced quota ledger

Migration: `drizzle/migrations/0001_dsai_r2_usage_quota.sql`; applied to Supabase project `wleytsrflhboyevhigiu`.

| Metric | 50% allocation ceiling | DSAI enforced stop | Measurement |
|---|---:|---:|---|
| Storage | 5,000,000,000 bytes | 4,500,000,000 bytes | Live reserved object bytes; released after retention cleanup |
| Class A | 500,000/month | 450,000/month | One reservation per presigned create-only PUT |
| Class B | 5,000,000/month | 4,500,000/month | One reservation per app-issued R2 GET (scan/read/download) |

- Counters are updated by atomic Postgres functions, so concurrent requests cannot race past the app threshold.
- R2 presigned PUT URLs expire after 5 minutes and include `If-None-Match: *`; the browser sends the condition header, so a URL cannot overwrite an existing object or be replayed while the object exists.
- Security/billing caveat: the 5-minute presigned URL is a bearer capability. `If-None-Match: *` prevents overwrites, but repeated failed replay attempts can still be billed as Class A by R2. The ledger reserves one Class A per issued URL, not every direct browser retry. This is a strong normal-use application budget guard, not an absolute adversarial Class A billing cap. Strict enforcement against replay would require proxying uploads through a one-time-use gateway (for example, a Cloudflare Worker + durable one-time nonce) instead of direct presigned PUT.
- Storage reservations are released only after successful object deletion and metadata cleanup. Failed cleanup retains the reservation rather than undercounting.
- This ledger is scoped to DSAI's app operations and DSAI bucket. It cannot reserve or police the rest of the Cloudflare account's shared free tier. Other account projects with separate credentials can still consume the account-level free allowance. No claim of account-wide financial isolation is made.
