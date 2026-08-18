# DSAI Launch Polish and Sustainability Report

**Prepared by Manus AI · August 2026**

## Executive conclusion

DSAI is now positioned as a production-ready alpha with a stronger launch surface, not as a system that can honestly guarantee perfection or universal market adoption. The current release preserves the platform’s central promise: Bengali-first clarity, human review for consequential work, explicit capability limits, secure connector boundaries, low-network foundations, and a maintainable route structure.

The highest-value launch improvements completed in this pass were code-splitting for non-home routes, hero-image preloading, zoom-friendly viewport metadata, keyboard skip navigation, a visible lazy-route loading state, and a service-worker cache-version bump. These changes reduce the amount of JavaScript required for the public first visit, protect user zoom, make keyboard navigation clearer, and ensure installed/offline clients can receive the updated shell.

## What was implemented

| Area | Implemented change | Why it matters |
|---|---|---|
| First visit | Non-home routes now load through React lazy imports | The public entry bundle is split; the build now emits a 769.60 kB main JavaScript chunk instead of the previous approximately 1.1 MB monolithic client chunk. |
| Perceived speed | The hero editorial image is preloaded with high priority | The visual identity appears earlier when the hero is the largest above-the-fold surface. |
| Accessibility | Removed `maximum-scale=1` from the viewport and added a keyboard skip link | Users retain zoom control, and keyboard/screen-reader users gain a direct path to main content. |
| Resilience | Added a Bengali loading fallback for lazy routes | A route transition remains understandable while its chunk is fetched, including on slower networks. |
| Offline update | Service-worker cache moved from `dsai-shell-v1` to `dsai-shell-v2` | Existing installed clients can replace the old cached shell during the next service-worker lifecycle. |
| Verification | Added regression contracts for viewport, preload, lazy routes, sitemap, and cache version | Future changes are less likely to silently remove launch-critical behavior. |

## Evidence-based quality targets

Google’s current Web Vitals guidance recommends combining real-user monitoring with lab testing rather than relying on a single synthetic score. It also states that the recommended Core Web Vitals thresholds are assessed at the 75th percentile of page visits.[1] Therefore, DSAI should operate with the following launch targets rather than a subjective “fast” claim.

| Metric or gate | Target | How to verify |
|---|---:|---|
| LCP | ≤ 2.5 s at p75 | PageSpeed Insights, Search Console, CrUX, and RUM by device/network segment |
| INP | ≤ 200 ms at p75 | Field RUM; use interaction traces for search, menu, login CTA, and forms |
| CLS | ≤ 0.1 at p75 | RUM plus mobile scroll and route-transition checks |
| Accessibility | WCAG 2.2 AA-oriented review | Automated checks plus keyboard, zoom, reduced-motion, screen-reader, and Bengali text review |
| Offline shell | First successful visit can reopen public shell offline | Android Chrome and real-device test after service-worker installation |
| Security | No secret in client bundle, logs, ZIP, or browser storage | Build scan, source scan, deployment validator, and runtime header review |

INP is the current stable responsiveness metric and measures the latency of interactions throughout a page’s lifetime; a value at or below 200 milliseconds is considered good.[2] W3C WCAG 2.2 applies across desktop and mobile web content and is organized around perceivable, operable, understandable, and robust principles.[3] The W3C mobile guidance specifically highlights reflow, pointer alternatives, target size, reduced redundant entry, and other mobile considerations.[4]

## Remaining launch gates

The codebase can be checkpointed and handed to an operator, but public launch still depends on external conditions that cannot be fabricated in code. The primary production domain must resolve to the deployed release with HTTPS. OAuth redirect URLs must match the final origin. The production database must be backed up and reachable. Live CAPTCHA credentials must be rotated and verified on the final hostname. The operator must run the fail-closed environment validator and the one-command deployment script with real secrets supplied outside Git and chat.

Android Play Store publication remains a separate release process. It requires a signed AAB, current target SDK compliance, Digital Asset Links for the final domain, Play Data Safety declarations, account-deletion disclosures where applicable, and real-device/internal-track testing. The current web/PWA foundation is supportive but is not itself proof of Play approval.

## Sustainable update architecture

DSAI should evolve through small, evidence-backed release trains rather than large unverified rewrites. Every release should begin with a written change record, preserve the public capability ledger, add or update tests, run the production build, capture desktop and narrow-mobile routes, inspect the runtime logs, and save a recoverable checkpoint. A feature should move from roadmap to preview only after its provider, consent, quota, storage, moderation, audit, and human-review boundaries are explicit. It should move from preview to live only after a staging proof and operator sign-off.

A practical monthly maintenance loop is: review field performance and error telemetry; audit Bengali and mixed-script wrapping; rotate credentials where exposure or provider policy requires it; review dependency updates in a staging branch; test offline recovery and OAuth on a real device; inspect deletion-request and scholarship controls; and publish a truthful changelog entry. The platform should keep public claims narrower than its architecture so trust is earned through observable behavior rather than marketing language.

## One-step upgrade roadmap

The next highest-value upgrade is a privacy-preserving Real User Monitoring layer for Web Vitals and route errors. It should record metric name, value, route class, device class, connection class, and release identifier, but not page content, credentials, raw search terms, or unnecessary identifiers. This would make “super fast” a measurable operational objective and would expose regional or low-network regressions that desktop lab captures miss.

The second upgrade is a formal accessibility gate covering keyboard traversal, visible focus, 200% zoom, Bengali font fallback, reduced motion, touch target sizing, and screen-reader landmarks. The third is automated performance budgets in CI: fail a release when the main entry chunk grows beyond an agreed threshold, when a new above-the-fold asset is uncompressed, or when route-level smoke checks fail. These improvements are more durable than adding another decorative feature.

## Claims that should remain explicitly bounded

The number of Bengali-language users worldwide, including the proposed 274 million figure, should not be used as a verified product fact without a transparent source and methodology. DSAI can reasonably describe itself as serving Bengali, Banglish, and English users and as having global potential, but adoption, market size, search ranking, “world’s first,” and “top fastest” claims require independent evidence. Likewise, the platform should not claim live 24/7 external agents, live text-to-video, guaranteed income, Bitcoin mining, or universal professional replacement unless those systems are separately implemented, tested, governed, and disclosed.

## Verification record

The current project verification passed **52 Vitest tests**, TypeScript compilation, shell and Node syntax checks, and the production build. Desktop and 390px mobile full-page captures were reviewed for the homepage, Learn page, and Developer page. The production build emits split route chunks and retains a remaining non-blocking warning for the large shared client chunk; further dependency-level optimization can reduce it, but it is not a reason to claim that all devices will experience identical performance.

## References

[1]: https://web.dev/articles/vitals-measurement-getting-started "web.dev — Getting started with measuring Web Vitals"
[2]: https://web.dev/articles/inp "web.dev — Interaction to Next Paint (INP)"
[3]: https://www.w3.org/TR/WCAG22/ "W3C — Web Content Accessibility Guidelines (WCAG) 2.2"
[4]: https://www.w3.org/TR/wcag2mobile-22/ "W3C — Guidance on Applying WCAG 2.2 to Mobile Applications"
