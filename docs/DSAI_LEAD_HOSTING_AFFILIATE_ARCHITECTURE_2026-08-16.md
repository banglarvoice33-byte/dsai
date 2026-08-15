# DSAI Lead Agent, Hosting Control Plane, and Affiliate Architecture

**Author:** Manus AI  
**Status:** Research-backed controlled-alpha blueprint; external provider actions are not enabled in this release.

> **Important limitation:** DSAI currently has a lead-plan preview and protected workspace, but it does not yet have verified calendar credentials, SMS/voice credentials, a live payment connector, a production queue, or an affiliate payout ledger. Therefore, this release must not claim that it contacts a lead in three seconds, books a meeting automatically, provisions a VPS, or pays an influencer.

## Executive assessment

A “three-second” agent is technically achievable as a **best-effort first acknowledgement**, not as a universal guarantee that a human has been contacted and a meeting has been booked. The reliable target is a p95 acknowledgement path below three seconds when the tenant is preconfigured, the webhook is reachable, the lead payload is valid, and the messaging/calendar provider is healthy. The meeting-booked outcome is a separate asynchronous state and should never be reported as successful until the calendar provider confirms an event ID.

The highest-confidence design is a **control plane plus provider adapters**. DSAI owns tenant policy, consent, routing, idempotency, audit events, quotas, attribution, and operator approval. Hosting, messaging, calendar, payments, and payouts remain behind narrowly scoped adapters. This prevents provider credentials from entering the browser and permits a provider to be added or removed without rewriting the product.

## 1. Three-second lead-response feasibility

| Stage | Target | Hard requirement | Failure behavior |
| --- | --- | --- | --- |
| Ingest | p95 under 300 ms | Signed webhook or authenticated form, request ID, schema validation | Reject malformed or replayed payload |
| Deduplicate | under 100 ms | Idempotency key derived from provider event ID | Return prior result; do not duplicate contact |
| Decide | under 300 ms | Tenant policy, business hours, consent, language, risk rules | Queue for review if policy is missing |
| Acknowledge | p95 under 3 s | Pre-approved message template and provider connection | Persist `ack_pending`; retry with backoff |
| Calendar action | asynchronous | Valid calendar OAuth, availability rules, timezone | Keep `meeting_pending`; never claim booked |
| Human handoff | asynchronous | Escalation channel and operator SLA | Alert operator and preserve audit trail |

The phrase “3-second client contact” should be marketed as **“best-effort first-response target”** with a status indicator: `received`, `validated`, `acknowledged`, `meeting_pending`, `booked`, `human_review`, or `failed`. The customer should see the timestamp, provider, and correlation ID rather than an unverifiable promise.

## 2. Hosting options and control-plane fit

The following seven providers are adapter candidates, not active DSAI integrations. Each provider requires its own account, token, billing authority, region policy, network controls, backup policy, and terms review.

| Provider | Best role | Programmatic control relevant to DSAI | Main caution |
| --- | --- | --- | --- |
| AWS Lightsail | Simple branded VPS bundles | Instances, storage, firewall, static IP, DNS, load balancer, snapshots and API management are available [1] | AWS account/billing and IAM complexity still require careful isolation |
| DigitalOcean | Developer-friendly VPS | API-managed Droplets; resize action can change CPU/RAM and optionally disk, with snapshot and downtime considerations [2] | Disk downscale is not reversible; resize must be approval-gated |
| Hetzner Cloud | Cost-sensitive European deployments | Project-bound API tokens and REST create/update/delete operations support a provider adapter [3] | Region, support, compliance, and capacity availability must be checked per customer |
| Vultr | Globally distributed compute choices | Cloud Compute instance lifecycle and resize workflows are documented [4] | Product/plan differences require adapter capability detection |
| Akamai Connected Cloud/Linode | API-first infrastructure | Linode API supports instance creation and resize operations [5] | Account limits, outstanding balance, and region/plan constraints can block resize |
| Google Cloud Compute Engine | Autoscaled production fleets | Managed instance groups can add/remove VMs from load or schedules and support stabilization/scale-in controls [6] | IAM, instance templates, load balancing, and billing are materially more complex |
| Microsoft Azure | Enterprise VM scale sets | VM Scale Sets manage load-balanced VM groups and autoscale in response to demand or schedules [7] | Orchestration mode is selected at creation and cannot later be changed |

For DSAI’s first paid hosting offer, the recommended sequence is **managed WebDev/Reserved Hosting first**, then one provider adapter for customer-owned infrastructure, then a multi-provider control plane. Reserved Hosting is a managed persistent 1 vCPU/512 MB instance; its full-utilization compute ceiling is approximately $37.50/month before metered egress and volume, with the first $10/month of usage credits deducted [8]. A self-operated VPS/reseller product should not be launched until support, abuse handling, backups, security patching, billing, cancellation, and incident response are staffed.

## 3. DSAI hosting control plane

The console should expose provider-agnostic objects: `providerAccount`, `tenantEnvironment`, `deployment`, `capacityPolicy`, `backupPolicy`, `domainBinding`, `healthProbe`, `usageMeter`, and `changeRequest`. Every mutating action must be an approved job with an idempotency key, a dry-run preview, a cost estimate, a rollback or recovery path, and an audit event. Credentials must be encrypted server-side and scoped per tenant/project; the browser receives status, not tokens.

A safe scale control has three modes: **manual**, **scheduled**, and **policy-based**. Manual resize requires an explicit confirmation showing estimated cost, expected downtime, disk reversibility, and backup status. Scheduled scaling requires UTC schedules and a maintenance window. Policy-based scaling requires minimum/maximum instances, cooldown/stabilization, budget ceiling, and an emergency stop. Scale-in must be more conservative than scale-out and must never delete the last healthy instance without a recovery confirmation.

## 4. Affiliate and influencer payout model

> **Legal and tax note:** I am an AI, not a lawyer, accountant, or payments compliance professional. The following is an implementation design, not formal legal or tax advice. Counsel and a qualified tax professional should review the final terms for each target country.

A practical first model is a **DSAI Partner Program** with a proposed 20% commission on net collected subscription revenue for the first 12 months of an attributed customer, subject to refunds, chargebacks, taxes, discounts, fraud review, and program terms. This is a product proposal, not a claim about competitor rates. The exact percentage should be approved after unit-economics and payment-provider review.

Attribution should use a signed referral code or first-party referral token, not hidden fingerprinting. The ledger should store `partnerId`, `customerId`, `attributionEventId`, `plan`, `grossAmount`, `taxAmount`, `discountAmount`, `refundAmount`, `netCollectedAmount`, `commissionRate`, `commissionAmount`, `status`, `holdUntil`, `payoutBatchId`, and immutable audit timestamps. Commission becomes payable only after the refund/chargeback hold period and KYC/KYB requirements are complete.

If Stripe Connect is selected, destination charges can collect platform fees and transfer the remaining funds to connected accounts [9]. The payout flow still requires onboarding, identity verification, webhook reconciliation, refund/chargeback adjustments, reserve handling, and country-specific availability checks. DSAI should not send commission money from an unverified manual spreadsheet.

Influencer links and posts must include a clear disclosure in the same language as the endorsement. The FTC says a financial relationship is a material connection and that disclosure should be hard to miss, placed with the endorsement, and written in clear language such as “ad” or “sponsored” [10]. DSAI should provide copy-ready disclosure text in Bengali and English, but the partner remains responsible for compliant publication.

## 5. Delivery phases

| Phase | Deliverable | Gate |
| --- | --- | --- |
| 0 | Readiness-only UI and operator documentation | No external action; all gated states visible |
| 1 | Lead ingest, idempotency, consent, queue, status machine, and audit events | Load test demonstrates p95 acknowledgement target without claiming booking |
| 2 | One calendar adapter and one messaging adapter | User consent, provider OAuth, retries, rate limits, and confirmed event IDs |
| 3 | One hosting adapter with dry-run provisioning and scale preview | Provider contract, cost estimate, backup/rollback, abuse process |
| 4 | Payment connector and partner ledger | Refund/chargeback reconciliation, KYC/KYB, tax review, payout test |
| 5 | Multi-provider console | Capability matrix, least-privilege credentials, quotas, emergency stop, independent security review |

## 6. What should be implemented now

The current DSAI release should add only truthful readiness surfaces: a public capability page, an operator architecture document, a provider adapter registry with `planned`, `configured`, `verified`, and `disabled` states, and a lead-agent status contract that explicitly separates acknowledgement from booking. The actual messaging, calendar, hosting, payment, and affiliate integrations should remain disabled until credentials and staging tests are provided.

## References

[1]: https://docs.aws.amazon.com/lightsail/latest/userguide/what-is-amazon-lightsail.html "What is Amazon Lightsail? — AWS"
[2]: https://docs.digitalocean.com/products/droplets/how-to/resize/ "How to Resize Droplets for Vertical Scaling — DigitalOcean"
[3]: https://docs.hetzner.com/cloud/api/getting-started/using-api/ "Using the API — Hetzner Cloud"
[4]: https://docs.vultr.com/products/compute/instances/cloud-compute "Cloud Compute — Vultr"
[5]: https://techdocs.akamai.com/linode-api/reference/post-resize-linode-instance "Resize a Linode — Akamai Connected Cloud"
[6]: https://docs.cloud.google.com/compute/docs/autoscaler "Autoscaling groups of instances — Google Cloud"
[7]: https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview "What are Virtual Machine Scale Sets? — Microsoft Azure"
[8]: https://www.manus.im/ "Manus WebDev Reserved Hosting guidance; verify current pricing in the Management UI before enabling"
[9]: https://docs.stripe.com/connect/destination-charges "Create destination charges — Stripe Connect"
[10]: https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers "Disclosures 101 for Social Media Influencers — FTC"
