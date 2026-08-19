# DSAI Seven-Layer Premium Expansion Research

**Prepared by Manus AI · August 2026**

## Decision in one sentence

DSAI should **not** replace its current Bengali-first editorial workdesk with a full WebGL/Three.js frontend. The highest-quality production decision is a **hybrid spatial interface**: keep semantic, fast, DOM-first content and forms as the primary experience, then add restrained depth through CSS perspective, layered cards, subtle motion, and optional future interactive 3D scenes on carefully selected storytelling surfaces.

## Why the decision is not “more 3D is better”

A full 3D landing page can create immediate visual novelty, but novelty is not the same as product value. It adds GPU, asset, battery, loading, testing, and accessibility costs. WebGL guidance recommends reducing draw calls, simplifying textures and shaders, using culling/level-of-detail, and disposing of unused GPU objects [1]. Those requirements are sensible for a game or a product configurator, but they are unnecessary risk for DSAI’s primary job: helping users understand, structure, review, and safely act on work.

The Web Content Accessibility Guidelines explain that non-essential interaction animation should be disableable and that reduced-motion preferences should be respected because motion can cause distraction, dizziness, nausea, or headaches [2]. DSAI already serves low-network mobile users and Bengali readers who need content clarity. A full-canvas experience would make the most important content less reliable for those users unless a complete alternative mode were maintained.

NIST’s AI Risk Management Framework emphasizes incorporating trustworthiness into the design, development, use, and evaluation of AI systems [3]. The 2026 systematic review of human-in-the-loop AI also highlights scalability, cognitive load, and trust calibration as practical design concerns [4]. A spatial layer is useful only when it clarifies the workflow; it should never hide the review state or turn the product into a visual demo.

## Seven-layer architecture

| Layer | Product capability | Premium outcome | First implementation |
|---|---|---|---|
| 1 | **Secure intake** | Users can safely provide files, text, voice, and links without losing control | MIME/size validation, malware scan contract, retention metadata, explicit consent, deletion path |
| 2 | **Work packet** | A chat-like request becomes an editable, durable unit of work | Packet schema with request, source list, assumptions, draft, uncertainty, review status, next action, export |
| 3 | **Bengali intelligence** | Bengali, Banglish, and English are treated as workflow context rather than mere translation | Language mode, normalization, domain templates, glossary controls, Bengali evaluation set |
| 4 | **Evidence layer** | Users can inspect why an answer or draft exists | Source snippets, citation state, confidence/uncertainty flags, unsupported-claim markers |
| 5 | **Human governance** | Consequential actions remain reversible and accountable | Review contract, approve/request-change/reject, audit events, idempotency, no-auto-submit boundary |
| 6 | **Team control** | Small teams can collaborate without turning privacy into a default public setting | Roles, consent, workspace sharing, notification center, quota visibility, access logs |
| 7 | **Evaluation moat** | DSAI improves through measurable quality rather than vague “AI magic” | Outcome, correction, latency, safety, Bengali quality, export/delete, and failure-recovery metrics with sensitive-content minimization |

The current product visibly implements parts of Layers 2 and 5 through Workspace records, user-owned export, and the Review Contract. It also has meaningful foundations for privacy, connectors, scholarship quotas, PWA behavior, and public evidence. Layers 1, 3, 4, 6, and 7 require deeper backend contracts before they can be advertised as live.

## Frontend comparison

| Criterion | Full 3D/WebGL frontend | Current editorial frontend | Recommended hybrid |
|---|---:|---:|---:|
| Immediate visual novelty | High | Medium-high | High enough, with less risk |
| Bengali readability | Variable | High | High |
| Low-network behavior | Weak unless separately optimized | Strong | Strong |
| Accessibility and keyboard use | Requires parallel DOM alternative | Natural fit | Natural fit |
| Battery/GPU cost | High | Low | Low-medium |
| Development and QA cost | High | Low-medium | Medium |
| Product-task clarity | Can become secondary | Strong | Strong |
| Brand differentiation | Strong but easy to copy | Strong when editorial system is distinctive | Strongest balance |
| Production recommendation | Reserve for optional narrative modules | Keep as the core | Adopt now |

### Recommended visual system

The public homepage should remain editorial and Bengali-first: strong typography, calm parchment/night palette, clear route navigation, evidence-oriented sections, and a fast first action. The Platform page can use the new seven-layer spatial stack to communicate architecture. The authenticated Workspace should remain utility-first, with only small depth cues around packets, review states, and progress. A future 3D scene may be appropriate for an optional “how a work packet moves” explainer, but it must lazy-load, have a static poster/DOM fallback, respect `prefers-reduced-motion`, and never be required for login, upload, review, export, or deletion.

## Implementation method

The implementation order should be risk-first rather than visual-first. Secure intake and packet contracts come before providers. Evidence and human review come before autonomous actions. Bengali evaluation and privacy-aware telemetry come before marketing claims. Each layer should ship with a schema or contract, protected authorization, error/empty states, mobile verification, and a reversible migration or feature flag where applicable.

The immediate code change therefore adds a seven-layer architecture surface to `/platform`. It uses semantic HTML and CSS perspective rather than a full WebGL runtime. The cards remain readable and keyboard-navigable, and the design can be enhanced later without replacing the underlying information architecture.

## Acceptance criteria for the next releases

| Release | Must be true before release |
|---|---|
| Secure intake | Unsafe or oversized files are rejected; allowed files have owner, MIME, size, retention, scan, and deletion state |
| Work packet | A user can create, edit, review, export, and delete a packet without an opaque chat-only state |
| Evidence | Claims with sources show inspectable source context; uncertainty is visible instead of hidden |
| Governance | High-risk actions require explicit approval; action attempts are idempotent and auditable |
| Collaboration | Sharing is opt-in, role-limited, and revocable; private records remain private by default |
| Evaluation | Quality and failure signals are measurable without collecting unnecessary raw sensitive content |
| Spatial UI | Core tasks work with JavaScript/3D disabled, reduced motion, keyboard navigation, and narrow mobile layouts |

## Research references

[1]: https://developer.amazon.com/docs/vega/0.21/webview-webgl-best-practices.html "Amazon Developer: WebGL Best Practices for Web Apps"
[2]: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html "W3C WAI: Understanding Animation from Interactions"
[3]: https://www.nist.gov/itl/ai-risk-management-framework "NIST: AI Risk Management Framework"
[4]: https://www.mdpi.com/1099-4300/28/4/377 "Lazaros, Vrahatis, and Kotsiantis: Human-in-the-Loop Artificial Intelligence: A Systematic Review of Concepts, Methods and Applications"
[5]: https://help.openai.com/en/articles/10169521-projects-in-chatgpt "OpenAI Help: Projects in ChatGPT"
[6]: https://docs.github.com/en/copilot/concepts/agents/code-review "GitHub Docs: About GitHub Copilot code review"
