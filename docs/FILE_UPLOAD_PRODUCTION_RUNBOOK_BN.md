# DSAI Secure File Upload — Production Runbook

## Confirmed architecture and account state (2026-11-15)

- Application: existing Vite/React + Express/Vercel + Supabase Postgres; no stack replacement.
- Object storage: private Cloudflare R2 Standard bucket `dsai-user-file`, APAC.
- DSAI object namespace: `DSAI/<authenticated-user-id>/quarantine/<random-id>-<safe-name>`. `DSAI/` is an object-key prefix, not a separately provisioned filesystem folder.
- Public `r2.dev` access is disabled. Bucket CORS is limited to the configured DSAI origins and the required upload/download methods/headers.
- Vercel R2 credentials and bucket settings are Production-only. The bucket secret remains write-only/sensitive. Preview deployments intentionally do not receive the R2 credentials.
- Existing private Supabase Storage bucket `dsai-user-files` is retained for historical objects and fallback. No historical objects are migrated or deleted by this feature.
- DSAI app-side usage guards: 4.5 GB reserved/live bytes, 450,000 Class A operations/month and 4.5 million Class B operations/month. These are application guards, not a Cloudflare account-wide hard billing cap.

## Upload and download security contract

1. Authenticate the user and validate metadata (allowlisted MIME type, 10 MiB maximum, SHA-256).
2. Issue a short-lived create-only private upload authorization for the authenticated user's quarantine prefix; reserve R2 quota atomically before issuing it.
3. Persist owner-scoped metadata in Supabase before returning the upload capability. Compensate object/quota reservations on initialization failures.
4. Read the private object back and verify exact byte length, SHA-256 and file signature.
5. **When a production scanner is configured**, scan the file and mark it `clean` only after an explicit ClamAV clean verdict.
6. **When storage is available but no scanner is configured**, allow intake into private quarantine only. The asset remains `quarantined`; it cannot be downloaded, parsed, extracted, or sent to AI. The UI warns users and provides delete/retention controls. This is storage intake, not malware scanning or document processing.
7. If a configured scanner is unhealthy, times out, returns malformed output or is unavailable, fail closed and keep the file quarantined. Never downgrade a scanner failure into a successful upload.
8. Only an owner-scoped, unexpired asset with status `clean` can receive a short-lived private attachment download. The same `clean` gate is required by the document task worker.
9. Retention cleanup deletes the object before metadata and releases reserved bytes only after confirmed deletion.

## Malware scanner — Cloudflare-only assessment

The scanner gateway and ClamAV Docker Compose implementation are retained as source code, but no production scanner endpoint is currently deployed or configured.

- **Workers Free is not a ClamAV runtime**: its per-invocation CPU budget and runtime constraints are unsuitable for loading/running the native ClamAV daemon and signature database.
- **Cloudflare Containers** can run native Linux/container workloads, but the current official documentation states that Containers are available on Workers Paid. The Workers Paid plan has a $5/month minimum before any usage beyond included allowances. Do not enable or upgrade billing without explicit approval.
- **Cloudflare WAF malicious-upload content scanning** is an official alternative, but the current documentation marks it as an Enterprise plan feature with a paid add-on. It is not a free-tier solution.
- Existing Worker `lucky-tooth-541b` is not identified as a DSAI scanner, has no configured route in the inspected inventory, and must not be repurposed or modified without a separate review.
- R2 and Supabase Storage provide storage/access controls, not antivirus scanning.

**Release status:** the current scannerless implementation permits owner-only, short-lived downloads for files marked `validated` after checksum/signature checks; it never marks these files `clean`. This is a usability trade-off, not antivirus protection. A real ClamAV service is still absent from Production, so malware-scanned acceptance is incomplete. Scanner failures after configuration remain fail-closed.

## Production environment variables

Required server-only settings:
- Existing Supabase server configuration (database and service-role access).
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY` (sensitive/write-only)
- `R2_BUCKET_NAME=dsai-user-file`
- `R2_OBJECT_PREFIX=DSAI`
- `FILE_STORAGE_PROVIDER=auto`
- `MALWARE_SCANNER_URL` and `MALWARE_SCANNER_API_KEY` only after a real scanner service is deployed and verified.

Current Vercel environment inventory contains the R2 Production variables and does **not** contain `MALWARE_SCANNER_URL` or `MALWARE_SCANNER_API_KEY`. No Preview R2 credential is provisioned. Never add secrets to Git, browser bundles, chat, screenshots or logs.

## Supported file types and limits

PDF, DOCX, XLSX, CSV, TXT, JSON, JPEG, PNG, WebP and ZIP; 10 MiB maximum per file. ZIP archives are stored as opaque files and are not extracted. The browser uses a single PUT; resumable multipart uploads are not implemented. DOCX/XLSX are ZIP-based formats: before downstream parsing, add archive entry-count, expanded-size, path traversal and decompression-ratio limits.

## CI and acceptance gates

CI must run:
- TypeScript, accessibility checks, Vitest and production build.
- Scanner gateway integration tests for health, authentication, media type, clean verdict, infected verdict and scanner outage/fail-closed behavior.
- Docker Compose liveness and database readiness smoke tests.
- Machine-readable test/release evidence artifacts.

Production acceptance additionally requires:
- A real authenticated ClamAV scanner with fresh signatures and HTTPS is required only for the malware-scanned acceptance tier; no verified always-free Cloudflare-only runtime is currently available.
- EICAR rejection, benign-file acceptance, invalid-key rejection, scanner-outage behavior and oversized-file rejection are already covered by CI container tests, but must also be verified against the live scanner before claiming Production malware scanning.
- Authenticated R2 PUT → finalize → checksum/signature validation → owner-only download for `validated` files (current scannerless mode); and, after a scanner is provisioned, ClamAV clean-verdict → `clean`-only scanned download.
- Two distinct user accounts proving list/download/delete isolation.
- Retention cleanup and quota release verification.
- Android Chrome and desktop browser user acceptance.

Do not label the system Production-complete until these live tests are evidenced against a deployment tied to the merged commit.

## Official Cloudflare references

- Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Containers availability and runtime: https://developers.cloudflare.com/containers/
- Containers pricing: https://developers.cloudflare.com/containers/platform/pricing/
- WAF malicious-upload detection and plan requirement: https://developers.cloudflare.com/waf/detections/malicious-uploads/
