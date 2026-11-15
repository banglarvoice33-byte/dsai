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
