# DSAI Multi-Agent Research Notes — August 2026

## Research basis

NIST AI RMF is organized around Govern, Map, Measure, and Manage, and NIST's Generative AI Profile is a companion resource for identifying and managing generative-AI-specific risks. The DSAI agent registry therefore treats governance, risk mapping, evaluation evidence, and operational controls as first-class fields rather than prompt-only metadata.

OpenAI's current Agents SDK documentation distinguishes an agent run from a single model response and documents specialist ownership, orchestration/handoffs, guardrails, human approvals, resumable state, and tracing. DSAI will use these as architectural patterns, but will keep its registry provider-neutral until a real provider connector is configured.

Anthropic's production guidance distinguishes deterministic workflows from dynamically directed agents and recommends starting with the simplest composable pattern. It describes routing, parallelization, orchestrator-workers, evaluator-optimizer, and human checkpoints. DSAI will therefore make lead agents independent at the contract level while selecting workflow, bounded agent loop, or human handoff per task risk and complexity.

## Design implications for DSAI

1. Every lead agent needs an outcome, input/output schema, tool allow-list, evidence requirement, human gate, stop conditions, retry budget, latency/cost budget, evaluation suite, and operator owner.
2. Supporting models are subordinate workers, not independent authorities. They may classify, retrieve, translate, extract, critique, or summarize, but cannot approve external side effects or override a lead agent's policy.
3. High-impact actions remain preview-first Work Packets with explicit human approval, idempotency keys, audit events, and reversible/rollback paths.
4. Provider-gated agents must visibly show `Provider required`, `Mock only`, or `Implemented` status. A registry entry is not proof of a live integration.
5. Model names must be original DSAI product identifiers, not borrowed provider names. The registry stores provider/model adapter separately from the user-facing agent name.
6. Evaluation must include Bengali quality, evidence coverage, safety refusal, tool correctness, latency, cost per packet, and human correction/approval rate.

## Sources

- [1] NIST AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework
- [2] NIST AI RMF Generative AI Profile: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence
- [3] OpenAI Agents SDK guide: https://developers.openai.com/api/docs/guides/agents
- [4] Anthropic Building Effective Agents: https://www.anthropic.com/engineering/building-effective-agents
