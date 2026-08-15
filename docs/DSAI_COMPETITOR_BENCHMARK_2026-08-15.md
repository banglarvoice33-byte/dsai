# DSAI Competitor Benchmark and Upgrade Opportunities

## Scope

This brief compares official product documentation from OpenAI Projects, Google NotebookLM, Adobe Firefly, Canva Magic Layers, and Microsoft 365 Copilot Pages/Enterprise Data Protection. The goal is not to copy competitor interfaces or claims, but to identify user outcomes DSAI can deliver more clearly for Bengali-first, human-reviewed workflows.

## Observed patterns

| Product | Strong pattern observed | DSAI implication |
|---|---|---|
| OpenAI Projects | Persistent workspaces collect files, instructions, chats, and reusable context; projects support repeated workflows and sharing. | DSAI should evolve cases into durable workspaces with a clear source list, decision log, and next-action checklist. |
| Google NotebookLM | Source-grounded research, diverse file types, fast/deep research modes, and reports whose sources can be added back into the notebook. | DSAI should make evidence provenance and source coverage visible, starting with a source ledger rather than claiming a full research agent. |
| Adobe Firefly | A broad creative studio, editable workflows, partner models, style controls, and production-oriented bulk/video workflows. | DSAI should prioritize editable creative briefs, output provenance, Bengali-safe typography, and controlled provider integrations rather than competing on raw generation volume. |
| Canva Magic Layers | Converts flat AI output into editable layers, preserving text, objects, and layout relationships. | A future DSAI differentiator could be Bengali-first editable action packs and structured creative deliverables instead of flattened exports. |
| Microsoft Copilot Pages | Persistent, editable, shareable pages co-created with AI; users can refine content side-by-side and retain it until deletion. | DSAI should add a review canvas where AI drafts, human edits, approvals, and exports are explicit and reversible. |
| Microsoft Enterprise Data Protection | Identity and permissions, sensitivity labels, retention policies, audit, tenant isolation, and no training on customer prompts/responses are emphasized. | DSAI should make access scope, consent, retention, deletion, audit events, and provider boundaries visible in product UX and operator docs. |

## Recommended controlled-alpha upgrades

1. Introduce a **Case Workspace** concept around UAA and Creative requests: source list, status, owner, risk level, human-review checkpoint, decision log, and next action.
2. Add a **Bengali Evidence Ledger** that links each important draft claim to a source or marks it as user-provided/AI suggestion/needs review.
3. Add a **Review Canvas** with explicit draft, edit, approve, reject, and export states; no external send or high-risk submission without human approval.
4. Add **Bengali-safe creative controls**: aspect-ratio presets, typography-safe text guidance, tone/brand notes, and provenance placeholders that remain truthful until a provider is connected.
5. Add a **trust control panel** showing data scope, retention, connector status, deletion route, and audit events without exposing secrets.
6. Maintain an explicit **capability ledger** distinguishing live, preview, provider-gated, and roadmap features. This is a stronger trust position than claiming parity with large general-purpose suites.

## Research sources

[1] OpenAI, “Projects in ChatGPT,” https://help.openai.com/en/articles/10169521-projects-in-chatgpt

[2] Google, “NotebookLM adds Deep Research and support for more source types,” https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-deep-research-file-types/

[3] Adobe, “Adobe Firefly overview,” https://helpx.adobe.com/firefly/web/get-started/learn-the-basics/adobe-firefly-overview.html

[4] Canva, “Introducing Magic Layers, bringing creative control to AI content,” https://www.canva.com/newsroom/news/magic-layers/

[5] Microsoft, “Get started with Microsoft 365 Copilot Pages,” https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-microsoft-365-copilot-pages

[6] Microsoft, “Enterprise data protection in Microsoft 365 Copilot and Microsoft 365 Copilot Chat,” https://learn.microsoft.com/en-us/microsoft-365/copilot/enterprise-data-protection

## Decision boundary

This benchmark supports product and UX improvements, not legal, security, or performance guarantees. DSAI should implement only capabilities that can be tested in the current stack and label future provider-backed features as gated until credentials, consent, audit, cost, and failure handling are verified.
