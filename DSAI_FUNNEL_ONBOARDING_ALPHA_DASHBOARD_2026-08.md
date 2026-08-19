# DSAI Funnel Interaction, Onboarding ও Alpha Dashboard Release

## Implemented experience

The public Platform funnel now includes a DOM-first Try/Prove Lab. Users can select any of the five launch steps, see real-time progress, hover or focus cards for spatial feedback, and trigger a reduced-motion-safe success state. The success message intentionally describes a local review signal rather than claiming an external submission, payout, or provider action.

A reusable Bengali onboarding assistant now explains Learn → See → Try → Prove → Return. It has five selectable steps, an accessible progress indicator, local fallback guidance, `aria-live` status, a question field and a protected server-side AI guide procedure. The server prompt constrains the assistant to the current step, prohibits secret collection and requires human review for external actions. If the provider is unavailable, the curated Bengali answer remains available.

The authenticated Workspace now exposes the guide and an Alpha dashboard route at `/alpha`. The dashboard uses real user-scoped Work Packet, Access and Creative records for personal counts and approved-packet signals. Referral readiness and community-pilot status are explicitly labelled as gated or pending because the current schema does not contain a verified attribution, payout or pilot-membership record. No fabricated progress is shown.

## Truth and data boundaries

Referral balances, contribution-margin numbers and community status are not invented. The dashboard presents program readiness, operator enrollment and user-owned work metrics separately. A future live referral system must add attribution, disclosure, refund/chargeback adjustment, abuse review, payout holds and payment/KYC/KYB gates before showing payable balances.

The onboarding AI does not persist private transcripts and does not receive provider secrets or private files. It is a guide, not an autonomous action agent. All core Workdesk tasks remain DOM-first and human-gated.

## Validation

The release passed 52 Vitest tests across 17 files, TypeScript no-emit, production build, deployment shell/Node syntax checks and 390×844 visual verification for Platform, Alpha Dashboard and Workspace. The existing Vite shared-entry chunk warning remains advisory and non-blocking. The reusable skill package `dsai-launch-workdesk` passed the skill validator.

## Operator gates

Live model availability, OAuth, HTTPS, database readiness, real malware scanning, provider-side deletion, payments, referral payouts, community enrollment, consented analytics and incident response still require operator configuration and staging evidence. These are deliberately visible gates rather than hidden assumptions.
