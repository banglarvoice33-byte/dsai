# DSAI file-upload hosting decision — 2026-11-15

## Decision

Do not deploy a malware-scanning service on a free-tier host and do not enable uploads merely because an endpoint URL or API key exists.

The existing DSAI production app runs on Vercel serverless and already has a private Supabase Storage bucket (`dsai-user-files`, 10 MiB cap). Keep Supabase Storage as the document object store. A malware scanner is a separate compute workload and is not provided by Supabase Storage itself.

## Free-tier assessment

| Option | Free allowance / limitation | Suitability for production malware scanning |
|---|---|---|
| ClamAV | Open-source software; no software license fee | The scanner still needs an always-available machine, memory, CPU, signature updates and monitoring. Software being free does not make hosting free. |
| Render Free Web Service | 512 MB RAM; free instances can spin down, restart, and have no persistent disk; Render explicitly says not to use free instances for production | Not recommended for an always-available upload scanner. Cold starts and restarts can interrupt scanning; 512 MB is a tight memory budget for an AV daemon and signature database. |
| Cloudflare Workers Free | 128 MB memory and 10 ms CPU per request; request-body limit depends on zone plan | Not suitable for running ClamAV or parsing/scanning document bytes. Good for lightweight routing/auth checks, not AV execution. |
| Supabase Free Storage | 1 GB included storage quota; private buckets enforce access control through RLS | Suitable for private storage, not a malware-scanning engine. Storage quota/egress limits still apply. |
| VirusTotal public API | Public/free API is rate-limited and files are submitted to a third-party analysis service | Not selected: user documents can contain private information; public API terms/privacy are not an acceptable default for private user uploads. |

## Recommended lowest-complexity production architecture

1. Keep `dsai-user-files` private in Supabase Storage.
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

Until a scanner host and secret are configured and verified, keep `uploadsEnabled=false`. Do not label a file "clean" based only on extension, MIME type, or a successful Storage upload. Do not mark Production User Acceptance complete until browser E2E tests prove clean-file acceptance, EICAR rejection, malformed/oversize rejection, scanner-timeout fail-closed behavior, private download, and cross-account isolation.

## Sources (official)

- ClamAV: https://www.clamav.net/
- Render free instance limits: https://render.com/docs/free
- Render pricing: https://render.com/pricing
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Supabase pricing: https://supabase.com/pricing
- Supabase Storage pricing: https://supabase.com/docs/guides/storage/pricing
- Supabase private bucket access model: https://supabase.com/docs/guides/storage/buckets/fundamentals
- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
