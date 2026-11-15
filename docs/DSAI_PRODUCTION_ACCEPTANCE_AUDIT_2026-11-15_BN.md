# DSAI production acceptance audit — 2026-11-15

> **Status: NOT PROVEN PRODUCTION-COMPLETE.** This report records verified repository, CI, deployment and backend evidence. It does not represent a human browser session or successful end-to-end acceptance by a real user.

## Scope and evidence

- Repository: `banglarvoice33-byte/dsai`
- Production hostname: `https://dsai-one.vercel.app`
- Production baseline commit observed in Vercel: `72a76242fdccc6cf5436552d4436ca55220a9429`
- Audit/CI branch: `fix/ci-run-on-pull-requests-20261115`
- PR: [#7](https://github.com/banglarvoice33-byte/dsai/pull/7), draft and unmerged at audit time
- PR head before this report: `df31c64e45257231f3eae5c125d2230ea0751fc7`
- CI run: [43685814182](https://github.com/banglarvoice33-byte/dsai/actions/runs/43685814182)
- CI artifact: [dsai-ci-evidence-`df31c64...`](https://github.com/banglarvoice33-byte/dsai/actions/runs/43685814182/artifacts/14150217622)
- Unit test evidence: 53 Vitest files, 169 tests passed; JUnit XML emitted.
- CI steps passed: TypeScript, accessibility contract, Vitest/JUnit, production build, Docker Compose liveness and database-readiness smoke checks, evidence artifact upload.

The CI run validates the tested commit in GitHub's runner. It does not prove production runtime behavior, third-party provider availability, account-specific user journeys, security isolation across real accounts, or usability on physical devices.

## Verified findings

| Area | Finding | Status |
|---|---|---|
| PR CI | Workflow now runs on pull requests targeting main. Vitest invocation was corrected to call Vitest directly so JUnit output is generated. | PASS on run 43685814182 |
| Merge/deploy | PR #7 remains draft/unmerged. Production still points to the previously observed main deployment/commit. | NOT RELEASED |
| Browser acceptance | No authenticated browser session, real user account, or browser automation run was available to this audit. Public page fetches were not readable in the audit environment. | NOT TESTED |
| File upload API | Both `server/_core/index.ts` and `server/_core/vercelApp.ts` authenticate then return 503 when scanner configuration is absent; even when configured, they return 501 because the upload adapter is not implemented. | FAIL / NOT AVAILABLE |
| Malware scanner | No `MALWARE_SCANNER_URL` or `MALWARE_SCANNER_API_KEY` key was present in the Vercel project environment-variable names checked during this audit. No scanner endpoint/vendor has been selected. | BLOCKED |
| Supabase user-file bucket | Private `dsai-user-files` bucket exists, 10 MiB cap, allowlisted PDF/TXT/CSV/JSON/JPEG/PNG/WebP MIME types. Bucket existence is not an upload implementation. | CONFIGURED ONLY |
| Image generation | Edge Function `dsai-image-generate` is deployed and JWT verification is enabled. Code review found auth/guest handling, daily quota logic, provider fallback and private signed image delivery. Real generation, quota exhaustion, fallback and download have not been executed as a user. | CODE REVIEW ONLY |
| Database RLS | RLS is enabled on the audited public tables. The reviewed table grants did not show direct anon/authenticated table privileges, and no public-table policies were returned. This can be intentional deny-by-default, but privileged server paths must enforce per-user ownership and must be tested with separate accounts. | DESIGN REVIEW REQUIRED |
| SECURITY DEFINER | Custom security-definer routines were inspected for function configuration and ACL. This is not a substitute for reviewing every call path and running adversarial authorization tests. | PARTIAL REVIEW |
| Auth password security | Supabase advisor previously reported leaked-password protection disabled. | ACTION REQUIRED |
| CRM/library isolation | No two-account create/read/update/export/delete acceptance test has been executed. | NOT TESTED |
| Integrations | Email/SMS/WhatsApp, calendar/messaging, payment/webhook and external provider journeys need explicit feature inventory and provider-backed tests; unavailable integrations must be labeled clearly in the UI. | NOT PROVEN |
| Cloudflare account security | Account 2FA enforcement was previously observed disabled. Do not infer that an individual login lacks 2FA; enable enforcement where account policy permits. | ACTION REQUIRED |
| Production logs | A prior runtime warning `TimeoutNegativeWarning` was observed. A later log query did not provide a complete export, so absence of errors cannot be asserted. | INVESTIGATE |

## User-journey acceptance matrix

A feature is PASS only after a normal-user positive journey and relevant negative/security cases succeed in a browser against a deployment tied to a known commit.

| Journey | Positive test | Negative/security test | Current result |
|---|---|---|---|
| Guest / Try First | Open entry page, submit Bengali prompt, receive useful response | Empty prompt, over-limit input, abuse/rate limit | NOT TESTED |
| Sign-up / sign-in | Sign up, verify email, sign in, sign out | Invalid credentials, unverified email, invalid/missing CAPTCHA | NOT TESTED |
| UAA | Ask for Bengali notice summary, eligibility, documents and deadline checklist | Ambiguous/empty input, unsupported file, provider timeout | NOT TESTED |
| Creative Studio | Generate image, preview, save to private library, download | Third generation over quota, provider failure/fallback, invalid prompt | CODE REVIEW ONLY |
| File upload | Upload clean allowed file, scan, store privately, issue expiring signed URL | EICAR test file blocked, wrong MIME/signature, oversize file, traversal filename, scanner timeout | FAIL / NOT AVAILABLE |
| Library | List own assets, preview, download, delete | User B cannot list/read/download/delete User A object | NOT TESTED |
| CRM/drafts | Create, update, list, export own records | Cross-user ID substitution and export isolation | NOT TESTED |
| Session | Logout and verify session is no longer accepted | Replay expired/revoked token | NOT TESTED |
| Responsive/accessibility | Keyboard, screen reader, small Android viewport, Bengali text | Focus traps, contrast, overflow, touch-target failures | AUTOMATED CONTRACT ONLY |
| Recovery | Restore database backup and rollback deployment | Restore from known backup and verify data integrity | NOT TESTED |

## Required remediation gates

1. **Add a repeatable browser E2E suite.** Use Playwright against a disposable preview/staging deployment, not production data. Cover guest UAA, auth, image generation with a mocked provider, library, CRM, upload and two-user isolation. Use dedicated disposable test identities and secrets stored only in GitHub/Vercel secret stores. Capture trace, screenshots, console errors, failed network requests and commit/deployment metadata as CI artifacts. Do not put credentials or personal data in artifacts.
2. **Finish upload before exposing it.** Choose and operate a malware scanner with a documented authenticated API contract. Implement multipart parsing with strict request limits; verify extension, declared MIME and file signature; generate opaque object keys; quarantine before scanning; fail closed on scanner timeout/error; promote only clean files into the private bucket; persist owner-bound metadata; issue short-lived signed URLs; clean up rejected/abandoned objects. Add EICAR and malformed-file tests. Do not bypass scanning or treat a configured URL as proof of a working scanner.
3. **Prove authorization.** Inventory every public table, storage object path, RPC and tRPC procedure. Document whether it is user-owned, shared/system-owned or server-only. Add least-privilege RLS policies where clients access data; retain deny-by-default for server-only tables and ensure server code checks the authenticated owner before privileged operations. Test with User A and User B, including ID substitution and export paths.
4. **Harden Auth.** Enable leaked-password protection if supported by the plan/configuration, set sensible password policy, validate Turnstile server-side, and test email verification, reset, logout and session revocation. Do not place CAPTCHA secret keys in client code.
5. **Instrument the real UX.** Add stable selectors/accessible labels, Bengali loading/empty/error/quota messages, clear unsupported-feature labels, and actionable recovery guidance. Do not promise video, messaging, booking or automated submission unless implemented and tested.
6. **Release safely.** Require the PR CI checks, deploy a Preview, run E2E and manual acceptance on a real Android device, merge only after review, verify the Production alias points to the merged SHA, then rerun smoke and critical user journeys. Keep rollback instructions and tested backups.

## Guardrails

- No production merge or deployment was performed as part of this audit.
- No RLS policies, Auth settings, production secrets, DNS records or third-party integrations were changed.
- Do not claim all features work based on unit tests, a READY deployment, or a healthy database alone.
- User-provided test accounts must be disposable; never request passwords, OTPs, API keys or recovery codes in chat.
- If the platform cannot run a real browser journey, report it as NOT TESTED and use CI browser automation plus a user-operated acceptance session to close the gap.

## Authoritative implementation references

- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase password security](https://supabase.com/docs/guides/auth/password-security)
- [Playwright CI documentation](https://playwright.dev/docs/ci)
- [Vercel deployment protection](https://vercel.com/docs/security/deployment-protection)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

---
Audit prepared from connected repository and service metadata/code inspection on 2026-11-15. Re-run all checks after every remediation commit; this report is a dated snapshot, not a permanent certification.
