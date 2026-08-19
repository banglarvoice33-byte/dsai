# DSAI Secure Intake, Work Packet, and 3D Review

**Prepared by Manus AI · August 2026**

## Implementation result

DSAI now has a migration-backed foundation for the next production layer. The database contains user-scoped Work Packets, source/evidence rows, append-only approval audit events, and an optional Work Packet association on quarantined file metadata. The authenticated Workspace exposes packet creation, source/evidence entry, review submission, approval state, JSON export, scanner status, and a clear DOM-first/optional-3D policy.

The secure file path remains fail-closed. Metadata is normalized and bounded; MIME types, SHA-256 format, byte size, quarantine namespace, ownership, and retention duration are checked before a file record is registered. Files remain unavailable until a malware-scanner adapter is configured and a clean verdict is available. The existing scheduled cleanup endpoint remains cron-authenticated and does not accept user-supplied file IDs or user IDs.

## Why core workflow should not depend on 3D

A full 3D interface can look impressive, but making core work dependent on WebGL creates material product risk. Some devices have weaker graphics support, network conditions make large assets expensive, browser or GPU errors can leave an empty canvas, screen-reader semantics are not naturally represented by a scene graph, and motion can harm users with vestibular sensitivities. WebGL also requires explicit attention to memory, draw calls, texture size, shader complexity, and context loss [3] [4].

The correct DSAI policy is therefore:

> **Core work is semantic HTML and accessible DOM first. 3D is a lazy-loaded, decorative or explanatory enhancement with a complete static fallback.**

This means a user can create, inspect, cite, review, export, and delete work without WebGL, JavaScript animation, or a high-end device. The premium spatial identity remains available in marketing or explanation surfaces, where failure does not destroy a user’s work.

## What was added

| Area | Implemented contract | Safety boundary |
|---|---|---|
| Secure intake | Quarantine-first file metadata registration with server-derived user namespace | No client-controlled storage path; scanner remains fail-closed |
| Retention | Seven-day default, clamped to one–thirty days, indexed expiration cleanup | Cleanup is operator/cron authenticated; storage deletion limitation remains documented |
| Work Packet | User-owned title, language, status, uncertainty, and next action | All packet queries and mutations are ownership-scoped |
| Sources/evidence | File, URL, or note source kinds with citation state and evidence text | Source additions require packet ownership; evidence starts unreviewed |
| Approval audit | Created, source-added, submitted-for-review, approved, changes-requested, rejected and related events | Events are append-only from the user procedure; no external submit is performed |
| Workspace | Packet list, source/evidence form, review and approve controls, export inclusion, scanner status | Approval is a local user state, not legal/government/provider submission |
| 3D direction | Explicit DOM-first core-work policy and optional enhancement rule | No workflow is blocked by WebGL or animation |

## What remains a real launch gate

The project does not yet claim that a production malware scanner is live. The scanner adapter still needs a selected provider contract, authenticated endpoint, timeout and retry policy, verdict mapping, privacy review, and operator alerting. The storage helper currently exposes no underlying-object deletion helper, so retention cleanup removes database metadata and must be paired with a provider-supported object deletion process before making a hard-deletion promise for stored bytes.

Likewise, the new audit events are application-level records. A later release should add an operator-facing audit viewer, immutable export or append-only storage policy, event correlation IDs, and a documented retention period for audit records. These are necessary before the audit ledger is used for regulated or high-risk decisions.

## Verification

The implementation passed the existing 52 Vitest tests, TypeScript no-emit validation, and the production build. The build retains the known non-blocking shared chunk-size warning. The Workspace route was visually checked at 390px; the core layout remains readable and the secure-intake state is visible. Production OAuth, real scanner verdicts, VPS storage deletion semantics, backups, and live-domain callback validation remain operator-owned gates.

## References

[1]: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html "OWASP File Upload Cheat Sheet"
[2]: https://www.nist.gov/privacy-framework "NIST Privacy Framework"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices "MDN WebGL best practices"
[4]: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html "W3C WAI: Understanding Animation from Interactions"
[5]: https://www.nist.gov/itl/ai-risk-management-framework "NIST AI Risk Management Framework"
