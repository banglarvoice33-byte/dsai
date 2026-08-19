# DSAI Department Creator Skill Compliance Report

## Scope and method

This report evaluates every DSAI department against the common Creator Skill contract: user outcome, schema, ownership, provenance/evidence, human gate, fail-closed provider handling, complete UI states, accessibility/mobile support, regression coverage, observability, operator control, privacy/export/delete implications and truthful status labeling. Ratings are **Conformant**, **Conditionally conformant**, **Foundation**, or **Not live / provider-gated**. The assessment uses the current router contracts, database schema, file-security implementation, project release documents and the reusable parity reference. It does not treat marketing copy as implementation evidence.

## Executive scorecard

| Department | Rating | Key finding | Corrective priority |
|---|---|---|---|
| Bengali Access / UAA | Conditionally conformant | Real protected create/list flow with risk and workflow fields; consequential action is not autonomous | Maintain human-review evidence |
| Work Packet / Evidence | Conditionally conformant | Strong provenance, citation and review model; file lifecycle is incomplete | P0 scanner/deletion work |
| Creative Studio | Foundation / intake conformant | Request intake exists; generation/provenance pipeline is not live | Provider adapter and evaluation |
| Lead Action Planner | Conditionally conformant | Dry-run preview exists and avoids external side effects | Add consent/action packet before integration |
| Bengali Onboarding | Conditionally conformant | Five-step protected guide and curated fallback; LLM remains bounded | Add evaluation and latency/error telemetry |
| Alpha Dashboard / Community | Conditionally conformant | Verified user-owned metrics, notifications, rewards and achievements | Operator ledger and cohort evidence |
| Profile / Preferences | Conformant | Ownership-scoped profile and theme updates | Monitor auth/session boundary |
| Notifications / History | Conformant | User-scoped records, filters, idempotent acknowledgement and export | Test browser-specific export behavior |
| Secure File Intake | Foundation | Quarantine metadata exists; scanner and object deletion absent | P0 |
| Scholarship / Quotas | Foundation / core conformant | Review/status/usage foundation exists | Provider verification and policy audit |
| Admin / Connectors | Foundation / core conformant | Admin-only list/test/enable and operational surfaces exist | Secret vault, audit trail, recovery drill |
| Search / Discoverability | Foundation / core conformant | Normalization and admin analytics exist | Retention and sensitive-query policy |
| Privacy / Deletion | Foundation | Request and admin status lifecycle exists | Identity proof, cascades, deletion evidence |
| Auth / CAPTCHA / OAuth | Foundation / core conformant | Protected routes, OAuth state boundary and CAPTCHA contracts exist | Live callback and credential verification |
| Deployment / Operations | Foundation / core conformant | Env validation, scripts, health/readiness and docs exist | Backup, monitoring and rollback drills |
| CRM / Calendar / Messaging | Not live / provider-gated | No side-effecting production router contract exists | Do not advertise as live |
| Video/Image/Advanced Agents | Not live / provider-gated | Strategy references do not constitute a production adapter | Provider and evaluation design first |

## Detailed findings

### Bengali Access / UAA

The department meets the core schema, ownership, Bengali-first and error-boundary requirements through protected access-case procedures with workflow and risk fields. It is conditionally conformant because external submissions, messaging or appointment actions are not connected. The corrective action is to keep the current preview/review boundary and add an action packet only when an approved provider adapter exists.

### Work Packet / Evidence

This is the strongest DSAI department. Packet sources, citation states, review states and audit events provide a defensible evidence contract. It is conditionally conformant because a file can be registered in quarantine but not yet scanned by a configured malware provider, and the current cleanup path explicitly reports that storage deletion is unsupported. The P0 remediation plan addresses this gap.

### Creative Studio

Protected request intake, tiering and queue status provide a real foundation. The department does not yet meet a generation-level contract because provider execution, content provenance, safety moderation, cost limits and output retention are not evidenced. Public copy must remain intake/roadmap language until those controls exist.

### Lead Action Planner

The dry-run planner is appropriately bounded: it produces a proposed plan rather than sending messages or creating appointments. It is conditionally conformant. Before any live action, the planner must emit a Work Packet preview with recipient, channel, consent, timing, risk and idempotency fields and require explicit human approval.

### Bengali Onboarding

The protected five-step guide, curated Bengali fallback and server-side LLM boundary conform to the safe-assistant contract. It remains conditional because model availability, evaluation, latency, prompt-injection resilience and user feedback measurement require ongoing operational evidence.

### Alpha Dashboard / Community

The dashboard correctly distinguishes verified user-owned counts from operator-managed cohort and reward states. Achievements, leaderboards and notifications are not financial guarantees. Conditional status remains appropriate until the operator-owned referral/reward ledger, abuse review, cohort decision evidence and payout policy are operated in production.

### Profile / Preferences

The profile department is conformant for its current scope. Writes are protected and theme/language choices are reversible. Continue testing authorization, deletion propagation and accessibility across the three theme modes.

### Notifications / History

The department is conformant for current alpha scope. Records are user-scoped, mark-all-read is idempotent, category filters exist, and CSV/print-to-PDF exports avoid an extra server copy. The residual risk is browser print behavior and ensuring deletion removes exportable history according to the chosen policy.

### Secure File Intake

This is the most important nonconformity. Current code validates metadata and creates a quarantine record, but no configured malware scanner or provider-side object deletion exists. `getCleanFileAsset()` correctly fails closed for non-clean assets, but `cleanupExpiredFileAssets()` cannot yet prove object deletion. Do not enable production upload until the P0 remediation criteria pass.

### Scholarship / Quotas

The application, reviewer status and usage-limit foundation are present. Conditional operations require evidence of verification-provider behavior, notification timing before daily/monthly limits, abuse resistance, appeals and privacy-minimal retention. No student eligibility should be inferred from a self-attestation alone.

### Admin / Connectors

Admin procedures are role-gated and connector tests are intentionally no-send. This is a good foundation, not a complete integration operations department. Add encrypted token references, provider-specific scopes, audit events, health history, disable/revoke controls and recovery documentation before enabling live connectors.

### Search / Discoverability

Normalization and analytics are implemented with a bounded term length. Compliance is conditional until retention limits, sensitive-query exclusions, deletion behavior and analytics access review are documented and tested.

### Privacy / Deletion

A public request and admin review state machine exists. It is foundation-level because the current model does not itself prove identity beyond the submitted email/confirmation contract, nor does it encode a complete cascade across user-owned records, file objects, provider connections, backups and audit tombstones. The deletion remediation plan must be implemented before claiming completed erasure.

### Auth / CAPTCHA / OAuth

The core protected-route and OAuth-state boundaries are present, and CAPTCHA verification is separated from the auth procedure. Production compliance remains conditional until live callback, HTTPS, secret rotation, account recovery and disconnected-state verification are completed by the operator.

### Deployment / Operations

The project has env validation, health/readiness checks, deployment scripts and release documentation. It is conditionally conformant because production resilience requires verified backups, monitoring, incident response, dependency patching and rollback drills on the operator VPS.

### Provider-gated departments

CRM, calendar, messaging, video/image generation and advanced autonomous agents are not live production departments in the current implementation. Their compliance status is **not live / provider-gated**, not failed. The correct action is to keep the feature flag disabled and use the integration proposal’s preview-first, least-privilege, idempotent adapter architecture.

## Remediation register

| Finding | Severity | Owner | Exit criterion |
|---|---:|---|---|
| No real malware scanner adapter | Critical | Security/operator | Signed clean/infected verdict contract and outage tests |
| DB deletion is not object deletion | Critical | Storage/operator | Provider delete or lifecycle evidence with retry |
| Deletion cascade and tombstones incomplete | High | Privacy/operator | Account/all-data deletion inventory and evidence |
| Provider tokens/scopes not productionized | High | Integrations/operator | Encrypted token reference, least scopes, revoke flow |
| Webhook verification/dedupe absent for future adapters | High | Integrations | Signature, replay, retry and dead-letter tests |
| Department evaluation metrics not unified | Medium | Product/evaluation | Shared scorecard and release thresholds |
| Backup/restore and incident drills not evidenced | High | Operations | Recorded quarterly drill and recovery evidence |

## Compliance conclusion

DSAI’s core Workdesk departments are suitable for a controlled alpha when their status is represented honestly. The platform is **not yet compliant for unrestricted production file uploads, autonomous CRM/calendar/messaging actions, or guaranteed advanced media/agent execution**. The highest-value path is to complete the malware/deletion P0 work first, then add read-only provider discovery and dry-run previews, and only later enable explicitly approved single-object writes.

## References

1. [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
2. [Google Calendar API scopes](https://developers.google.com/workspace/calendar/api/auth)
3. [HubSpot Webhooks API guide](https://developers.hubspot.com/docs/api-reference/latest/webhooks/guide)
4. [Microsoft Graph subscription resource](https://learn.microsoft.com/en-us/graph/api/subscription-post-subscriptions?view=graph-rest-1.0)
5. [NIST SP 800-88 Rev. 1 Media Sanitization](https://csrc.nist.gov/pubs/sp/800/88/r1/final)
