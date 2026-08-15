# DSAI Full-Stack Regression Audit — 16 August 2026

## Result

The reported mobile overlap concern was treated as a full-stack release issue rather than a cosmetic-only issue. The latest 390px and 1280px captures showed the main public, workspace, privacy, and admin surfaces in normal document flow without a confirmed text collision. A defensive responsive layer was nevertheless added for Bengali and mixed-script headings, long labels, grid children, workspace controls, and search results.

The fixed Knowledge Help control and the offline status banner were identified as the highest-probability obscuration risk. The offline banner now reserves horizontal room on narrow screens and respects the device bottom safe area instead of occupying the same full-width bottom region as the help control. Workspace and long-form headings have additional wrap and line-height protection.

## Backend and runtime verification

| Boundary | Result | Meaning |
|---|---:|---|
| Public homepage and content routes | 200 | Public shell and key content routes are reachable. |
| `/healthz` | 200 | Process liveness responds. |
| `/readyz` | 200 | Database readiness responds in the current environment. |
| `access.list` unauthenticated | 401 | Protected user data is not public. |
| `admin.connectors.list` unauthenticated | 403 | Admin connector registry is role-gated. |
| Invalid OAuth callback | 403 | Invalid OAuth state/code is rejected. |
| Manifest, service worker, icon | 200 | Mobile web assets are served. |
| Vitest suite | 37 passing | Existing contracts plus new mobile/auth regression contracts pass. |
| TypeScript | Pass | No type errors. |
| Production build | Pass | Client and server bundles build; Vite emits only a size warning. |

The frontend’s automatic login redirect was also hardened. It now requires an online browser, a recognized unauthorized tRPC code or the established unauthorized message, and a one-time redirect guard. This reduces the risk that a transient disconnected API is misinterpreted as an authentication failure and causes a redirect loop.

## What this proves and what it does not prove

These checks provide strong evidence for the tested code paths and current environment. They do not prove zero defects, successful external OAuth persistence without a connected user session, Android Play approval, provider adapter health, malware-scanner availability, production traffic behavior, or independent penetration-test results. Those remain explicit release gates rather than hidden assumptions.

## Next acceptance gate

Before public production launch, test on real Android devices at 320px, 360px, and 390px widths; increase system text size; use Bengali, Banglish, and long URL-like strings; simulate offline after a successful visit; verify first-launch TWA behavior; exercise login, deletion, protected workspace, upload rejection, and admin boundaries; then review production logs and database readiness under a staged account. Record each result with device, browser, network condition, timestamp, and owner.
