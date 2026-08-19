# DSAI Next Quality Research Notes

## Findings from authoritative sources

Google’s SRE guidance defines an SLI as a quantitative measure of service behavior and an SLO as a target for that measure. It recommends choosing a small set of indicators tied to user experience, such as availability, latency, throughput, error rate, and durability, rather than tracking every possible metric [1]. Google’s SLO workbook also treats error budgets as a decision tool for balancing feature velocity and reliability, not as a decorative KPI [2].

W3C WCAG 2.2 is a Recommendation covering accessible web content across desktop and mobile devices. It organizes accessibility around perceivable, operable, understandable and robust principles, with testable success criteria and human evaluation [3]. DSAI should therefore measure keyboard, focus, contrast, mobile completion, reduced motion and semantic structure—not only screenshot appearance.

NIST’s Generative AI Profile connects trustworthy AI to governance, provenance, pre-deployment testing and incident disclosure across the AI lifecycle [4]. This reinforces DSAI’s existing Work Packet, evidence and human-review direction, while identifying incident response and evaluation release gates as the next high-value operational layer.

## Remaining high-leverage opportunities

The most valuable next layer is an **Evidence-to-Operations Loop**: user-outcome telemetry with minimization, explicit SLI/SLO definitions, error-budget policy, versioned Bengali evaluation sets, incident disclosure workflow, and accessibility acceptance checks. This is more valuable than adding another visual effect or model provider because it converts product quality into an operating advantage.

A second opportunity is **provider-resilient execution**: typed model adapters, cost and latency telemetry, circuit breakers, fallback behavior, feature flags, and a kill switch. A third is **customer proof**: consented cohort studies, narrow-workflow benchmarks, retention and contribution-margin evidence. None of these can be honestly fabricated; they require real users, real costs and operator review.

## Sources

[1]: https://sre.google/sre-book/service-level-objectives/ "Google SRE: Service Level Objectives"
[2]: https://sre.google/workbook/implementing-slos/ "Google SRE Workbook: Implementing SLOs"
[3]: https://www.w3.org/TR/WCAG22/ "W3C Web Content Accessibility Guidelines 2.2"
[4]: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence "NIST Generative AI Profile"
