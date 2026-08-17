# DSAI Student Pro Scholarship — Operator and Applicant Guide

## Program definition

DSAI will offer a controlled scholarship window for up to **100 approved Bengali-speaking students**. Each approved account receives a **single, non-renewing 30-day Pro entitlement**. The release default is **20 usage units per day** and **300 usage units per calendar month**. A usage unit must be charged by the relevant feature adapter; this page does not claim that every future AI feature is already connected to the quota ledger.

The program is not open access and it is not a guarantee of approval. Approval requires a valid account, a truthful 18+ student attestation, institution and country information, a reviewable verification path, duplicate screening, and administrator approval while seats remain available.

## Verification and safety model

No system can guarantee that every non-student will be detected. DSAI therefore uses layered controls: authenticated account, one application per account, 18+ attestation, institution and country fields, a verification method, manual admin review for the controlled-alpha path, duplicate and abuse screening, a global 100-seat cap, rate limits, reviewer audit trail, and a 30-day non-renewing entitlement.

Applicants must not paste passwords, API keys, identity numbers, grades, or full student documents into the application or reviewer notes. DSAI stores review metadata and an optional evidence reference hash, not document bytes. Applicants can request deletion from the Privacy page. Applications may be rejected when the evidence is unverifiable, duplicated, abusive, outside the published age scope, or submitted after the seat cap is reached.

## Applicant flow

The applicant opens `/scholarship`, signs in, completes country and institution fields, confirms the 18+ student attestation, and submits one application. The application remains pending until an administrator reviews it. Approved users see their Pro expiry date and daily/monthly counters on the same page. An approval does not provide unlimited generation or access to provider-gated features.

## Admin flow

An administrator opens `/admin/scholarship`, reviews only the minimum metadata, and chooses **Mark in review**, **Approve 30-day Pro**, or **Reject**. Approval is capacity-limited in the database. The reviewer must not copy sensitive documents into notes. The administrator should use a consistent review rubric and record only a concise operational note.

## Privacy and retention

The scholarship page should be accompanied by the DSAI Privacy Policy. The program should retain only the application and entitlement metadata needed for review, quota enforcement, audit, and deletion handling. Retention periods must be configured with the project operator before public launch; this implementation does not claim a universal legal-compliance result for every country.

The first release excludes applicants under 18 and does not establish a child-directed service. Any future expansion to minors requires a separate parental-consent, age-appropriate-design, and jurisdictional privacy review.

## Deployment verification

After migration and deployment, an operator should verify `/healthz`, `/readyz`, `/scholarship`, `/admin/scholarship`, the unauthenticated protected boundary, a real admin review in staging, expiry behavior, daily limit rejection, monthly limit rejection, deletion handling, and rollback. Real OAuth credentials, production backups, and provider-specific feature adapters remain deployment-owned gates.
