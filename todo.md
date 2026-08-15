# Backend Integration Checklist

- [x] Inspect the current static frontend routes, calls, and deployment assumptions.
- [x] Add a supported backend/database/user foundation without breaking the existing design.
- [x] Define the first API and data contracts for waitlist, UAA cases, and Creative Studio requests.
- [x] Connect frontend CTAs/forms to backend persistence with loading, success, and error states.
- [x] Connect UAA case creation/listing and Creative Studio request submission to protected tRPC procedures.
- [x] Add environment and launch documentation, including migration and secret requirements.
- [x] Run typecheck, build, API smoke tests, and browser verification.
- [x] Save an integrated checkpoint and deliver the launch-ready package.
- [x] Connect actual frontend flows for UAA case creation/listing and Creative Studio request submission, replacing advertised placeholder actions.
- [x] Add live no-write API smoke verification for waitlist validation and the unauthenticated protected-route check; avoid seeding test records.
- [x] Render the authenticated UAA case list with title, status, created time, and loading/empty/error states instead of only a count.
- [x] Update the authenticated UAA case list to display created date and time, then re-run validation.

# Strategic Reassessment

- [x] Review the current GENESIS product promise, architecture, and prior monetization assumptions.
- [x] Research specialist opportunities, competitor positioning, buyer pain, pricing, and relevant platform/policy constraints.
- [x] Define a defensible specialist wedge and evidence-based revenue architecture.
- [x] Design safe 24/7 AI operations with human approval boundaries, observability, and rollback.
- [x] Evaluate lawful non-mining compute monetization options and reject unsafe or weak alternatives.
- [x] Update the English product/operating plan and project documentation with the revised strategy.
- [x] Validate the revised plan and deliver the Bengali findings with references and concrete next actions.

# Super System Expansion

- [x] Map the highest-value customer verticals and their repeatable workflows.
- [x] Research premium workflow, lead-response, calendar, CRM, and video-production competitors and pricing.
- [x] Define lawful passive/value-generation models with unit economics and stop conditions.
- [x] Design the 3-second lead-response, consent-aware calendar, and one-click deployment architecture.
- [x] Design the premium video post-production pipeline with realistic turnaround and input-size limits.
- [x] Create the revised Super System architecture and implementation roadmap files.
- [x] Implement the safest high-value foundations in the GENESIS project.
- [x] Validate tests, security boundaries, performance assumptions, and launch readiness.
- [x] Save a new checkpoint and deliver the Bengali action plan.
- [x] Build a concrete unit-economics model for lead response, messaging, booking, video processing, support, and human review with margin thresholds.
- [x] Measure the dry-run lead planner and record latency, failure behavior, and launch-readiness assumptions without sending external messages or creating test customer data.

# Production Readiness Audit

- [x] Inspect project scripts, runtime logs, environment contracts, routes, schema, and one-command deployment behavior.
- [x] Verify frontend-to-tRPC-to-backend-to-database response paths without seeding customer data.
- [x] Verify auth, protected-route rejection, dry-run lead planner, and error handling.
- [x] Test production build, local start, health check, port selection, PID/log handling, and installer safety.
- [x] Audit responsive UX, accessibility, bundle warnings, performance assumptions, security boundaries, and launch gaps.
- [x] Fix verified issues and add production safeguards/documentation.
- [x] Re-run all checks, record readiness status, save a final checkpoint, and deliver the audit report.
- [x] Harden the installer to reuse the previous GENESIS port after a controlled restart and fail early when required full-stack production environment values are missing.
- [x] Rebuild the 404 page in the global Civic Signal visual system with Bengali-first copy, branded navigation, and accessible return action.
- [x] Correct the 404 status marker to display the full Bengali ৪০৪ code consistently across mobile and desktop.

# Runtime API Connector Layer

- [x] Inspect current admin, auth, secret, and runtime configuration surfaces.
- [x] Define connector registry states, secret boundaries, feature flags, and disabled-provider fallbacks.
- [x] Implement admin-only connector status/configuration visibility without exposing secret values.
- [x] Add a safe connector health/test contract that does not block deployment when providers are absent.
- [x] Test admin authorization, disabled-provider behavior, deployment continuity, and frontend/backend responses through backend smoke tests, unauthenticated HTTP checks, and management-preview rendering.
- [x] Document what is launch-ready versus what still requires provider credentials and legal review.
- [ ] Save the updated checkpoint and deliver the readiness confirmation.
- [x] Run an authenticated backend-contract smoke verification of connector list, no-send test, and enable/disable persistence; browser OAuth click-through remains gated on user-connected login.
- [x] Re-run isolated one-command deployment after the connector layer changes with provider credentials absent and confirm healthy startup.

# Authentication and Disconnected-State Review

- [x] Inspect runtime/browser/server errors and current OAuth/session configuration.
- [x] Inspect public signup/login entry, OAuth provider configuration, session code path, and admin-route access policy; live OAuth persistence remains an explicit gate.
- [x] Improve disconnected/error-state messaging so users know whether the issue is authentication, API, or provider configuration.
- [x] Document Google/OAuth access, account creation behavior, admin role promotion, and required production callback settings.
- [x] Design the admin WebAuthn/passkey enrollment and step-up authentication path without storing raw biometric data.
- [x] Test authentication boundaries, error states, and public-site continuity with code, HTTP, preview, and build evidence; external OAuth persistence remains unclaimed.
- [x] Distinguish authentication-required, disconnected API, and provider-degraded states in the admin console with retry guidance.
- [ ] Complete live authenticated OAuth verification in the user-connected browser, including session persistence and admin connector access.
- [x] Document the exact admin role promotion and recovery procedure for operators.
- [ ] Save a new checkpoint after the authentication and disconnected-state fixes.

# Mobile Audit and Independent Branding Review

- [x] Re-check the self-contained audit evidence that does not depend on user login or device takeover.
- [x] Research Powered by Manus attribution, branding, license, and ownership implications from authoritative sources.
- [x] Decide whether public login/landing surfaces should retain, move, or remove platform attribution.
- [x] Update the visible branding/documentation and state the exact ownership boundary without making legal guarantees.
- [x] Re-run typecheck, tests, and production build; fresh public and admin management-preview screenshots verified the responsive visual states without claiming external OAuth persistence.
- [x] Run fresh desktop and mobile screenshots after the final branding/authentication copy changes.
- [x] Record the visual evidence as management-preview/public-state verification; external authenticated OAuth persistence remains an explicit launch gate.
- [x] Run a fresh desktop screenshot review of the public homepage and admin connector route after the final branding/authentication copy updates.
