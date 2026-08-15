# DSAI File Upload Security and Retention Policy

**Status:** Controlled-alpha foundation; upload acceptance remains disabled until a signed malware-scanner adapter is configured and staged.

## Security posture

DSAI does not accept an uploaded file into a usable workflow unless the file can pass the full quarantine and malware-scanning gate. When the scanner configuration is absent, `POST /api/files/upload` returns `503 upload-scanner-required`; it never stores or exposes an unscanned upload. The protected `files.policy` procedure exposes the current limit and scanner state to an authenticated client, while `files.list` returns only that user's metadata and scan status.

## Intended pipeline

| Stage | Required behavior | Current status |
| --- | --- | --- |
| Authentication | Require a valid user session before upload initiation | Implemented at route boundary |
| Metadata validation | Normalize filename, allowlist MIME, cap size at 10 MiB, require SHA-256 format | Implemented |
| Quarantine namespace | Store objects under `{userId}/quarantine/…`; never expose quarantine keys as clean files | Implemented as metadata contract |
| Malware scanning | Send the quarantined object to a signed provider adapter; accept only an explicit clean verdict | Provider adapter required; upload fail-closed |
| Clean access | Permit application access only for `scanStatus=clean` and before retention expiry | Implemented in helper contract |
| Infected/error handling | Keep unavailable, record bounded status/message, do not expose the object | Implemented for scanner-unavailable state |
| Retention | Default seven-day retention, bounded to one–30 days at metadata registration | Implemented |
| Deletion | Remove database reference at expiry; the built-in storage contract treats an unreferenced key as inaccessible | Cleanup handler implemented |
| Scheduled cleanup | Cron-only `/api/scheduled/cleanupFileAssets`, authenticated through the Heartbeat identity | Implemented; schedule creation requires deployed production URL |

## Data minimization

MySQL stores metadata only: owner ID, storage key, normalized filename, MIME type, byte size, checksum, scan state, bounded scanner message, timestamps, and retention expiry. File bytes are not stored in MySQL. Scanner logs must not include file contents, bearer tokens, or raw document text.

## Scanner adapter gate

The adapter must be an allowlisted provider integration with a signed request or mutually authenticated channel, a bounded timeout, an explicit verdict enum, and a correlation ID. The adapter must treat timeout, malformed response, provider error, and unknown verdict as `error`, never as `clean`. Required environment values are `MALWARE_SCANNER_URL` and `MALWARE_SCANNER_API_KEY`; these are intentionally not populated in the current environment, so upload acceptance remains disabled.

A scanner adapter must be staged with harmless test fixtures, an EICAR-compatible test procedure where legally and operationally appropriate, oversized-file tests, malformed MIME tests, timeout tests, replay/duplicate checksum tests, and a verified deletion path before enabling the connector.

## Retention operations

The cleanup handler must be registered with a platform-managed Heartbeat after the site is deployed. Use a six-field UTC cron expression with a minimum interval of 60 seconds. The handler authenticates the cron identity, ignores attacker-controlled request body identifiers, selects expired rows by database expiry, deletes bounded batches, and returns a JSON result. The schedule must be persisted and monitored through the platform's schedule history. No in-process timer is used.

Because the current storage helper does not expose an object-delete operation, expired metadata is removed from the database and the object becomes unreferenced and inaccessible through the application. A production storage adapter with explicit delete confirmation should be added before contractual deletion SLAs are promised.

## Verification completed

TypeScript passed; 32 Vitest tests passed; the additive `file_assets` migration was applied; `/api/files/upload` returned 401 without a session; `files.policy` returned 401 without a session; the retention handler returned 403 without a cron session; `/healthz` and the public homepage returned 200. The release does not claim that a real malware scanner is active.

## Remaining launch gates

The remaining gates are scanner-provider configuration and signed adapter implementation, object-level storage deletion confirmation, independent upload threat modeling, staging with adversarial fixtures, distributed rate limiting, and an operator-visible retention/scan dashboard.
