# GENESIS Unit Economics v13

**Status:** Illustrative planning model. Replace every provider-rate input with contracted or verified account pricing before selling a plan.

## 1. Measurement rule

GENESIS should price from contribution margin, not from token counts alone. Contribution margin is revenue minus variable provider cost, storage/egress, human review, payment fees, refunds, and an allocated support reserve. Fixed engineering, acquisition, and general overhead are excluded from this first-pass gross-margin view.

The launch gate is **minimum 60% contribution margin** for self-serve workflows and **minimum 45% contribution margin** for enterprise or regulated pilots where onboarding and review are heavier. Any workflow below the applicable floor for two consecutive billing cycles is paused for repricing, quota reduction, provider substitution, or scope reduction.

## 2. Lead-response and appointment economics

| Input | Symbol | Illustrative planning value | Replace with |
|---|---|---:|---|
| Monthly subscription | P | US$499 | Signed customer price |
| Included leads | L | 500 | Plan quota |
| Provider messaging cost per lead | M | US$0.03 | Account-level SMS/email/voice blended rate |
| Calendar/API cost per lead | C | US$0.01 | Provider invoice allocation |
| LLM extraction/draft cost per lead | A | US$0.02 | Measured token cost by model |
| Storage/logging per lead | S | US$0.005 | Storage and observability allocation |
| Human review share | H | 10% | Observed review rate |
| Review minutes per reviewed lead | R | 2.5 | Time study |
| Fully loaded reviewer minute | W | US$0.50 | Contractor/employee cost plus burden |
| Support reserve per lead | Q | US$0.02 | Tickets and incident allocation |

Variable cost per lead is `M + C + A + S + (H × R × W) + Q`. With the illustrative inputs, cost is US$0.185 per lead and monthly variable cost for 500 leads is US$92.50. Contribution margin is `(P − monthly variable cost − payment fee) / P`; the actual result must be recalculated with the customer’s provider mix and review rate.

A pilot should not be approved solely because the arithmetic is positive. It must also show a measurable workflow outcome: response acknowledgement p95 under three seconds in dry-run, zero unconsented sends, a functioning manual fallback, and either a reduced response-time burden or additional qualified appointments. If a customer produces high lead volume without paying for usage, the plan must move to a metered tier.

## 3. Video post-production economics

| Input | Symbol | Illustrative planning value | Replace with |
|---|---|---:|---|
| Per-job price | V | US$149 | Customer package price |
| Transcription/analysis cost per source minute | T | US$0.03 | Provider invoice |
| Render/GPU cost per source minute | G | US$0.12 | Measured worker cost including idle time |
| Storage and egress per source minute | E | US$0.04 | Actual object storage and download allocation |
| Human review minutes per source minute | Hm | 0.20 | Time study by package |
| Reviewer cost per minute | Wm | US$0.50 | Fully loaded review cost |
| Support/refund reserve | F | US$8.00 | Observed issue rate |

Variable cost per job is `(T + G + E + Hm × Wm) × source_minutes + F`. For a 60-minute source, the illustrative cost is US$22.80. The package should not be sold until the team has measured p95 queue time, failure/retry rate, storage duration, export quality, and the percentage requiring manual rework. Render price, rather than an absolute three-to-five-minute promise, should be the product claim.

## 4. Subscription tiers and stop conditions

| Tier | Intended customer | Pricing hypothesis | Metering | Stop/go rule |
|---|---|---:|---|---|
| Starter | One professional operator | US$299–499/month | Lead and draft quota | Go if weekly use persists and contribution margin is at least 60% |
| Team | Small team with calendar and review | US$799–1,499/month | Leads, seats, review minutes, messages | Go if retention intent is positive and support burden is below the reserve |
| Studio | Agency or multi-location operator | Custom | Organization, workflow, media, and audit quotas | Go only after security review and written SLA |

These are pricing hypotheses, not market facts. Every pilot proposal must state the included volume, overage price, setup fee, support boundary, data retention, provider pass-through, and cancellation terms.

## 5. Revenue models ranked by quality

| Model | Quality of revenue | Main risk | Required proof |
|---|---|---|---|
| Recurring workflow subscription | Highest | Churn if outcome is vague | Weekly active use and renewal intent |
| Setup/migration fee | High but non-recurring | Services creep | Fixed scope and acceptance criteria |
| Usage and provider pass-through | Healthy when transparent | Bill shock and low margin | Metering, caps, alerts, invoices |
| Template/playbook library | Potentially scalable | Easy to copy | Repeated adoption across customers |
| Reviewer marketplace | Potentially scalable | Quality, labor, privacy | QA scores and reviewer controls |
| GPU capacity resale | Capital intensive | Utilization, depreciation, support | Pre-sold demand and measured utilization |

The system must not present any of these as passive or guaranteed income. The economically honest framing is recurring revenue from repeatable, automated delivery.

## References

The architecture’s provider and compliance references are maintained in [GENESIS_Super_System_Architecture_v13.md](./GENESIS_Super_System_Architecture_v13.md) and [docs/STRATEGY_RESEARCH_SOURCES.md](./docs/STRATEGY_RESEARCH_SOURCES.md). Provider rates are intentionally variables because messaging, media, storage, and model prices vary by country, account, volume, and contract.
