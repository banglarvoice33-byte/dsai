# DSAI Privacy Policy and Dynamic Changelog Operations

## What was implemented

DSAI now has a public `/privacy` page describing the current product data flows, OAuth/session data, waitlist and workflow records, API-key safety, provider boundaries, retention limitations, deletion requests, analytics configuration, sensitive-data warnings and contact route. The page is a product disclosure, not jurisdiction-specific legal advice; the operator must have counsel adapt it for the countries and sectors served before commercial launch.

DSAI also has a public `/changelog` page. It reads only entries whose status is `published`; drafts never appear in the public query. Each release note contains a version, title, summary, content, category, published date and update timestamps.

The protected `/admin/changelog` page is available only to an authenticated user whose role is `admin`. An admin can create a draft and switch its status between `draft` and `published`. The form validates length and category values, and the UI warns operators not to enter secrets, customer data or unverified claims.

## Database and migration

The `changelog_entries` table is defined in `drizzle/schema.ts` and migrated in `drizzle/0002_sour_firestar.sql`. The migration is non-destructive and does not seed fake release notes or customer content. Back up production databases before applying future schema changes.

## Publishing procedure

An operator should publish only a verified product change. The release note should state what changed, who it affects, what remains gated, and the date/version. The operator signs in, opens `/admin/changelog`, creates a draft, checks it against the public UI and tests, and publishes it. If the release is superseded or inaccurate, it can be moved back to draft. Do not include API keys, access tokens, personal documents, customer names without consent, fabricated testimonials, or unsupported performance claims.

## Privacy operations still required before broad commercial launch

The current product discloses that a self-service export, automated deletion job and fully specified retention schedule are not yet complete. Before serving regulated or high-volume customers, the operator should define retention by record type, implement deletion/export workflows, create a verified request log, publish a data-subprocessor list, define incident response and breach notification procedures, add jurisdictional legal review, and test access controls with staging data. Do not market the current page as a complete legal compliance certification.

## Verification

The release includes public and admin contract tests. The public routes should return HTTP 200, the unauthenticated admin changelog route should not reveal the management interface data, and regular users must receive a forbidden response from changelog create/publish procedures. The production build and database migration should be run in staging before production rollout.
