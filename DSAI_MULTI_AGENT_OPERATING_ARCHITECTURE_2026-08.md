# DSAI Multi-Agent Operating Architecture — August 2026

## Executive decision

DSAI should not become a collection of loosely named chatbots. It should operate as a **contract-first Workdesk** in which each department has one accountable lead agent and a set of subordinate support models. The lead owns the department outcome, evidence standard, tool policy, stop conditions, and human handoff. Support models may classify, retrieve, translate, extract, critique, or measure; they do not approve external side effects, change policy, or silently widen scope.

This design follows a simple-composable principle: use deterministic workflows for predictable work, bounded agents where model-directed routing adds value, and human approval wherever a workflow creates an external side effect or high-impact decision. NIST AI RMF and its Generative AI Profile provide the governance frame; current agent documentation from major providers reinforces specialist ownership, guardrails, approval pauses, tracing, and evaluation as separate concerns.[1] [2] [3] [4]

## Lead-agent roster

| Department | Lead agent | Readiness | Authority boundary | Primary proof |
|---|---|---|---|---|
| Bengali Access & Language | **Bhashapath** | Implemented | Explain, route, and clarify; no external side effect | Bengali intent and accessible next step |
| Work Packet & Workflow | **Karmarekha** | Implemented | Create and refine packets; approval remains human-gated | Provenance, schema, review status |
| Evidence & Provenance | **Pramanika** | Foundation | Map claims to sources; never invent verification | Source coverage and unresolved gaps |
| Governance & Human Review | **Niyomrekha** | Foundation | Enforce permission, consent, escalation, and rollback | Approval contract and audit event |
| Secure Intake & Deletion | **Durgarekha** | Foundation | Quarantine, scan, retain, and tombstone; fail closed | Verdict and deletion evidence |
| CRM & Calendar Integrations | **Setubandhan** | Provider gated | Preview and prepare provider action; never silently send/update | OAuth scope, preview, idempotency, approval |
| Evaluation & Quality | **Mulyayan** | Foundation | Measure and gate releases; cannot self-approve production | Bengali, safety, latency, and cost score |
| Operator & Reliability | **Sanchalan** | Foundation | Observe, pause, roll back, and disclose incidents | SLI/SLO and recovery proof |
| Creative & Media Studio | **Srijonika** | Provider gated | Produce rights-aware drafts; human review before publication | Brief, rights note, review decision |
| Alpha & Community | **Agrojatra** | Implemented | Show verified progress; no invented reward or payout status | User-owned contribution records |

These names are internal DSAI product identifiers created for this registry. They are intentionally separated from any underlying model or provider adapter, and no claim of legal trademark clearance is made by the UI registry.

## Support-model topology

Each lead may call a small, bounded support set. The recommended topology is **lead → support roles → typed evidence → policy gate → Work Packet**. A support model has no independent user-facing authority. Typical roles are an intent sieve, Bengali script normalizer, task decomposer, source ranker, claim extractor, policy mapper, risk triage model, file classifier, verdict normalizer, OAuth scope checker, field mapper, retry coordinator, Bengali judge, safety judge, cost meter, incident summarizer, and rights checker.

A model router should choose the least expensive model that meets the department's evaluation threshold, escalate on uncertainty or high risk, and record adapter, model version, prompt version, token/latency measurements, and fallback reason. A lead run must have a maximum step count, tool allow-list, timeout, retry budget, and a terminal state. No support model can expand tool permissions.

## Common agent contract

Every registry entry needs the following typed contract: outcome; accepted input; structured output; owner; tool allow-list; data classification; provenance fields; human-gate condition; stop conditions; retry and timeout budget; evaluation suite; cost/latency budget; audit event schema; rollback or cancellation path; and truthful readiness state. A successful draft is not an approved action. A provider-gated adapter is not a live integration.

## System-completeness gaps

| Gap | Current state | Corrective gate |
|---|---|---|
| Real email/mobile verification | Mock UX only | Production email/SMS adapter, OTP hashing, expiry, attempt limit, abuse monitoring, deletion semantics |
| Billing and Pro entitlement | Preview card only | Payment provider, entitlement ledger, webhook verification, refund/chargeback handling, plan limits |
| Durable agent runtime | Registry and UI contracts | Provider adapter, queue/worker runtime, resumable state, trace store, sandboxed tools |
| Model routing | Architectural proposal | Versioned adapter registry, quality/cost policy, fallback and outage routing |
| Secure intake | Foundation/mock scanner | Real scanner, quarantine storage, object deletion proof, retention job and operator dead-letter |
| CRM/calendar | Mock OAuth and preview | Real OAuth, encrypted token storage, webhook signature validation, idempotent outbox, revoke flow |
| Evaluation | Foundation contracts | Versioned Bengali benchmark, safety set, regression gate, human adjudication and drift alerts |
| Observability | Local activity and logs | Durable traces, correlation IDs, SLI/SLO, error budget, incident disclosure and rollback |
| Cross-device notifications | Mock preference snapshot | Authenticated server preference store, conflict policy, audit events, retention and deletion |
| Data governance | Documented boundaries | Data inventory, purpose limitation, regional retention, export/deletion automation, access review |
| Agent identity | Registry only | Permissioned service identities, scoped secrets, key rotation, tenant isolation and kill switch |

## Governance and safety

Use NIST's Govern, Map, Measure, and Manage loop for each lead-agent release.[1] Map data classification, affected people, external side effects, and failure modes. Measure Bengali quality, evidence coverage, false approvals, refusal behavior, latency, cost, and incident rates. Manage by enforcing least privilege, preview-first Work Packets, approval pauses, bounded retries, kill switches, rollback, and user-visible uncertainty. Govern through named operators, release records, access reviews, incident disclosure, and a policy version attached to every run.[1] [2]

The high-risk path is always: **request → lead plan → support evidence → typed preview → policy check → human approval → idempotent execution → verified result → audit event**. If a provider, scanner, token, evidence source, or approval record is unavailable, the system must stop or remain in a clearly labeled mock/foundation state.

## Evaluation and economics

Release gates should include Bengali intent accuracy, useful-draft time, source coverage, correction rate, human approval rate, unsafe-action block rate, duplicate prevention, p95 latency, cost per Work Packet, contribution margin per packet, repeat packet rate, and operator completion. The minimum economics view is: `contribution margin per packet = realized revenue − model cost − tool cost − storage − human review cost − support cost`. A lead should be downgraded or routed to a cheaper support path only when the evaluation threshold remains satisfied.

## 0–90 day implementation sequence

During days 0–30, freeze the registry contract, add provider-neutral adapters, finish real scanner/deletion acceptance criteria, create the Bengali evaluation set, and instrument correlation IDs and approval events. During days 31–60, implement one durable agent runtime for Karmarekha, Pramanika, and Niyomrekha with a sandboxed tool set, trace storage, and human approval pause. During days 61–90, pilot Setubandhan with one calendar provider in read-only discovery and dry-run preview, then add one CRM provider only after OAuth, webhook, idempotency, revoke, and rollback tests pass.

## Current truthful status

The registry and dashboard are implemented as an architecture and operating surface. The DSAI website does not yet contain a live multi-agent runtime, real email/SMS delivery, billing entitlement service, real malware scanner adapter, or production CRM/calendar side-effect adapter. Those remain explicit operator/provider gates rather than hidden claims.

## References

[1] [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

[2] [NIST AI RMF Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)

[3] [OpenAI Agents SDK guide](https://developers.openai.com/api/docs/guides/agents)

[4] [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
