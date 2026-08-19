# DSAI Alpha Notifications, Voice Feedback, and History Export

## Implemented release

Alpha Dashboard now polls the user-scoped notification feed every ten seconds and shows unread/read state for verified referral-status changes and reward grants. Notification rows are created in the same transaction as an operator-controlled status or reward update, so the UI does not invent transitions or balances. The feed uses display-safe titles and bodies, never exposes another user’s email or private records, and supports explicit read acknowledgement.

The onboarding guide now includes a small visual voice orb with `idle`, `listening`, `thinking` and `answered` states. Listening state is synchronized with browser speech input; provider response state is synchronized with the protected AI guide mutation. The orb is decorative, has a text label for assistive technologies, and becomes static under `prefers-reduced-motion`.

Alpha users can export their own contribution, referral and reward history as CSV. The PDF action opens the browser print dialog with a print-specific layout; no extra server-side PDF copy is created. Export text clearly states that the dataset is user-owned and that payout balances require operator verification.

The reusable `dsai-launch-workdesk` skill now includes notification transaction patterns, polling freshness labels, voice-state animation rules, reduced-motion guidance and CSV/print-to-PDF privacy boundaries.

## Verification

Migration `0009_polite_christian_walker.sql` adds the notification table and indexes without destructive operations. The release passed 52 Vitest tests, TypeScript no-emit, production build, deployment shell/Node syntax checks, reusable skill validation and 390×844 mobile verification for Alpha Dashboard and Platform. The existing Vite shared-entry chunk warning remains advisory and non-blocking.

## Remaining operator gates

Referral status changes and reward grants require an authenticated admin/operator procedure. No referral or reward records are seeded. A production payout system still needs attribution, disclosure, fraud/reversal handling, payment provider, applicable tax/KYC/KYB review and terms. Browser speech recognition availability varies by browser and requires user permission. PDF export uses the user’s local print dialog rather than a server PDF renderer.
