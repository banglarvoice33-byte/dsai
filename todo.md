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
- [x] Save the updated checkpoint and deliver the readiness confirmation; checkpoint `6f978380` contains the self-contained audit evidence.
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
- [x] Document the live authenticated OAuth verification as an explicit external launch gate because no user-connected browser session was available; do not claim it is verified.
- [x] Document the exact admin role promotion and recovery procedure for operators.
- [x] Save a new checkpoint after the authentication and disconnected-state fixes; checkpoint `6f978380` contains the changes.

# Mobile Audit and Independent Branding Review

- [x] Re-check the self-contained audit evidence that does not depend on user login or device takeover.
- [x] Research Powered by Manus attribution, branding, license, and ownership implications from authoritative sources.
- [x] Decide whether public login/landing surfaces should retain, move, or remove platform attribution.
- [x] Update the visible branding/documentation and state the exact ownership boundary without making legal guarantees.
- [x] Re-run typecheck, tests, and production build; fresh public and admin management-preview screenshots verified the responsive visual states without claiming external OAuth persistence.
- [x] Run fresh desktop and mobile screenshots after the final branding/authentication copy changes.
- [x] Record the visual evidence as management-preview/public-state verification; external authenticated OAuth persistence remains an explicit launch gate.
- [x] Run a fresh desktop screenshot review of the public homepage and admin connector route after the final branding/authentication copy updates.

# Production ZIP Release

- [x] Diagnose preview loading, server health, browser/runtime errors, dependency state, and stale processes.
- [x] Fix verified preview/runtime issues and restart the development service.
- [x] Re-run typecheck, tests, production build, API boundary checks, and one-command deployment smoke checks.
- [x] Confirm launch-critical authentication/admin/provider gates are documented without claiming unavailable external credentials.
- [x] Create and inspect a credential-free upload-ready ZIP with one-command deployment files and documentation.
- [x] Save a final release checkpoint and deliver the ZIP with an honest readiness report; release candidate checkpoint `fb23cbbe` saved and ZIP created.

# Conversation-to-Project Consistency Audit

- [x] Inventory the major promises made in the conversation and map each to code, preview, backend, documentation, or an explicit future gate.
- [x] Compare public homepage, authenticated workflows, admin connector console, API behavior, deployment ZIP, and strategy documents for contradictions.
- [x] Identify and correct any overclaimed features, stale copy, missing UI affordances, or undocumented limitations.
- [x] Re-run visual, runtime, API, build, and package checks after corrections.
- [x] Save the aligned checkpoint and deliver the consistency report; checkpoint `69267a1c` saved.
- [x] Remove or qualify public claims for voice input, transliteration, glossary lock, live creative generation/provenance, retention/export/forget-me controls, and live quota/billing until their implementations exist.
- [x] Replace the homepage “কীভাবে কাজ করে” placeholder action with the implemented workflow section instead of a coming-soon toast.
- [x] Bound the admin authentication loading state so a stalled session request cannot leave the preview on an indefinite spinner; show retry/sign-in guidance instead.
- [x] Regenerate and inspect the credential-free release ZIP after the consistency and auth-loading corrections.

# DSAI Rebrand and Launch Preparation

- [x] Rebrand public UI, metadata, app title, and deployment-facing copy from GENESIS to DSAI without implying ownership of unrelated companies.
- [x] Raise the public visual system by three practical quality levels with a distinctive DSAI identity, responsive layout, accessible interactions, and no fabricated claims.
- [x] Add `info@banglarvoice24news.com` as the public contact address and document `dsai@banglarvoice24news.com` as the controlled test subdomain.
- [x] Update deployment, DNS, OAuth callback, reverse-proxy, and launch documentation for the requested domain arrangement.
- [x] Update or regenerate the credential-free release package after validation.
- [x] Run typecheck, tests, build, responsive screenshots, and launch-boundary checks for DSAI.
- [x] Save a DSAI checkpoint and deliver the release with explicit DNS/email/provider operator steps; checkpoint `55b7b4ef` saved.

# DSAI Consistency Follow-up

- [x] Replace remaining user-facing and operator-facing GENESIS branding in the admin connector route, BACKEND_LAUNCH.md, and other live-facing docs.
- [x] Re-run desktop and mobile visual verification after DSAI branding is consistent across public and admin surfaces.
- [x] Reconcile all launch documentation for DSAI runtime paths, test-host wording, OAuth callback guidance, and operator steps.

# DSAI Post-Rebrand Boundary Verification

- [x] Re-run and record local root HTTP 200 health plus unauthenticated admin/API boundary checks after the final DSAI branding changes.

# DSAI Discoverability and Learn Layer

- [x] Add a Bengali-first Learn DSAI section that answers how to use DSAI, what to do first, why it exists, and which current workflows are actually available.
- [x] Add transparent social-presence and contact guidance without fabricating social accounts or URLs.
- [x] Add crawlable metadata and truthful JSON-LD structured content for DSAI, its FAQ, contact route, and public service description.
- [x] Update launch/discovery documentation with Google, ChatGPT, Bing, Search Console, accessibility, and content-freshness guidance.
- [x] Validate the Learn layer on desktop/mobile, run tests/build/boundary checks, and save a new release checkpoint; checkpoint `12f5c84b` saved.
- [x] Deliver the DSAI user-answer system, market assessment, social-account status, and operator next steps.

- [x] Regenerate and inspect the credential-free DSAI release ZIP after the Learn/discovery changes.

# DSAI Social Placeholder Interaction

- [x] Add non-navigating Facebook, Instagram, LinkedIn, YouTube, and X placeholders to the footer with accessible labels.
- [x] Show a Coming soon tooltip/toast on hover and click without fabricating social URLs.
- [x] Run tests, build, responsive preview, refresh the credential-free release archive if needed, and save a checkpoint; checkpoint `aca01b41` saved.

# DSAI Capability Answer Audit

- [x] Audit current Learn/FAQ and documentation for API-key usage, deployment, Super Agent, and text-to-video answers.
- [x] Add a simple Bengali-first capability matrix that separates implemented, preview, roadmap, and provider/operator-gated features.
- [x] Add safe API-key handling and one-click deployment guidance without exposing secrets or promising unavailable integrations.
- [x] Add honest Super Agent and text-to-video workflow answers, including current limits and required gates.
- [x] Validate the updated answer layer with tests, build, preview, and boundary checks; save a checkpoint and deliver the capability guide; checkpoint `774ff6ae` saved.

# DSAI Trust and Global Bengali Market Assessment

- [x] Audit current DSAI implementation evidence, trust claims, safety boundaries, and investor-facing gaps.
- [x] Research Bengali language/diaspora population signals, relevant AI adoption, localization, and adjacent workflow opportunities using authoritative sources.
- [x] Assess user trust, defensibility, monetization, unit economics, risks, and investor-readiness without guaranteeing returns.
- [x] Define a phased global rollout for Bangladesh, India, and Bengali diaspora markets with measurable validation gates.
- [x] Write and deliver an evidence-based DSAI investment-readiness and opportunity brief.

# DSAI Organic Growth and Launch Execution

- [x] Audit current DSAI crawlability, metadata, Learn content, conversion paths, analytics, social presence, and launch readiness.
- [x] Research current official guidance for helpful content, AI-search visibility, structured data, Search Console, Bengali localization, and ethical organic growth.
- [x] Implement the highest-value truthful organic-growth foundations and Bengali content/navigation improvements.
- [x] Create an AI-assisted editorial, analytics, partnership, and conversion operating playbook without spam or fabricated engagement.
- [x] Validate the growth layer, update the release/checkpoint, and deliver the organic-growth roadmap with measurable next steps; checkpoint `73ebe2cb` saved.

# DSAI Organic Growth Handoff Follow-up

- [x] Deliver a user-facing DSAI organic-growth roadmap summary with measurable next steps after checkpoint `73ebe2cb`.
- [x] Regenerate and inspect the credential-free DSAI release archive containing the dedicated Learn page and organic-growth playbook.

# DSAI Citation Readiness and Authority

- [x] Audit DSAI’s current citation-worthy evidence, public entity signals, structured data, source quality, and internal linking.
- [x] Research official Google/Bing/AI-search guidance on citations, helpful content, indexing, structured data, and authority signals.
- [x] Implement original evidence and public reference surfaces such as methodology, capability ledger, safety commitments, evaluation approach, and cited Learn content.
- [x] Add ethical authority-building, measurement, and outreach procedures without buying links, fabricating reviews, or manipulating AI answers.
- [x] Validate the citation-readiness layer, update the release/checkpoint, and deliver the measurable reference strategy.

# DSAI Privacy Policy and Dynamic Changelog

- [x] Audit current data flows, schema, admin authorization, public navigation, and disclosure gaps.
- [x] Define a truthful privacy policy based on implemented storage, auth, analytics, provider, retention, and user-rights boundaries.
- [x] Add a changelog data model and migration with public published entries and admin-only draft/publish controls.
- [x] Implement responsive Privacy Policy and Changelog pages plus admin changelog management without exposing secrets.
- [x] Add tests for public changelog reads, admin authorization, publish validation, and privacy/changelog navigation.
- [x] Validate typecheck, tests, build, HTTP boundaries, responsive UX, migration, and credential-free release packaging; save a checkpoint and deliver operator guidance.

# DSAI Privacy and Changelog Handoff Follow-up

- [x] Regenerate and inspect a credential-free DSAI release ZIP containing the privacy, changelog, admin manager, migration, and verification docs.
- [ ] Save a post-privacy/changelog checkpoint and record its version ID.
- [ ] Deliver the operator handoff covering privacy-policy limits, changelog publishing, migration status, and launch caveats.
