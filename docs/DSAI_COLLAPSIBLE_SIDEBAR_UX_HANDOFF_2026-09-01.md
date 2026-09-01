# DSAI Collapsible Sidebar UX Handoff

## Interaction model

The dashboard uses a single navigation rail with two deliberate states on desktop. In the **expanded** state the rail shows the DSAI Workdesk identity, section label, readable navigation labels, and the signed-in account summary. In the **collapsed** state it becomes a compact icon rail; labels are hidden visually but remain discoverable through the built-in zero-delay tooltips. The active route keeps its visual state in either mode.

The top-left control is a native button with an accessible name that changes between “Collapse navigation” and “Expand navigation”. Its `aria-expanded` value mirrors the state. The control uses a short 200ms ease-out transition, and buttons compress by a small scale on press to provide tactile confirmation without layout movement. The shared sidebar primitive also supports `Ctrl+B` / `Cmd+B` as a keyboard toggle.

On mobile, the same rail becomes a Sheet drawer. The sticky header shows the current route label and an “Open navigation” trigger. Selecting a navigation item changes the route and immediately closes the drawer. The existing Sheet primitive owns focus trapping, overlay dismissal, and Escape behavior; the page does not duplicate that logic.

## Route map

| Label | Route | Intent |
|---|---|---|
| Overview | `/admin` | Role-gated evidence dashboard |
| Lead composer | `/lead-composer` | User-facing multilingual lead workflow |
| Creative Studio | `/creative-studio` | User-facing preview-first creative workflow |

The `/admin` route is wrapped by `DashboardLayout`, so the sidebar is connected to the visible dashboard rather than existing as an unused component. Management child routes remain available through the existing admin control map and continue to enforce server-side role checks.

## Motion and accessibility contract

Only transform, opacity, background color, and width transitions are used for interaction feedback. The motion curve is `cubic-bezier(0.23, 1, 0.32, 1)` and the primary transition is 200ms. `prefers-reduced-motion` remains authoritative in the shared styling layer, so the navigation preserves information and focus order while reducing non-essential motion.

Every interactive control has a visible focus ring, a native button role, or a semantic link. Active navigation uses both visual styling and `aria-current="page"`. The collapsed state does not remove names from the accessibility tree; labels remain available from the button content and tooltip contract. Mobile navigation exposes a dialog-backed drawer with a screen-reader title and description from the shared primitive.

## Implementation locations

| Concern | File |
|---|---|
| Dashboard shell and navigation | `client/src/components/DashboardLayout.tsx` |
| Shared responsive sidebar primitive | `client/src/components/ui/sidebar.tsx` |
| Actual dashboard route wiring | `client/src/App.tsx` |
| Sidebar regression coverage | `server/dashboard.sidebar.test.ts` and `server/admin.console.test.ts` |
| Visual evidence | `docs/DSAI_DASHBOARD_SIDEBAR_VISUAL_CHECK_2026-09-01.md` |

## Quality boundary

The sidebar interaction is project-side verified at the code-contract, TypeScript, test, build, desktop screenshot, and mobile screenshot levels. A real authenticated user should still perform a short device pass for touch target preference, browser-specific drawer behavior, and route persistence. Those checks are confirmation work, not a substitute for the automated accessibility and regression contracts already present.
