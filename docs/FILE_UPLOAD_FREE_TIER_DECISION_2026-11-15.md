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

## Release gate

Until a scanner host and secret are configured and verified, uploads may only remain private in quarantine; downloads and downstream processing must remain disabled. The application must not mark any file clean without ClamAV. Do not label a file "clean" based only on extension, MIME type, or a successful Storage upload. Do not mark Production User Acceptance complete until browser E2E tests prove clean-file acceptance, EICAR rejection, malformed/oversize rejection, scanner-timeout fail-closed behavior, private download, and cross-account isolation.

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
- Bucket CORS is configured for the exact DSAI Production, main alias and current Preview origins; methods PUT/GET/HEAD; request header Content-Type; exposed ETag; 1-hour preflight cache.
- A bucket-scoped Object Read & Write credential was provisioned for only `dsai-user-file`, expires 2027-11-15, and stored as encrypted Vercel Production + Preview variables. Credential values are never stored in this document or Git.
- Vercel Production + Preview now have `R2_BUCKET_NAME=dsai-user-file`, `R2_OBJECT_PREFIX=DSAI`, `FILE_STORAGE_PROVIDER=auto`, plus encrypted access key variables.
- Application code is being updated to enforce the exact bucket and DSAI object prefix. CI and signed-object end-to-end tests must pass before R2 is called live in the app.
- DSAI app-side hard stops are 4.5 GB live object bytes, 450,000 Class A/month and 4,500,000 Class B/month (90% of DSAI's half allocation). Atomic Postgres counters fail closed at these limits. Cloudflare's account-wide free allowance is still shared across all buckets, so unrelated account projects can consume the account allowance; the bucket-scoped token prevents those projects from accessing this DSAI bucket, not from using their own buckets.


## DSAI quota enforcement

The Supabase migration `dsai_r2_usage_quota` creates an atomic usage ledger. Before each R2 presigned PUT, the backend reserves one Class A operation and the requested object bytes. Before each R2 GET, it reserves one Class B operation. The limits are 4.5 GB current object bytes, 450,000 Class A/month and 4,500,000 Class B/month. The app blocks further operations when a threshold is reached or the quota database is unavailable. A 10% reserve remains below DSAI's maximum 50% share.

This protects DSAI's own usage but cannot isolate Cloudflare account-wide free-tier billing from other independently credentialed projects on the same account. Monitor account-level usage separately.
