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

# Bengali-First Mobile App Experience

- [x] Define the mobile onboarding promise around making AI easier without overstating capability.
- [x] Inspect the active project and determine whether to extend the existing PWA or use available Expo mobile scaffolding.
- [x] Implement the mobile-first onboarding and first-action experience with clear feedback and no dead ends.
- [x] Verify mobile accessibility, responsive behavior, offline/readiness states, tests, and delivery checkpoint.

# World-Class AI Product Gap Audit

- [x] Audit current DSAI public journey, mobile app surface, workspace, auth, safety, privacy, developer, admin, PWA, and deployment surfaces.
- [x] Research public product patterns from leading AI platforms and authoritative accessibility/performance guidance.
- [x] Build a gap matrix covering missing user expectations, incomplete capabilities, risks, effort, and first-version priority.
- [x] Implement the highest-confidence improvements that fit the current architecture without fabricating social proof or capability claims.
- [x] Verify tests, typecheck, production build, public/protected boundaries, responsive/mobile behavior, and release documentation.

# DSAI Differentiation and 10x Category Strategy

- [x] Audit DSAI’s current category, strengths, constraints, and defensible assets.
- [x] Research current AI market wedges, competitor patterns, and underserved Bengali/diaspora workflow opportunities.
- [x] Design a focused category, moat, frontend/backend capability roadmap, and measurable 10x plan.
- [x] Implement the safest high-value differentiation layer without fabricated claims or unverified integrations.
- [x] Verify product, backend, mobile, privacy, performance, and release boundaries; document the roadmap and evidence.

# DSAI Differentiation Implementation

- [x] Add a visible workspace review contract covering scope, human review, and no-auto-submit boundaries.
- [x] Add regression coverage for the trust-ledger surface.
- [x] Run 52 Vitest tests, TypeScript, responsive screenshots, and production build successfully; retain the documented non-blocking shared chunk warning.
- [x] Write the evidence-based DSAI differentiation strategy and 10× roadmap with references.

# DSAI Seven-Layer Premium Expansion and Frontend Direction

- [x] Audit the current DSAI service, frontend, backend, privacy, trust, and operator surfaces for seven additional high-value capability layers.
- [x] Research 3D, editorial, spatial, and hybrid AI-product frontend patterns with production performance and accessibility constraints.
- [x] Define the seven-layer architecture, moat, implementation order, and measurable acceptance criteria.
- [x] Implement the highest-value production-safe improvements without fabricated integrations or claims.
- [x] Verify responsive UX, accessibility, performance, tests, backend boundaries, and release documentation.
- [x] Deliver the Bengali research report and save a recoverable checkpoint.

# DSAI Originality Proof and World-Class Quality Research

- [x] Audit DSAI’s current visual identity, UX system, and defensible product signals for originality and category distinction.
- [x] Cross-check multiple global AI products and authoritative design, accessibility, trust, and performance guidance.
- [x] Define a proof-based originality standard and identify the next defensible quality layer beyond the current seven-layer architecture.
- [x] Implement the highest-confidence design and product-quality improvements without unverifiable claims.
- [x] Run comparative visual, accessibility, performance, and regression verification.
- [x] Deliver the Bengali research report and save a recoverable checkpoint.

# DSAI Secure Intake, Provenance, Audit Events, and 3D Safety Review

- [x] Audit existing storage, schema, workspace, privacy, deletion, admin, deployment, and preview boundaries for the next production layer.
- [x] Research secure upload, malware scanning, retention, provenance, auditability, and 3D accessibility/performance constraints.
- [x] Design migration-safe contracts for secure intake, Work Packet sources/evidence, and approval audit events.
- [x] Implement the secure intake, Work Packet provenance, evidence fields, and approval audit-event foundation.
- [x] Add a safe 3D fallback policy and resolve missed preview, privacy, admin, and recovery requirements.
- [x] Run migrations, tests, build, security boundaries, responsive verification, and release audit.
- [x] Deliver the Bengali implementation report and save a recoverable checkpoint.

# DSAI World-Class Market Position and AI Architecture Plan

- [x] Audit DSAI’s current product, architecture, market position, launch evidence, and competitive proof.
- [x] Research global AI architecture patterns, Bengali market opportunities, trust, governance, distribution, and monetization readiness.
- [x] Define DSAI’s category, moat, AI roles, operating model, and measurable 12-month execution plan.
- [x] Implement the highest-confidence market-position and architecture surfaces in the product without unverifiable claims.
- [x] Verify product, backend, privacy, governance, performance, mobile, and release boundaries.
- [x] Deliver the Bengali strategic implementation report and save a recoverable checkpoint.

# DSAI Venture-Grade Billion-Dollar Standard

- [x] Audit DSAI’s current product, architecture, evidence, economics, and operational readiness against venture-grade requirements.
- [x] Research billion-dollar AI company patterns, infrastructure economics, governance, distribution, and defensibility.
- [x] Define DSAI’s venture-grade quality stack, architecture standards, business model, and milestone gates.
- [x] Implement the highest-confidence venture-grade product and operator surfaces without unverifiable claims.
- [x] Verify technical quality, security, privacy, performance, unit economics, and launch boundaries.
- [x] Deliver the Bengali venture-grade plan and implementation report and save a recoverable checkpoint.

# DSAI Progress Assessment and Next Quality Layer

- [x] Build a current-versus-target evidence matrix across DSAI product, architecture, security, UX, governance, economics, and operations.
- [x] Research multiple authoritative and leading-product sources for remaining high-leverage quality opportunities.
- [x] Prioritize a feasible next-layer plan with measurable acceptance criteria and operator-owned gates.
- [x] Implement the selected high-value product and architecture improvements without unverifiable claims.
- [x] Verify functionality, regression boundaries, performance, accessibility, mobile behavior, and truthful claims.
- [x] Deliver the Bengali progress assessment and implementation report and save a recoverable checkpoint.

# DSAI Final Output Release Consolidation

- [x] Audit the complete DSAI release against all requested capabilities and known operator gates.
- [x] Consolidate final product, trust, privacy, security, accessibility, economics, and deployment requirements.
- [x] Implement remaining high-confidence final-release improvements and documentation without unverifiable claims.
- [x] Run final tests, build, responsive, accessibility, security-boundary, and deployment verification.
- [x] Deliver the final release handoff and save a recoverable checkpoint.

# DSAI Controlled Launch Promotion System

- [x] Audit launch readiness, brand positioning, product proof, legal/privacy, analytics, support, and promotion surfaces.
- [x] Research trustworthy AI launch patterns, Bengali audience distribution, content, community, and referral programs.
- [x] Define the launch narrative, campaign funnel, asset plan, metrics, risk controls, and 30/60/90-day calendar.
- [x] Implement launch-ready product surfaces, public campaign messaging, measurement contracts, and operator documentation without fake claims or data.
- [x] Verify launch UX, mobile, accessibility, analytics boundaries, truthful claims, and deployment readiness.
- [x] Deliver the Bengali launch playbook and save a recoverable checkpoint.

# DSAI Funnel Interaction, Alpha Dashboard, and Reusable Skill

- [x] Audit current funnel, Workspace, auth, analytics, referral, community, and existing skill context.
- [x] Define safe interaction, onboarding, dashboard, data-consent, and reusable-skill contracts.
- [x] Implement Try/Prove progress feedback, onboarding guide, alpha dashboard, and regression coverage.
- [x] Create and validate the reusable Manus skill with workflow references and templates.
- [x] Run tests, typecheck, build, responsive/accessibility verification, and deployment checks.
- [x] Deliver the implementation, skill attachment, operator limitations, and recoverable checkpoint.

# DSAI Alpha Rewards, Voice Onboarding, and Profile Settings

- [x] Audit existing alpha dashboard, schema, user settings, theme, onboarding AI, and reusable skill package.
- [x] Define verified leaderboard/reward, voice privacy, dynamic response, theme, profile, and reusable-skill contracts.
- [x] Implement schema-safe alpha metrics, voice onboarding, profile settings, dark mode, and regression coverage.
- [x] Update and validate the reusable DSAI launch-workdesk skill with the new patterns.
- [x] Run migrations, tests, typecheck, build, responsive/accessibility, privacy, and deployment verification.
- [x] Deliver the updated product, skill attachment, operator limitations, and recoverable checkpoint.

# DSAI Reward Notifications, Voice Feedback, and History Export

- [x] Audit existing alpha ledger, notification primitives, onboarding voice state, export helpers, and reusable skill package.
- [x] Define verified notification, voice-feedback, export, privacy, and reusable-skill contracts.
- [x] Implement notification queries/events, synchronized onboarding animation, CSV/PDF exports, and regression coverage.
- [x] Update and validate the reusable DSAI launch-workdesk skill with notification and export patterns.
- [x] Run migrations, tests, build, responsive/accessibility, privacy, export, and deployment verification.
- [x] Deliver the updated product, skill attachment, operator limitations, and recoverable checkpoint.

# DSAI History Filters, Notification Controls, and Avatar Skins

- [x] Audit current alpha history export, notification panel, voice avatar states, and reusable skill guidance.
- [x] Define user-owned filter/sort, bulk-read, category, avatar-skin, accessibility, and skill contracts.
- [x] Implement export controls, notification filters, mark-all-read, progress skin selection, and tests.
- [x] Update and validate the reusable DSAI launch-workdesk skill with filtering and avatar patterns.
- [x] Run tests, build, responsive/accessibility, privacy, export, and deployment verification.
- [x] Deliver the updated product, skill attachment, operator limitations, and recoverable checkpoint.

# DSAI Read-All Feedback and Progress Sharing

- [x] Audit current notification acknowledgement, alpha progress/skin data, sharing support, and reusable skill guidance.
- [x] Define accessible micro-interaction, sound consent, Web Share fallback, privacy, and reusable-skill contracts.
- [x] Implement read-all feedback, optional sound, social sharing, and regression coverage.
- [x] Update and validate the reusable DSAI launch-workdesk skill with interaction and sharing patterns.
- [x] Run tests, build, responsive/accessibility, privacy, sharing, and deployment verification.
- [ ] Deliver the updated product, skill attachment, operator limitations, and recoverable checkpoint.
