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
- [x] Save a post-privacy/changelog checkpoint and record its version ID; checkpoint `b7afacd3` saved.
- [x] Deliver the operator handoff covering privacy-policy limits, changelog publishing, migration status, and launch caveats.

# DSAI Data Deletion Request

- [x] Audit current Privacy Policy, database schema, public procedures, and admin authorization patterns for deletion-request handling.
- [x] Add a deletion-request table with minimal data, identity-confirmation status, request status, timestamps, and operator review metadata.
- [x] Implement a public Privacy Policy form that validates input and never requests passwords, API keys, or raw documents.
- [x] Implement admin-only deletion-request review and status updates without automatically deleting data before verification.
- [x] Update privacy disclosures and operator guidance with the request lifecycle, retention, verification, and lawful exceptions.
- [x] Add tests, apply and verify the migration, run build/boundary/responsive checks, refresh the credential-free archive, save a checkpoint, and deliver the handoff.

# DSAI Data Deletion Handoff Follow-up

- [x] Regenerate and inspect a credential-free DSAI archive containing the deletion request form, migration, admin review page, tests, and verification docs.
- [x] Save a post-deletion-request checkpoint and record its version ID; checkpoint `79ab925d` saved.
- [x] Deliver the user-facing deletion request and operator-review handoff.

# DSAI Deletion Dashboard Filters

- [x] Audit current admin deletion request list and query behavior before adding controls.
- [x] Define validated status, date-range, and ascending/descending sort semantics.
- [x] Implement admin-only status/date filters, sorting, result count, and reset controls.
- [x] Add tests for filter/sort behavior and authorization, then run responsive preview, build, boundary checks, archive refresh, checkpoint, and handoff; checkpoint `a93399bd` saved.

# DSAI Deletion Filter Handoff Follow-up

- [x] Regenerate and inspect a credential-free DSAI archive containing the filtered admin deletion dashboard and verification docs.
- [x] Save a post-filter checkpoint and record its version ID; checkpoint `a93399bd` saved.
- [x] Deliver the operator handoff explaining status/date filters, sort order, reset behavior, and admin-only access.

# DSAI Homepage Search

- [x] Add a Bengali-first homepage search bar with local content index, autocomplete suggestions, keyboard navigation, and section navigation.
- [x] Add focused tests for search matching, suggestion selection, empty states, and accessibility behavior.
- [x] Verify the search experience on desktop and mobile, then save a checkpoint.

# DSAI Search Analytics

- [x] Review the existing search interaction, analytics configuration, database schema, and admin navigation.
- [x] Add privacy-preserving normalized search event capture with aggregate counts and bounded retention fields.
- [x] Add admin-only aggregate search trend visibility and protect it with tests and HTTP boundaries.
- [x] Verify analytics capture, aggregation, build, responsive UI, and save a checkpoint.

# DSAI Competitor-Informed Upgrade

- [x] Add an auditable competitor benchmark and clearly state DSAI's defensible product edge.
- [x] Implement a public Bengali-first DSAI Method page with source-first, human-review, privacy, and provider-neutral workflow explanations.
- [x] Add homepage discovery/navigation for the Method page and update sitemap/metadata coverage.
- [x] Add contract tests and verify the new page on desktop/mobile before saving a checkpoint.

# DSAI Frontend Design Lab

- [x] Audit public, authenticated, and admin frontend hierarchy for misplaced or duplicated elements.
- [x] Capture desktop/mobile visual evidence for homepage, Method, Learn, Privacy, and admin states.
- [x] Fix the highest-value spacing, navigation, content-order, responsive, and accessibility issues found in the lab.
- [x] Re-run typecheck, tests, build, HTTP boundaries, and responsive screenshots before saving a checkpoint.

# DSAI Missing Frontend Surfaces

- [x] Inventory existing backend procedures and identify frontend capabilities that are currently only reachable from the homepage.
- [x] Add a clear authenticated workspace route with cases, creative queue entry point, status, and actionable empty/loading/error states.
- [x] Add consistent navigation from homepage and workspace without exposing protected data publicly.
- [x] Add contract tests and verify desktop/mobile workspace states, HTTP boundaries, build, and checkpoint.

# DSAI Language Quality Audit

- [x] Inventory Bengali, Banglish, English, metadata, search, form, error, toast, and accessibility copy across the frontend.
- [x] Define and enforce consistent Bengali-first wording, transliteration, technical-term, and language-toggle rules.
- [x] Correct the highest-value language, typography, line-break, and mobile-readability issues.
- [x] Add language contract tests and verify routes, build, and responsive screenshots before saving a checkpoint.

# DSAI Multilingual Search Upgrade

- [x] Audit current search matching, labels, aliases, keyboard behavior, and no-result guidance for Bengali, Banglish, and English.
- [x] Add multilingual aliases/normalization and clearer result metadata without recording raw keystrokes.
- [x] Add focused tests for Bengali, English, Banglish, autocomplete, keyboard, and no-result behavior.
- [x] Verify desktop/mobile search presentation, build, route boundaries, and save a checkpoint.

# DSAI Backend Modernization

- [x] Assess current backend readiness: contracts, persistence, auth, error handling, connectors, observability, and deployment behavior.
- [x] Research current production patterns for queues, idempotency, webhooks, API versioning, privacy, rate limiting, and provider abstraction.
- [x] Define a staged backend modernization plan with explicit launch gates, alternatives, costs, and operational ownership.
- [x] Implement the highest-priority low-risk backend foundations that fit the current project without fabricating provider capabilities.
- [x] Add backend contract tests, build/runtime checks, documentation, and save a checkpoint.

# DSAI Security Audit

- [x] Inventory security claims and inspect authentication, authorization, input, privacy, secrets, logging, deployment, and public/admin boundaries.
- [x] Run automated source, dependency, build, runtime, and HTTP security checks without exposing secrets or destructive data.
- [x] Fix enforceable security gaps and add regression tests for object ownership, admin boundaries, headers, redaction, and validation.
- [x] Document verified security claims, limitations, and remaining launch gates, then save a checkpoint.

# DSAI Upload Security Pipeline

- [x] Assess current storage helpers, upload surfaces, retention requirements, and scheduled-cleanup constraints.
- [x] Define a fail-closed quarantine and malware-scanning architecture with explicit provider/runtime gates.
- [x] Implement secure upload metadata, scan states, retention expiry, deletion propagation, and operator visibility without storing file bytes in MySQL.
- [x] Add authorization, validation, retention, failure, and cleanup contract tests; document the policy and save a checkpoint.

# DSAI Lead Agent, Hosting, and Affiliate Architecture

- [x] Audit current authentication, calendar/messaging/payment readiness, hosting mode, and connector boundaries for the requested 3-second agent and monetization flows.
- [x] Research 5–7 leading hosting provider options, low-latency lead-response architecture, VPS resale/control-plane requirements, and compliant affiliate patterns.
- [x] Define a truthful provider-neutral control plane with explicit credentials, consent, latency SLO, scaling, metering, payout, fraud, tax, and refund gates.
- [x] Implement readiness surfaces and operator documentation without fabricating live hosting, calendar, messaging, payment, or affiliate integrations.
- [x] Validate the architecture, capability claims, privacy/security boundaries, and save a checkpoint.

# DSAI Live Knowledge Help and Affiliate Readiness

- [x] Audit existing Learn, FAQ, search, chat primitive, public navigation, and affiliate/provider status before adding live help.
- [x] Define safe Bengali/Banglish/English answer boundaries, escalation states, privacy behavior, and affiliate disclosure placement.
- [x] Implement an accessible knowledge-help popup with categorized quick answers, search, keyboard controls, and links to relevant DSAI routes.
- [x] Add an explicit affiliate readiness/disclosure surface without fabricating live affiliate links or payout capability.
- [x] Validate the help experience across desktop/mobile, language states, routes, tests, build, and accessibility semantics before checkpoint.

# DSAI Mobile Overlap and Verification Links

- [x] Reproduce the mobile overlap across homepage hero, fixed help popup, search/results, and long Bengali content surfaces.
- [x] Audit Who is DSAI, How it works, How to use DSAI, Learn, Platform, Workspace, and admin route claims against implemented behavior.
- [x] Fix mobile stacking, safe-area, z-index, overflow, and bottom-overlay behavior without hiding meaningful content.
- [x] Add or clarify public user-flow and admin-console discovery links, then run full responsive, route, content, build, and authorization checks.
- [x] Save a verified checkpoint and deliver direct public and admin preview links.

# DSAI Final Launch Readiness Audit

- [x] Trace why unauthenticated login attempts show waitlist/interest messaging and verify the actual OAuth, session, and protected-route behavior.
- [x] Audit deploy-genesis.sh, environment requirements, database migration state, security/privacy controls, backup/rollback, and provider-gated launch items.
- [x] Build a plan-versus-delivery matrix from the original requirements, marking implemented, partially implemented, provider-gated, and not yet built capabilities.
- [x] Run final typecheck, tests, production build, local/public/admin route checks, responsive checks, and credential-free package inspection.
- [x] Document the final A-to-Z deployment checklist, known limitations, missing launch gates, and save a final checkpoint.

# DSAI Android and Low-Network Readiness

- [x] Audit the current web app, auth, storage, PWA assets, and deployment package to choose PWA/TWA/native Android scope honestly.
- [x] Research current Google Play, Android privacy, account deletion, target SDK, Data safety, and offline UX requirements from authoritative sources.
- [x] Implement feasible low-network foundations: installable web metadata, service worker caching for public content, offline shell, retry states, and no false offline-write claims.
- [x] Prepare Android packaging/submission readiness documentation, privacy/data disclosures, deep links, icons, signing, and release gates without claiming an APK/AAB is already published.
- [x] Run offline simulation, responsive/accessibility, security, build, route, and package checks; document remaining gates and save a checkpoint.

# DSAI Full-Stack Regression and Visual Reliability Audit

- [x] Reproduce and document all visible frontend overlap, clipping, typography, fixed-overlay, and mobile breakpoint defects across public, workspace, privacy, and admin routes.
- [x] Inspect browser console, network, server logs, health/readiness, auth/protected/admin boundaries, tRPC error paths, database contracts, and deployment runtime assumptions for hidden failures.
- [x] Fix verified frontend layout/accessibility defects and backend reliability issues without weakening privacy, authorization, or fail-closed behavior.
- [x] Add regression tests for each verified defect and run full typecheck, tests, production build, route/API boundary checks, and desktop/mobile visual verification.
- [x] Save a correction checkpoint and document residual risks that require real credentials, production traffic, device testing, or independent security review.

# DSAI Final Frontend and Production Package Release

- [x] Re-audit all primary routes at 320px, 360px, 390px, tablet, and desktop widths and identify the exact remaining visible layout defects.
- [x] Inspect current preview screenshots, browser/server logs, deployment script, production docs, and release contents for stale or inconsistent guidance.
- [x] Fix only reproduced frontend defects, including typography, overflow, spacing, fixed overlays, navigation, forms, and accessibility issues.
- [x] Consolidate the latest deployment, Android, low-network, privacy, security, and provider-gate guidance into the production operator documentation.
- [x] Run full automated, HTTP boundary, build, package, responsive, and visual checks; save the final release checkpoint with residual risks documented.

# DSAI Complete Download and One-Command Deployment Handoff

- [x] Verify the latest checkpoint, project files, deploy script, environment contract, and operator documentation.
- [x] Create a complete credential-free project archive that includes all source, configuration, migration, PWA, deployment, and documentation files while excluding secrets, runtime state, dependencies, and build artifacts.
- [x] Write the final Bengali-first download/upload/deployment handoff with exact commands, environment setup, port behavior, reverse proxy, health checks, rollback, and troubleshooting.
- [x] Validate archive integrity, deploy script syntax, build/tests, and release contents; save a release checkpoint and deliver the archive and guide.

# DSAI Direct Auth Login Route

- [x] Inspect current App routes, auth hook, login helper, OAuth callback, and existing login CTAs before adding a canonical direct login path.
- [x] Add `/auth/login` with safe return-to handling, authenticated workspace redirect, OAuth start behavior, and offline/error protection.
- [x] Add regression tests for route discovery, return-to sanitization, OAuth entry behavior, and no redirect loop.
- [x] Validate local/live route boundaries, build, tests, and mobile rendering; save a checkpoint with operator OAuth verification steps.

# DSAI Repeated A-to-Z Diagnosis and New Release

- [x] Re-audit source/configuration, frontend routes/layout, auth/OAuth, backend/API, database/readiness, security, PWA/offline, deployment, documentation, and package boundaries.
- [x] Run repeated visual, functional, API boundary, offline, archive, build, and live-versus-preview checks; record every reproducible issue and risk.
- [x] Correct verified defects without weakening authorization, privacy, fail-closed upload behavior, OAuth nonce validation, or truthful capability messaging.
- [x] Create a new credential-free release archive and comprehensive Bengali diagnosis/deployment guide with checksums and explicit production-only gates.
- [x] Save a new checkpoint after final validation and deliver the archive, checkpoint, and operator handoff.
- [x] Fix the reproduced mobile global Help overlay collision on Method, Workspace, Platform, and admin surfaces by placing the trigger in normal document flow on narrow screens while preserving desktop floating behavior.

# DSAI Release Archive Size Comparison

- [x] Inventory previous and current archive file counts, uncompressed sizes, compressed sizes, exclusions, and checksums.
- [x] Compare required source, deployment, PWA, test, migration, and documentation files across releases.
- [x] Report the exact size difference, compression/exclusion causes, and whether any required capability was omitted.

# DSAI Admin Connector and Credential Provisioning

- [x] Inspect the admin connector route, registry data model, UI fields, server procedures, and current provider-gate documentation.
- [x] Map each required credential to its authoritative provider source and distinguish Manus-managed secrets from user-supplied integration secrets.
- [x] Verify the safe submission flow, secret redaction/storage boundary, admin authorization, and preview-only versus live behavior.
- [x] Deliver Bengali operator instructions without exposing or attempting to retrieve private auth/API keys.

# Manus API Credential Setup Guide

- [x] Verify DSAI’s exact Manus environment variables, server-only usage, connector behavior, and health/test endpoints.
- [x] Document Management UI secret provisioning and VPS `.env.production` setup without exposing real values.
- [x] Document restart, validation, rotation, revocation, and troubleshooting commands with explicit security boundaries.
- [x] Report which credentials cannot be retrieved by the assistant and which features remain gated after setup.

# DSAI Server Configuration Validator

- [x] Define fail-closed checks for required environment variables, MySQL URL, secret strength, OAuth values, Manus server-only credentials, optional connectors, and `.env.production` permissions.
- [x] Implement a non-secret-printing validation script and run it before deployment.
- [x] Add automated tests for valid, missing, malformed, weak-secret, permission, and secret-leakage cases.
- [x] Document usage, exit codes, remediation steps, and integrate the validator into the one-command deployment flow.

# DSAI Admin Connector Test Environment Verification

- [x] Inspect `/admin/connectors`, connector registry procedures, environment mapping, admin authorization, and current runtime logs without exposing credentials.
- [x] Reproduce the Test environment flow in safe fallback mode and identify any actual UI, API, or configuration error.
- [x] Fix verified errors or improve truthful operator feedback while preserving secret redaction and no-provider-action safety.
- [x] Run admin route/boundary, connector procedure, build, test, and responsive checks; save a checkpoint and report any operator-provided secret requirements.

# DSAI Mobile Admin Setup Handoff

- [x] Reproduce the current admin connector mobile flow and document blank/old-live deployment limitations without requesting user credentials.
- [x] Add a compact Android-friendly setup guide/status surface that explains deployment, secret provisioning, admin login, Test environment, and remediation without rendering secrets.
- [x] Preserve fail-closed auth, secret redaction, provider gating, and no-provider-action behavior while improving mobile usability.
- [x] Validate the new mobile flow, auth/admin boundaries, connector test behavior, build, deployment script, and post-deploy instructions; save a checkpoint.

# DSAI Mobile Setup Progress Stepper

- [x] Add an accessible mobile progress indicator for the three setup stages.
- [x] Add clear current/completed/pending step visuals and concise Bengali instructions without accepting or rendering secrets.
- [x] Add regression coverage and run 390px visual, build, route, and auth-boundary checks; save a checkpoint.

# DSAI Student Pro Scholarship Program

- [x] Define eligibility, Bengali-language scope, 100-seat cap, 30-day entitlement, daily/monthly quota values, appeals, and privacy notice.
- [x] Inspect current user, admin, billing/entitlement, database, and usage architecture before selecting a safe implementation path.
- [x] Implement application, layered student verification, one-account-per-person controls, manual review, capped entitlement, and usage ledger without exposing sensitive documents.
- [x] Add admin review, audit trail, abuse/rate-limit controls, deletion/retention behavior, and truthful failure states.
- [x] Run migration, authorization, quota, abuse, privacy, responsive, build, and regression validation; save a checkpoint and document operator rules.

# DSAI Scholarship Quota Notifications

- [x] Define daily/monthly warning thresholds, Bengali copy, delivery surface, exhausted/expired states, and no-spam deduplication semantics.
- [x] Inspect current scholarship quota helpers, notification primitives, and workspace/scholarship UI surfaces.
- [x] Implement server-side quota warning calculation and deduplicated in-app notification presentation without exposing sensitive data.
- [x] Add regression coverage and run quota, notification, privacy, authorization, responsive, build, and deployment checks; save a checkpoint.

# DSAI CAPTCHA Login Protection

- [x] Define CAPTCHA scope for OAuth entry and sensitive auth paths, privacy boundaries, provider choice, fallback, rate-limit interaction, and accessibility requirements.
- [x] Inspect current `/auth/login`, OAuth state/nonce flow, environment contract, security headers, and existing authentication failure handling.
- [x] Implement server-verified CAPTCHA challenge/verification, fail-closed configuration behavior, safe OAuth continuation, and Android-friendly UI/error states.
- [x] Add regression tests and run OAuth, CAPTCHA, privacy, rate-limit, responsive, build, and deployment validation; save a checkpoint and document provider setup.

# DSAI Revised Preview and Admin Credential Scope

- [x] De-scope live custom-domain CAPTCHA/provider validation until the domain is active, while keeping production fail-closed behavior documented.
- [x] Inspect current CAPTCHA gate, admin connector registry, environment validator, secret manager boundary, and provider adapters for preview-safe behavior.
- [x] Add a guided admin credential/API configuration status surface that never displays or accepts secrets in unsafe frontend storage and never enables unverified provider actions.
- [x] Validate preview login, admin authorization, secret redaction, provider test/status behavior, build, mobile layout, and future domain activation steps; save a checkpoint.

# DSAI Connector Setup Guidance Follow-up

- [x] Add Manus Built-in API to the admin connector registry with safe required environment-key names.
- [x] Display connector setup guidance in Bengali-first mobile admin cards without rendering secret values.
- [x] Add regression coverage for connector metadata and sandbox-safe CAPTCHA provider validation.
- [x] Re-run 48 Vitest tests, TypeScript, and production build successfully; existing bundle-size warning remains non-blocking.

# Secure Operator Credential Setup

- [x] Present only the mandatory deployment/runtime secret names through a secure input flow; never request secret values in chat.
- [x] Validate the supplied configuration with the existing fail-closed environment validator and report any remaining provider or domain gates.

# Corrected Non-CAPTCHA Credential Scope

- [x] Offer secure inputs for deployment database, session signing, OAuth, and Manus Built-in API credentials only; exclude CAPTCHA from this request.
- [x] Validate the non-CAPTCHA configuration with the fail-closed deployment validator and report any missing optional connector credentials.

# Secure VPS Production Environment

- [x] Add a credential-free `.env.production.example` covering mandatory core deployment variables and optional connectors, with no fabricated secrets.
- [x] Add a protected setup helper that creates `.env.production` with mode 600 and fails when required values are missing or unsafe.
- [x] Integrate the helper into the one-command deployment path and document the exact VPS setup sequence.
- [x] Validate the helper, fail-closed behavior, secret non-printing, typecheck, tests, and production build.

# DSAI Developer Navigation Reorganization

- [x] Audit current DSAI শিখুন content, navigation labels, technical answers, and routes.
- [x] Add a dedicated ডেভেলপার area for API, deployment, OAuth, connectors, and technical documentation.
- [x] Keep general user education in DSAI শিখুন and update cross-links without creating dead-end routes.
- [x] Verify desktop/mobile navigation, route content, tests, and production build.

# Launch-Grade Premium Polish and Sustainability

- [x] Audit current first-visit, navigation, mobile, offline, accessibility, performance, SEO, and maintainability readiness.
- [x] Define measurable launch targets for perceived speed, Core Web Vitals, responsive stability, accessibility, and Bengali-first usability.
- [x] Implement the highest-value code-level performance and premium UX improvements without changing truthful product capability claims.
- [x] Add regression coverage and verify desktop/mobile routes, offline shell, accessibility contracts, build output, and production boundaries.
- [x] Document the sustainable update process, release gates, monitoring loop, and future capability integration model.

# Final Brand Priority Actions

- [x] Audit DSAI brand promise, trust proof, launch funnel, audience entry points, and operator readiness.
- [x] Define a focused brand operating system with one primary wedge, proof loop, content rhythm, and measurable launch metrics.
- [x] Implement the highest-impact final brand surfaces and truthful conversion copy without fabricated social proof or claims.
- [x] Verify mobile, accessibility, conversion paths, public metadata, and release boundaries; document the final brand action plan.

# Front-Site Finishing Touch Audit

- [x] Audit public-facing Bengali/English copy, headings, labels, CTA wording, footer, metadata, and trust language for consistency.
- [x] Identify high-confidence refinements to typography, hierarchy, spacing, mobile wrapping, accessibility, and visual rhythm without adding new claims.
- [x] Implement the restrained finishing-touch updates and add regression coverage for critical copy and navigation contracts.
- [x] Verify desktop/mobile screenshots, route behavior, TypeScript, tests, production build, and save a recoverable checkpoint.

# Premium Dark Mode Toggle

- [x] Audit current theme context, header controls, CSS tokens, and public route styling.
- [x] Define a DSAI Night Workdesk palette with accessible contrast and clear Bengali labels.
- [x] Implement a persistent dark mode toggle with system-aware initial preference and reduced-motion-safe transitions.
- [x] Verify contrast, mobile layout, theme persistence, routes, tests, production build, and save a recoverable checkpoint.

# DSAI First-Version Final Launch Readiness

- [x] Reconcile the current release guidance with the live-launch gates and operator-owned requirements.
- [x] Audit routes, auth boundaries, environment validation, database readiness, PWA/offline assets, deployment script, and release artifacts.
- [x] Run final tests, typecheck, production build, health/readiness checks, public route checks, and responsive verification.
- [x] Fix only verified release blockers and document domain, OAuth, credentials, Android, monitoring, and rollback gates.
- [x] Save the final first-version launch checkpoint and deliver a truthful go/no-go handoff.

# Correct Release Archive Name

- [x] Align deployment handoff and release references with `genesis-platform-site-1.zip`.
- [x] Verify that the corrected archive name is used consistently without changing the project root or deployment script.

# Corrected VPS Command Sequence

- [x] Align the full VPS sequence with the exact archive name `genesis-platform-site-1.zip` and one consistent extraction directory.
- [x] Remove redundant or mismatched `cd` assumptions from the copy-paste environment, validation, deployment, and health commands.

# Fresh DSAI Release Archive

- [x] Create a fresh credential-free archive with the current DSAI code and `deploy-genesis.sh`, excluding old runtime files, secrets, node_modules, dist, and `.git`.
- [x] Verify the archive has the correct deployment entrypoint and no legacy `genesis.sh` dependency.
- [x] Deliver the fresh archive link with safe VPS replacement commands; do not delete remote files automatically.

- [x] Connect authenticated Trace Store reads to ownership-scoped durable trace procedures with local alpha fallback
- [x] Persist authenticated read-only pilot and lead-agent simulation traces without raw prompts or secrets
- [x] Add deterministic Bengali benchmark evaluator for normalization, intent routing, safety, and human handoff
- [x] Add admin-only Bengali benchmark execution procedure and Quality Gates control
- [x] Add lightweight no-grant OAuth credential validation tests for configured sandbox providers
- [x] Update reusable DSAI launch skill with durable trace, performance, benchmark, and OAuth release-gate patterns
- [ ] Replace provider-gated OAuth harness with real sandbox callback/revoke execution after operator credentials and callback URLs are verified
- [ ] Collect measured field performance snapshots for every module and approve the Super Fast release gate

- [x] Add a browser-measured current-route performance sample control that records authenticated field timing without fabricating module metrics
- [x] Validate configured sandbox OAuth client secrets with no-grant token endpoint checks; no authorization or customer-data access performed

# Full-System Production Requirements Audit
- [x] Audit the complete platform for remaining security, privacy, reliability, quality, performance, accessibility, billing, observability, and deployment requirements
- [x] Research authoritative requirements and map each gap to an implementation or operator gate
- [x] Implement feasible high-value production controls discovered by the audit
- [x] Add regression coverage and validate the revised platform across build, tests, runtime, and responsive routes
- [x] Save a checkpoint and deliver the full-system requirements report with remaining gates

- [x] Add reusable security-header policy with browser isolation defaults, HSTS, and production report-only CSP
- [x] Add bounded API mutation rate limiting with Retry-After behavior and a documented shared-edge limitation
- [x] Add regression coverage for security headers and baseline rate limiting
- [x] Save authoritative full-system requirements research with OWASP ASVS, NIST AI RMF, and WCAG 2.2 mappings

# Operational Resilience and Accessibility Upgrade
- [x] Audit and implement centralized telemetry with redaction, correlation IDs, metrics, and alert-ready event contracts
- [x] Audit and implement retention/deletion audit events with ownership, tombstones, and verification evidence
- [x] Add billing webhook signature-verification and idempotency contracts without enabling unconfigured billing side effects
- [x] Add backup/restore drill contracts, manifest checks, RTO/RPO evidence, and operator runbook
- [x] Add automated accessibility checks and regression coverage for keyboard, semantics, contrast, and reduced motion
- [x] Validate all five workstreams, save a checkpoint, and deliver remaining provider/operator gates

# Multi-Agent Creative Generation Upgrade
- [x] Audit current text-to-image, text-to-video, image-to-video capabilities, providers, storage, agent registry, and safety boundaries
- [x] Research generation workflow architecture, provenance, evaluation, safety, cost, and provider requirements
- [x] Implement independent image, text-video, and image-video lead-agent contracts with support agents and preview-first approval states
- [x] Add generation quality, safety, provenance, cost, retry, and failure-evaluation contracts without claiming unavailable provider execution
- [x] Add Bengali-first creative workflow UI and truthful provider-gated capability states
- [x] Validate tests, build, responsive UI, and save the creative architecture checkpoint

# Public-Private Capability and Low-Cost Video Upgrade
- [x] Inventory government and private-sector service departments, supported file types, workflow boundaries, and current quality evidence
- [x] Research public-sector accessibility, records, privacy, document workflow, and lawful low-cost video-generation requirements
- [x] Implement a truthful capability matrix with quality levels, file-service contracts, specialization gaps, and explicit provider/operator gates
- [x] Implement lawful low-cost video controls: preview tiers, quota budgets, cache/deduplication, batching, queue policies, and cost evidence
- [x] Add Bengali-first capability and cost-control surfaces, regression tests, responsive verification, and a checkpoint

# End-to-End Deployment Readiness Audit
- [x] Audit source, dependencies, environment contract, secrets, migrations, scripts, packaging, and rollback assumptions
- [x] Validate build, runtime health, database readiness, authentication, security, storage, telemetry, and accessibility
- [x] Audit provider gates, performance evidence, DNS/TLS, backups, operational runbooks, and launch communications
- [x] Implement feasible deployment fixes and document all unresolved operator/provider gates
- [x] Run end-to-end validation, save a checkpoint, and deliver the deployment verdict

# Final One-Command ZIP and Public Deployment Verification
- [x] Audit one-command deployment script, environment validation, packaging rules, and secret exclusion
- [x] Run clean build and installer/package smoke checks with release integrity evidence
- [x] Test the public managed deployment for health, security headers, updated routes, and critical boundaries
- [x] Fix verified release issues and regenerate a safe ZIP archive
- [x] Save a checkpoint and deliver the ZIP link with a truthful deployment verdict

# OAuth Blocked Resolution, Video Live Test, ZIP, and Presentation
- [x] Audit the OAuth blocked state, callback URL, provider secret availability, and fail-closed behavior
- [x] Define a lawful zero-cost video preview live-test plan with explicit quota, provider, and safety limits
- [x] Regenerate and validate the credential-free one-command deployment ZIP
- [x] Create a presentation script summarizing deployment status and OAuth integration steps
- [x] Validate artifacts, save a checkpoint, and deliver the ZIP and script links with remaining gates

# Launch-Day Operations and Announcement Assets
- [x] Document exactly where OAuth callback settings, provider credentials, DNS/proxy access, and performance evidence are supplied without sharing secrets in chat
- [x] Create a launch-day controlled-alpha checklist with go/no-go gates, rollback, support, privacy, and announcement steps
- [x] Create a premium Bengali-first launch announcement image that highlights DSAI without claiming unavailable provider execution
- [x] Create a short launch announcement video or production-ready video concept with truthful product messaging
- [x] Validate and package launch documentation and announcement assets

# Blank Public Page Incident
- [x] Reproduce the reported blank page and identify the affected route and runtime error
- [x] Fix the rendering, asset, authentication, or deployment mismatch causing the blank page
- [x] Add regression coverage and validate the affected managed route on mobile and desktop
- [x] Save a checkpoint with the blank-page remediation and report any remaining gates

# Long-Term Reliability, Value, and Public Answer Upgrade
- [x] Audit likely failure modes, durability risks, stale claims, public answer surfaces, and service-specific explanations
- [x] Research authoritative reliability, AI governance, public knowledge, ethical growth, and value-creation requirements
- [x] Implement durable resilience controls, evidence-aware public answers, and service capability explanations
- [x] Create a long-term operating playbook, value-creation roadmap, and ethical brand-quality controls
- [x] Validate tests, build, accessibility, public routes, content rendering, and save a checkpoint

# OAuth Invalid-State Recovery
- [x] Reproduce and audit the invalid OAuth state failure across state creation, cookie transport, callback decoding, and duplicate initiation
- [x] Implement secure stale-state recovery without weakening CSRF or callback validation
- [x] Validate OAuth error handling, public continuity, tests, build, and save a checkpoint

# Backend–Frontend and Admin Console Readiness Audit
- [x] Audit frontend routes, tRPC procedures, schemas, permissions, admin modules, and feature status boundaries
- [x] Run backend, frontend, protected-boundary, and feature-level integration checks without seeding customer data
- [x] Evaluate admin console completeness and implement safe corrective improvements for missing management controls
- [x] Validate end-to-end behavior, accessibility, responsive admin UX, build, and save a checkpoint

# Custom-Domain Auth Route Recovery
- [x] Verify custom-domain and managed-domain /auth/login responses and identify whether the failure is edge routing or application fallback
- [x] Implement the safest deployable SPA route fallback or document the exact external reverse-proxy correction required
- [x] Validate custom and managed routes, OAuth login rendering, build, accessibility, and save a checkpoint

# Ordered Running-Project Completion and Service Spotlight
- [ ] Close the custom-domain SPA routing and upstream deployment gap before public promotion
- [x] Complete backend–frontend and admin-console integration validation and corrective controls
- [x] Add a truthful Bengali-first service inquiry spotlight with eventai@banglarvoice24news.com
- [x] Validate all routes, integrations, accessibility, responsive behavior, build, and save a checkpoint

# Clean-Room Google Cloud VM Deployment
- [x] Collect non-secret VM, OS, DNS, firewall, port, database, and deployment prerequisites
- [x] Prepare a clean-room deployment package and operator-safe environment configuration
- [ ] Deploy DSAI with process supervision, reverse proxy, TLS, database contract, and rollback evidence
- [ ] Validate public routes, API/auth boundaries, health, OAuth callback readiness, and operations
- [x] Deliver the clean-room deployment runbook and remaining operator gates

# Secure Self-Hosted Secret Injection
- [x] Define and document a secure VM-side method for injecting OAuth, database, session, and provider secrets without exposing values in chat or release archives
- [ ] Validate secret names, permissions, startup loading, rotation, and fail-closed behavior on the clean-room VM

# VM Bootstrap and Automatic Environment Wiring
- [x] Define `/home/dulal_sarder90/dsai`, `/etc/dsai`, runtime, log, backup, and release directories
- [x] Automatically discover safe server metadata and write it to the correct non-secret environment/config fields
- [x] Keep secret values out of chat and shell history while wiring interactive or Secret Manager injection
- [x] Validate bootstrap syntax and document the next deployment commands

# Authoritative Production Release Handoff
- [x] Audit current release ZIPs, checkpoint contents, deployment scripts, docs, and secret-file exclusions
- [x] Regenerate and integrity-check the authoritative credential-free production ZIP
- [x] Provide the release archive and exact upload/extract commands for the empty Google Cloud VM
- [ ] Continue VM deployment from the verified archive and validate service, proxy, database, health, and OAuth gates

# Secure One-Time Secret Handoff Clarification
- [x] Document the distinction between Manus output ownership guidance and verified VPS deployment status
- [x] Provide a credential-free one-time VM-side secret injection workflow with protected permissions and cleanup
- [x] Document the remaining live deployment, database, proxy, health, and OAuth operator gates without overclaiming completion

# One-Time Wrapper Self-Reference Fix
- [x] Remove hardcoded archive URL/checksum coupling from the wrapper and make it consume the locally uploaded ZIP with explicit checksum verification
- [x] Regenerate, test, and redeliver the corrected credential-free archive

# Command, Authority, Input, and Institutional Readiness Audit
- [x] Inventory deployment, bootstrap, environment, migration, service, proxy, health, rollback, and validation commands
- [x] Audit ownership, code/system authority, licensing, policy, disclaimer, terms, privacy, and institutional control surfaces
- [x] Audit keyboard/input handling, Bengali/Banglish normalization, intent routing, and understanding claims
- [x] Implement truthful missing documentation, safeguards, policy surfaces, and input behavior improvements
- [x] Run full validation, refresh the release artifact, and report implemented versus operator/legal pending authority

# Audit-Discovered Corrective Items
- [x] Add a public governance/ownership/terms page distinguishing brand, code, architecture authority, user content, AI output, and third-party rights
- [x] Add open-source/license and AI-output review disclosures grounded in authoritative references
- [x] Make the advertised Ctrl/Cmd+K homepage search shortcut functional and IME-safe
- [x] Add explicit semantic intent-match status without claiming human-like understanding or hidden prediction

# Maximum Achievable Value Review
- [x] Inventory current product, backend, admin, deployment, policy, ownership, payment, and evidence capabilities
- [x] Prioritize highest-value improvements by user impact, evidence, safety, cost, and operator dependency
- [x] Implement the highest-value project-side improvements and transparent upgrade/payment readiness without live charging
- [x] Validate tests, typecheck, accessibility, routes, release integrity, and document maximum achievable versus gated capability

# Maximum-Value Monetization Readiness
- [x] Add a transparent Bengali-first Plans/Upgrade page with Free, Pro, and Enterprise capability boundaries
- [x] Keep checkout provider-gated with visible pricing/terms/support and no live charge until merchant credentials are verified
- [x] Add regression coverage for plan claims, upgrade links, and provider-gated status

# Ownership, Terms, Market and Payment Controls
- [x] Create a non-public DSAI Ownership & Control Register without personal identifiers
- [x] Research comparable AI platforms and document evidence-aware country/branding language without exclusivity claims
- [x] Add explicit AI-operated Controlled Alpha, possible-error, double-check, and human-review acknowledgement to account entry
- [x] Add admin payment-control surface ordered Card, bKash, Nagad, Rocket with all channels disabled by default
- [x] Keep card/wallet credentials and live payment processing out of the current preview
- [x] Add regression coverage, accessibility verification, typecheck, production build, and mobile route screenshots

# Autonomous Modern Engineering Policy
- [x] Maintain secure defaults and provider-gated boundaries while selecting the next highest-value DSAI improvement autonomously
- [x] Prefer measurable evidence, reversible changes, accessibility, Bengali-first UX, and lawful operation over unsupported speed or valuation claims
- [x] Revalidate tests, build, accessibility, release integrity, and operator gates after each autonomous improvement

# Respectful Google Advertising Readiness
- [x] Research Google publisher eligibility, consent, privacy, placement, labeling, and revenue requirements before enabling ads
- [x] Define protected no-ad zones for authentication, workspace, creative work, payment, admin, and high-focus workflows
- [x] Implement disabled-by-default, consent-aware ad readiness with frequency/friction safeguards and a premium ad-free policy
- [x] Validate accessibility, responsive behavior, policy wording, build, and document Google/operator approval gates

# Production Startup Preflight and OAuth Provenance
- [x] Inventory critical DSAI components, dependency boundaries, startup commands, health probes, rollback paths, and failure containment
- [x] Audit Google/HubSpot/Manus OAuth and environment provenance using names/status only, never secret values
- [x] Implement a fail-closed production preflight checklist and clear provider status surface before live startup
- [x] Validate preflight checks, OAuth status wording, tests, build, release integrity, and operator sign-off gates

# Empty-VPS Artifact-First Sequence
- [x] Document and follow the correct order: upload ZIP/wrapper, verify checksum, extract release, bootstrap directories/environment, run preflight, then start service
- [x] Keep preflight and service commands blocked until the release scripts and `/etc/dsai/dsai.env` exist on the VPS
- [x] Provide post-preflight gates for database, systemd/process supervision, Nginx/TLS, health routes, and OAuth callback verification

# First 100 Student Free Pilot Draft
- [x] Audit existing scholarship/auth/terms/quota/student surfaces for pilot compatibility
- [x] Define eligibility, verification, access window, quota, safety, privacy, support, suspension, and appeal rules
- [x] Draft Bengali-first UI copy for the pilot card, application, status, dashboard, consent, and empty/error states
- [x] Review pilot copy for clarity, accessibility, non-deception, privacy, feasibility, and implementation readiness

# DSAI Try First Guest Demo
- [x] Audit public routes, existing AI/demo procedures, rate limiting, telemetry, and conversion links for a no-document visitor flow
- [x] Define safe guest-demo scope, quota, privacy notice, abuse controls, and Bengali-first journey
- [x] Implement a public Try First interface with a bounded text-planning demo and links to login and the student pilot
- [x] Add backend guest-demo handling with session/IP safeguards, no external side effects, and truthful result states
- [x] Add regression/accessibility/security tests and verify responsive preview, typecheck, build, and route behavior
- [x] Save a checkpoint and document what visitors can test before verification and what remains gated

---

# Project TODO

- [x] Basic homepage layout
- [x] Navigation menu
- [x] User authentication system
- [x] Dashboard with analytics
- [x] API integration
- [x] Payment integration
- [x] Admin console
- [x] Scholarship pilot draft
- [x] Production release package
- [ ] Live VPS deployment and provider activation gates

# DSAI 2–3 Image-to-Video Preview
- [x] Audit existing Creative Studio image-to-video contracts, UI, agent registry, media limits, and provider-gated behavior
- [x] Define 2–3 image input rules, motion/duration/aspect controls, rights and safety acknowledgements, and preview-versus-live messaging
- [x] Implement the image-to-video preview planner and update Creative Studio UI and visitor guidance
- [x] Add regression/accessibility tests and verify responsive UX, provider-gated safety, typecheck, build, and route behavior
- [x] Save a checkpoint and document the preview capability and remaining live-rendering gates

# DSAI Corrected Creative Generation Modes
- [x] Correct any partial multi-image implementation so text-to-image means 2–3 variations, not 2–3 source images
- [x] Define one text-to-video output plan and one image-to-video output plan with single-source image input
- [x] Update Creative Studio UI, backend preview contract, Bengali-first copy, and provider-gated status for the corrected three-mode scope
- [x] Add regression/accessibility tests and verify all three modes, typecheck, build, and responsive route behavior
- [x] Save a checkpoint documenting the corrected scope and remaining live provider/rendering gates

# DSAI Final Go-Live Readiness Audit
- [x] Inventory inherited chat requirements and map each major promise to code, preview evidence, documentation, or a gap
- [x] Audit current public preview, routes, frontend-backend contracts, tests, performance, accessibility, auth, privacy, governance, and payment boundaries
- [x] Audit the credential-free release, bootstrap/preflight scripts, environment contract, VPS/Nginx/TLS/database assumptions, rollback path, and provider dependencies
- [x] Cross-check expectation versus achievement and classify each capability as live-ready, preview-ready, operator-gated, roadmap, or blocked
- [x] Implement only evidence-supported final corrections required for a coherent launch surface and release handoff
- [x] Run final validation and produce the definitive Bengali readiness audit and VPS go-live sequence
- [x] Save a final checkpoint and document the honest launch decision

# Final Audit Corrections
- [x] Align the Scholarship page with the authoritative pilot contract by showing the 300/month limit and explicit AI-error/human-review warning

# DSAI VPS Deployment and Domain Repair
- [ ] Confirm GCP project, VM zone/name/user, SSH access, static IP, DNS control, and safe production environment readiness
- [ ] Upload and deploy the refreshed credential-free release with checksum, env validation, database readiness, and process health checks
- [ ] Verify DNS resolution, public IP, TLS certificate, Nginx upstream, SPA history fallback, and public route status
- [ ] Verify OAuth callback allowlisting, final-domain login prerequisites, protected-route behavior, and rollback evidence
- [x] Report verified deployment status and remaining operator gates without overstating live readiness

# DSAI Final Terminal Command Matrix
- [x] Inventory current release ZIP, integrity manifest, deployment scripts, environment names, server-discovered values, and known operator gates
- [x] Define the complete secret-safe local-to-VPS command sequence with placeholders and hidden prompt boundaries
- [x] Refine reusable deployment documentation/helpers for copy-paste execution, fail-closed validation, rollback, and cleanup
- [x] Validate command syntax, archive integrity, environment validation, health routes, and secret exclusion
- [x] Save a checkpoint and deliver the final Bengali command matrix

# Command Matrix Correction
- [x] Align VPS bootstrap prompts and generated environment files with the production template, including CAPTCHA, frontend site key, Forge requirement, and optional public identity values

# VPS-Only Context Reconciliation
- [x] Re-audit inherited VPS deployment context, saved release artifacts, domain data, and prior command handoffs without requesting already-known GCP information
- [x] Map known non-secret values, hidden secret boundaries, server-discovered values, and genuinely unavailable remote access
- [x] Correct the command handoff to be VPS-only and remove any GCP-specific assumptions
- [x] Report the exact known state and only the truly necessary next action

# VPS Root Command Block Correction
- [x] Compose a single folder-aware command block starting from the main VPS SSH host with explicit HOME and cd steps
- [x] Include release upload/locate, directory creation, extraction, checksum, current symlink, bootstrap, validation, deployment, health, and Nginx diagnosis in order
- [x] Validate the corrected command block against the release scripts and update the VPS handoff documentation
- [x] Checkpoint and deliver the corrected VPS-root execution sequence without claiming remote execution

# Final Copy-Paste VPS Command Handoff
- [x] Prepare the exact local pre-upload and VPS pre-deployment command blocks with explicit paths and cd steps
- [x] Prepare hidden-secret bootstrap, validation, deployment, post-deployment, Nginx/TLS/OAuth, rollback, and cleanup commands without exposing secret values
- [x] Validate the final command blocks against the release scripts and deliver the operator handoff

# VPS Extraction-Only Command Block
- [x] Prepare the minimal extraction-only commands with explicit HOME, mkdir, cd, checksum, unzip, release directory, and current symlink
- [x] Validate that extraction commands do not start the application and deliver the copy-paste block

# Final VPS Closure Simplification
- [x] Consolidate the final VPS deployment handoff into one shortest valid path with no repeated information requests
- [x] State the exact remaining operator action and final go/no-go condition for running the project

# VPS Folder Name Reconciliation
- [x] Inspect bootstrap/deploy scripts for authoritative path and symlink names
- [x] Compare script paths with the previously observed `/home/dulal_sarder90/apps/dsai-platform` workspace and define a non-destructive path strategy
- [x] Validate and deliver corrected commands that do not overwrite an existing folder without explicit backup

# Cloud Shell Versus VPS Session Diagnosis
- [x] Add a non-destructive shell identity check that does not exit or close the terminal
- [x] Document the Cloud Shell versus VPS SSH distinction and likely fail-fast stop points
- [x] Prepare a guarded retry sequence that preserves the terminal session until prerequisites pass
- [x] Report the verified session state and whether any project process was actually stopped

# VPS Unzip Failure Diagnosis
- [x] Collect non-destructive unzip error, target folder, disk, permission, and archive-list evidence
- [x] Classify the unzip failure without stopping the legacy application process
- [x] Provide a corrected extraction command and re-check required project files before bootstrap

# Bootstrap Environment Recovery
- [x] Confirm and document that bootstrap wrote nothing because DATABASE_URL was empty
- [x] Explain hidden prompts and prevent prompt labels from being entered as shell commands
- [x] Provide a safe bootstrap recovery sequence and non-secret post-bootstrap verification

# Temporary No-CAPTCHA Controlled Alpha
- [x] Decide whether no-CAPTCHA means private staging only or a public production change
- [x] Preserve production CAPTCHA fail-closed validation and document the boundary

# Final Environment Migration and Deployment Command
- [x] Prepare the final command block that migrates core values from the legacy process without printing secrets
- [x] Include CAPTCHA prompt, production validation, deploy, local health, and preserve-legacy-process safeguards
- [x] Validate and deliver the final command with the exact production go/no-go gate

# Chat Preview Compile vs Runtime Cross-Check
- [x] Cross-check prior compile/build/checkpoint claims against the current VPS transcript
- [x] Classify runtime, environment, database, proxy, OAuth, and public-domain status without overclaiming
- [x] Deliver the definitive Bengali expectation-versus-achievement conclusion and remaining gate

# Private No-CAPTCHA Staging Run
- [x] Define an explicit private Controlled Alpha/staging mode for no-CAPTCHA testing
- [x] Preserve public production fail-closed CAPTCHA enforcement and add access/rollback boundaries
- [x] Validate the staging mode and prepare the VPS run command without stopping the legacy process

# Three-Release Comparative Audit
- [x] Inventory the latest release and two preceding archives, manifests, checkpoints, and source snapshots
- [x] Compare file trees, hashes, deployment scripts, environment templates, paths, routes, and feature changes
- [x] Run integrity, secret-exclusion, syntax, build, and deployment-contract regression checks across the release set
- [x] Deliver the Bengali comparison with improvements, regressions, unresolved gates, and the recommended release

# Latest Five-Release Deep Audit and Correction
- [x] Inventory the latest five release archives, manifests, checkpoints, source snapshots, and VPS evidence
- [x] Compare file trees, hashes, environment contracts, deployment scripts, routes, features, and claims across all five releases
- [x] Trace stale-information, scope, bootstrap, CAPTCHA, path, and compile-versus-runtime causes
- [x] Implement safe evidence-supported corrections and align documentation, commands, tests, and staging boundaries
- [x] Run full validation, regenerate the credential-free release, compare it with predecessors, and verify secret/stale-command exclusions
- [x] Checkpoint and deliver the definitive Bengali audit, correction summary, implementation plan, and remaining VPS gates

# Environment Contract and CAPTCHA Audit
- [x] Inspect the authoritative environment template, setup helper, validator, runtime mapping, and deploy order together
- [x] Trace every environment key from prompt to file write, validation, runtime use, and deployment behavior
- [x] Determine definitively whether CAPTCHA was optional, required, or inconsistently implemented
- [x] Implement consistency corrections with regression coverage and refresh the release

# DSAI Five-Release Environment Contract Audit — 2026-08

- [x] Audit the latest five release handoffs against the VPS environment template, validator, runtime bind policy, and deployment ordering.
- [x] Make Forge provider credentials optional unless `DSAI_REQUIRE_FORGE=1` is explicitly enabled.
- [x] Make the validator read `DSAI_REQUIRE_FORGE` from the environment file and add regression coverage.
- [x] Preserve public-production CAPTCHA fail-closed behavior while allowing no-CAPTCHA only for loopback-bound Controlled Alpha.
- [x] Prevent the validator from treating `VITE_CAPTCHA_SITE_KEY` as a server secret.
- [x] Validate the environment before stopping a previous process in `deploy-genesis.sh`.
- [x] Write `docs/DSAI_ENVIRONMENT_CONTRACT_AUDIT_2026-08.md` with findings, evidence, corrections, and remaining operator gates.
- [x] Refresh the final credential-free VPS ZIP and save a checkpoint for this audit.
- [ ] Execute the remote VPS migration, Nginx/TLS repair, database check, and OAuth verification with operator-provided access/evidence.

# Controlled Alpha and VPS Recovery Runbook

- [x] Define no-CAPTCHA as private loopback-only Controlled Alpha and preserve public-production fail-closed CAPTCHA.
- [x] Document the artifact-first extraction order and block preflight/service assumptions until release files exist.
- [x] Document bootstrap failure recovery, legacy-process preservation, rollback, and public go/no-go gates.
- [x] Add `docs/DSAI_PRIVATE_ALPHA_AND_VPS_RECOVERY_BN.md` for mobile-friendly operator handoff.

# Secure One-Command VPS Deployment Package — 2026-08

- [x] Define the approved secret boundary: no real credentials in ZIP, chat, manifest, or command history; server-side protected injection only.
- [x] Implement a server-side secret injection helper with mode-600 permissions, allowlisted keys, private-alpha/public-production policy, and atomic writes.
- [x] Implement a one-command deployment wrapper that verifies checksum, extracts safely, injects or migrates secrets, validates the environment, preserves the legacy process until validation passes, and starts the release.
- [x] Add regression coverage for secret exclusion, permissions, key allowlisting, command ordering, and fail-closed public CAPTCHA behavior.
- [x] Write the Bengali secure deployment plan and exact copy-paste VPS commands.
- [x] Refresh the credential-free release, validate it, and save a checkpoint.
- [ ] Execute the final command on the remote VPS and verify database, process, Nginx/TLS, DNS, OAuth, and public-route gates with non-secret outputs.

# One-Command Deployment Double-Check — 2026-08

- [x] Audit the self-extracting bundle header, embedded archive, marker extraction, checksum, executable mode, and secret exclusion.
- [x] Trace the one-command flow for existing environment files, legacy PID migration, private Alpha, public production, missing prerequisites, and failure cleanup.
- [x] Verify deployment path safety, release symlink behavior, previous-process preservation, rollback limitations, and process supervision assumptions.
- [x] Verify runtime environment propagation from `/etc/dsai/dsai.env` into `deploy-genesis.sh` and the production Node process.
- [x] Add regression coverage for every verified omission or correct the audit finding as documentation-only when no code change is needed.
- [x] Rebuild and validate the corrected ZIP and one-command bundle, then deliver the double-check findings and exact revised commands.

# Four-Artifact and Command Matrix Audit — 2026-08

- [x] Inventory the four delivered artifacts and classify each as VPS-upload, local-only, or supporting documentation.
- [x] Verify artifact checksums, bundle payload equality, archive integrity, executable modes, and secret exclusions.
- [x] Cross-check every upload, checksum, extraction, environment, and deployment command against its correct execution environment.
- [x] Identify and correct any command that can run in the wrong terminal, assumes missing files, exposes secrets, or skips a required gate.
- [x] Produce the Bengali four-file upload matrix and exact corrected command sequence.

# Protected Environment File Replacement Command — 2026-08

- [x] Verify the migration helper overwrite, backup, allowlist, and validator behavior for replacing `/etc/dsai/dsai.env`.
- [x] Create and test a copy-paste command that backs up the old environment, writes a temporary replacement, validates it, atomically installs it with mode 600, and preserves the old file on failure.
- [x] Deliver the exact Bengali VPS command and explain the required actual legacy PID and public/private CAPTCHA boundary.

# Single-File VPS Deployment Handoff — 2026-08

- [x] Confirm the current self-extracting `.run` artifact and embedded payload checksum.
- [x] Reduce the operator flow to one local upload command and one VPS execution command.
- [x] State the single remaining prerequisite: a protected environment source or actual legacy PID; do not claim remote execution.

# Confirmed Bundle Runtime Fix — 2026-08

- [x] Restore the safe `.env.production.example` template to the credential-free release archive while continuing to exclude real `.env` and secret files.
- [x] Add regression coverage proving the extracted bundle contains `.env.production.example` and no real secret environment file.
- [x] Rebuild and re-upload the corrected one-command `.run` file after full extraction and runtime preflight validation.
- [x] Report that the prior bundle reached checksum/extraction but failed at the missing safe template, and provide the corrected command without shell-backgrounding syntax.

# Nginx Reverse Proxy and TLS Handoff — 2026-08

- [x] Define the safe Nginx upstream for DSAI on loopback port 3011 and preserve a configuration backup.
- [x] Provide commands for Nginx installation, SPA history fallback, HTTP validation, Certbot TLS, HTTPS redirect, and renewal checks.
- [x] Provide DNS, firewall, local upstream, public-domain, `/auth/login`, and rollback diagnostics without claiming remote execution.

# Systemd Background Service Handoff — 2026-08

- [x] Define a systemd unit for DSAI using `/home/dulal_sarder90/dsai/current`, `/etc/dsai/dsai.env`, and port 3011.
- [x] Safely hand off from the current nohup process without killing an unrelated PID.
- [x] Enable restart-on-failure and boot startup, then provide status, journal, and health verification commands.

# VPS Firewall and Baseline Security Handoff — 2026-08

- [x] Reconcile the attached VPS state: DSAI local port 3011, Nginx intended public ports 80/443, and SSH access preservation.
- [x] Provide UFW rules, application-port privacy, unattended security updates, SSH hardening safeguards, and verification commands.
- [x] Provide non-destructive rollback and lockout-recovery checks without claiming remote execution.

# Comprehensive Production Audit — 2026-08

- [x] Consolidate project evolution, implemented capabilities, current operation, disabled/gated features, and production-readiness findings into a definitive Bengali audit report.
- [x] Include current validation evidence: 39 test files, 118 tests, TypeScript, production build, accessibility contract, bundle warning, and remote VPS evidence boundaries.
- [x] Deliver a prioritized production roadmap separating immediate closure, controlled-alpha operation, provider activation, and public high-risk launch gates.

# Full Production and Media Activation Re-Audit — 2026-08

- [x] Reconcile all environment evidence currently available in project files and user-provided terminal transcripts without treating masked values as recoverable secrets.
- [x] Re-check the comprehensive audit against the latest VPS local deployment evidence and identify any stale or overstated claims.
- [x] Assess the complete audio/video/image activation path: provider adapters, storage, moderation, quotas, workers, retries, provenance, deletion, and external credentials.
- [x] Implement feasible project-side production controls and media-readiness improvements without fabricating provider execution or embedding secrets.
- [x] Run the full validation suite and update the comprehensive audit with the revised status and exact external gates.
