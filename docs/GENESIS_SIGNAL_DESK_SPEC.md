# DSAI Signal Desk Specification

## Purpose

Signal Desk is a draft-first operating layer for DSAI. It continuously collects approved signals, identifies recurring Bengali and English user needs, proposes content or product improvements, and alerts operators to reliability, cost, abuse, or queue problems. It does not promise that DSAI will remain trending and it never publishes externally without human approval.

## Initial jobs

| Job | Trigger | Output | Approval |
|---|---|---|---|
| Support-theme digest | Daily | Clustered support themes and suggested FAQ entries | Product operator |
| Content opportunity scan | Daily | Draft Bengali/English FAQ, landing-page, and campaign ideas from approved sources | Editor |
| Cost and queue guard | Hourly | Alert on latency, failed jobs, cost spikes, or unusual usage | Operator on call |
| Source freshness check | Daily | Stale-source and broken-link report | Content owner |
| Weekly product review | Weekly | Top unmet workflows, cohort signals, and recommended experiments | Product lead |

## Data boundaries

The system may use consented product analytics, support tags, approved public RSS/API sources, and aggregate workflow metrics. It must not scrape private accounts, ingest confidential customer documents into the content loop, infer sensitive traits, or use user content for marketing without separate consent.

## Required server contract

Every scheduled callback must use a path beginning with `/api/scheduled/`, authenticate the scheduled caller, resolve the owning record using the platform task UID, and return an idempotent JSON result. The handler must be safe to retry, emit structured logs, enforce a cost ceiling, and fail closed when a source or model is unavailable. Do not use `setInterval`, `node-cron`, or in-process timers.

The first implementation should run in managed autoscale mode with platform-managed periodic callbacks. Reserved hosting is only justified if measured requirements include a persistent queue worker, WebSocket/SSE stream, or sub-minute event response. Any reserved-hosting switch requires a separate cost review because the managed 1 vCPU/512 MB instance can cost up to approximately US$37.50 per month at full utilization plus metered egress, before the included monthly usage credit.

## Approval matrix

| Action | Automation | Human approval |
|---|---|---|
| Create internal draft | Allowed | Not required |
| Create internal alert/ticket | Allowed | Not required, but auditable |
| Update FAQ draft | Allowed | Required before publication |
| Change price, quota, or policy copy | Propose only | Required |
| Send external campaign or customer message | Propose only | Required |
| Submit government, legal, medical, immigration, identity, or financial action | Prohibited | Separate explicit product workflow and human review required |
| Delete user data or change security settings | Prohibited | Admin-only controlled operation |

## Rollout gates

Signal Desk should be enabled only after the production domain is deployed, the callback endpoint is reachable, operator ownership is assigned, and a checkpoint has been saved. The first release should run in report-only mode for two weeks. The team should review false positives, source quality, model cost, time saved, and every proposed publication before enabling any additional automation.
