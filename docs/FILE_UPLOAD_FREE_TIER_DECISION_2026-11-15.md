# DSAI file-upload hosting decision — 2026-11-15

## Decision

Do not deploy a malware-scanning service on a free-tier host and do not enable uploads merely because an endpoint URL or API key exists.

The existing DSAI app runs on Vercel serverless. Use the private Cloudflare R2 Standard bucket `dsai-user-file` as the preferred document object store when the bucket-scoped S3 credentials are configured; object keys must start with `DSAI/`. Keep the existing private Supabase Storage bucket `dsai-user-files` as fallback and for historical objects. A malware scanner is a separate compute workload and is not provided by either storage service.

## Free-tier assessment

| Option | Free allowance / limitation | Suitability for production malware scanning |
|---|---|---|
| ClamAV | Open-source software; no software license fee | The scanner still needs an always-available machine, memory, CPU, signature updates and monitoring. Software being free does not make hosting free. |
| Render Free Web Service | 512 MB RAM; free instances can spin down, restart, and have no persistent disk; Render explicitly says not to use free instances for production | Not recommended for an always-available upload scanner. Cold starts and restarts can interrupt scanning; 512 MB is a tight memory budget for an AV daemon and signature database. |
| Cloudflare Workers Free | 128 MB memory and 10 ms CPU per request; request-body limit depends on zone plan | Not suitable for running ClamAV or parsing/scanning document bytes. Good for lightweight routing/auth checks, not AV execution. |
| Supabase Free Storage | 1 GB included storage quota; private buckets enforce access control through RLS | Suitable for private storage, not a malware-scanning engine. Storage quota/egress limits still apply. |
| VirusTotal public API | Public/free API is rate-limited and files are submitted to a third-party analysis service | Not selected: user documents can contain private information; public API terms/privacy are not an acceptable default for private user uploads. |

## Recommended lowest-complexity production architecture

1. Prefer private R2 Standard bucket `dsai-user-file` with DSAI-only key prefix; keep `dsai-user-files` private in Supabase as fallback.
2. Keep the existing 10 MiB per-file limit and strict MIME/signature allowlist.
3. Upload through an authenticated backend-issued, short-lived upload authorization; use opaque per-user object keys.
4. Store new objects in quarantine. Never expose public URLs.
5. Scan with ClamAV on a small, separately hosted, monitored Linux service with enough memory, signature updates, authentication/HMAC, request timeouts, and health checks.
6. Promote only clean files to the user's private library; fail closed on scanner errors/timeouts.
7. Serve files only after owner checks, using short-lived signed downloads and `Content-Disposition: attachment` plus `X-Content-Type-Options: nosniff`.
8. Add cleanup for both expired metadata and storage objects; verify deletion.

## Cost statement

There is no reliable guarantee that this architecture can run forever at $0. The ClamAV code is free, but a production-grade always-on host is not guaranteed to be free. Provider free tiers can change, pause, restart, impose quotas, or prohibit production use. Supabase free storage is quota-limited and may pause inactive projects.

## Implemented scannerless policy and release gate

The original conservative quarantine-only proposal above was superseded by the 2026-11-15 implementation decision in PR #13 / PR #14 and the corresponding Production code:

- With no malware scanner configured, a file that passes exact length, SHA-256 and signature checks is marked `validated`, never `clean`.
- Owner-only, short-lived attachment downloads are permitted for `validated` files, with a visible Bengali warning that antivirus scanning was not performed.
- A configured scanner outage, timeout, invalid response or authentication failure remains fail-closed; the file stays quarantined.
- Only an explicit ClamAV clean verdict may set `scanStatus=clean`.
- No document-AI processing pipeline is currently implemented; unscanned files must not be passed to future parsers or AI jobs.

Do not mark Production User Acceptance complete until authenticated browser E2E tests prove the selected scannerless upload/download path, two-account isolation, rejected-file cleanup/quota release and retention cleanup. Malware-scanned Production acceptance additionally requires a live authenticated ClamAV endpoint, EICAR rejection, benign-file acceptance and scanner-outage verification.

## Sources (official)

- ClamAV: https://www.clamav.net/
- Render free instance limits: https://render.com/docs/free
- Render pricing: https://render.com/pricing
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Supabase pricing: https://supabase.com/pricing
- Supabase Storage pricing: https://supabase.com/docs/guides/storage/pricing
- Supabase private bucket access model: https://supabase.com/docs/guides/storage/buckets/fundamentals
- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html


## Current R2 provisioning update (2026-11-15)

- R2 subscription is now active; API listing confirms bucket `dsai-user-file` exists in APAC with Standard storage class.
- Bucket CORS currently allows only `https://dsai-one.vercel.app` and `https://dsai-git-main-dsai-5f29bf01.vercel.app`; methods PUT/GET/HEAD; request headers Content-Type and If-None-Match; exposed ETag; 1-hour preflight cache. No Preview origin is currently allowed.
- A bucket-scoped Object Read & Write credential is configured for `dsai-user-file` and stored only in Vercel Production server-side variables. No R2 credentials are provisioned to Preview. Credential values are never stored in this document or Git.
- Vercel Production has `R2_BUCKET_NAME=dsai-user-file`, `R2_OBJECT_PREFIX=DSAI`, `FILE_STORAGE_PROVIDER=auto`, plus encrypted access key variables. Preview deliberately has no R2 access.
- Application code is being updated to enforce the exact bucket and DSAI object prefix. CI and signed-object end-to-end tests must pass before R2 is called live in the app.
- DSAI app-side hard stops are 4.5 GB live object bytes, 450,000 Class A/month and 4,500,000 Class B/month (90% of DSAI's half allocation). Atomic Postgres counters fail closed at these limits. Cloudflare's account-wide free allowance is still shared across all buckets, so unrelated account projects can consume the account allowance; the bucket-scoped token prevents those projects from accessing this DSAI bucket, not from using their own buckets.


## DSAI quota enforcement

The Supabase migration `dsai_r2_usage_quota` creates an atomic usage ledger. Before each R2 presigned PUT, the backend reserves one Class A operation and the requested object bytes. Before each R2 GET, it reserves one Class B operation. The limits are 4.5 GB current object bytes, 450,000 Class A/month and 4,500,000 Class B/month. The app blocks further operations when a threshold is reached or the quota database is unavailable. A 10% reserve remains below DSAI's maximum 50% share.

This protects DSAI's own usage but cannot isolate Cloudflare account-wide free-tier billing from other independently credentialed projects on the same account. Monitor account-level usage separately.


## Cloudflare-native malware scanning recheck (2026-11-15)

The user-selected hosting constraint is Cloudflare-first; Google Cloud deployment artifacts are not part of the accepted implementation.

- Cloudflare Workers Free is suitable for lightweight request routing and authorization, not for running the native ClamAV daemon and its signature database.
- Cloudflare Containers support native Linux workloads but require Workers Paid. Official pricing lists a $5/month minimum plan charge, with included resource allowances and metered overages. No plan upgrade was performed.
- Cloudflare WAF malicious-upload detection exists, but official documentation states Enterprise plan plus a paid add-on. It is not an always-free option.
- The existing account Worker `lucky-tooth-541b` was inspected; it has no configured routes and is not confirmed as DSAI infrastructure. It was not modified.
- Therefore there is no verified always-free, Cloudflare-only production ClamAV runtime in the current account. The implemented scannerless policy allows a checksum/signature-valid file to become `validated` (never `clean`) and permits only an owner-scoped, short-lived private download with a clear antivirus-not-performed warning. This is not malware protection; downstream AI/document parsing must remain disabled until a scanner and archive-bomb protections are in place. If a configured scanner is unhealthy, the flow fails closed and keeps the file quarantined.

Official references:
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/containers/
- https://developers.cloudflare.com/containers/platform/pricing/
- https://developers.cloudflare.com/waf/detections/malicious-uploads/


## Live configuration reconciliation (2026-11-15)

- Cloudflare API read-back confirms bucket `dsai-user-file`, APAC, Standard; the managed `r2.dev` domain is disabled.
- Live CORS read-back confirms only the two Production origins above and headers `Content-Type` and `If-None-Match`.
- R2 account metrics report one zero-byte `DSAI/` marker object; there are no uploaded user documents. Supabase `public.file_assets` currently contains 0 rows.
- The Supabase security advisor reports RLS enabled with no policies on 27 tables. The six inspected tables (`file_assets`, `dsai_r2_usage_counters`, `users`, `lead_records`, `lead_activities`, `access_cases`) also have no `anon` or `authenticated` table grants. This is deny-by-default for direct client Data API access; backend service-role access remains server-only. Do not add broad client grants to silence the informational advisor.
- The Supabase organization is currently on the Free plan. Supabase's current documentation says leaked-password protection is available on Pro and above, so it cannot be enabled on this Free plan without a paid upgrade. Do not upgrade without explicit approval. The current signup UI enforces a minimum of 8 characters and Turnstile is required, but DSAI does not currently perform a breached-password check.
- The DSAI application quota values are application-side guards, not Cloudflare account-wide hard billing caps. R2 account usage must still be monitored across every bucket/project.


## R2 free-tier billing boundary (2026-11-15)

Cloudflare's current R2 Standard free allowance is 10 GB-month of storage, 1 million Class A operations and 10 million Class B operations per month; direct R2 egress is free. Usage beyond the included monthly allowance is billed at the published rates. The allowance is shared at the Cloudflare account level, not reserved exclusively for DSAI.

DSAI's database-backed guards (4.5 GB live bytes, 450,000 Class A and 4,500,000 Class B reservations) are conservative application-level limits for this project. They are not an account-wide Cloudflare billing cap and cannot account for usage by other buckets or applications in the same Cloudflare account. Monitor Cloudflare billing/usage separately. Do not promise lifetime-zero-cost operation or unlimited storage.
