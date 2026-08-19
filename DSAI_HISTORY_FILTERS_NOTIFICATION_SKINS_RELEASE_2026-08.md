# DSAI History Filters, Notification Controls, and Avatar Skins

## Implemented

Alpha Dashboard now lets users filter their own export dataset by record type and status, then sort it by newest, oldest or points before downloading. The selected-record count is visible, and CSV export is disabled when no matching records exist. The PDF action remains browser print-to-PDF and uses the same filtered dashboard context without creating a second server-side copy.

Notifications now support category filtering across `all`, `referral`, `reward` and `system`. Users can acknowledge a single notification or use an idempotent user-scoped “সবগুলো read করুন” action. Bulk acknowledgement cannot mutate another user’s rows.

The onboarding voice orb now maps the current verified onboarding step to named decorative skins: `seedling`, `signal`, `orbit`, `proof` and `return`. These skins communicate progress context, not rank, reward eligibility or business value. Listening, thinking and answered states remain independent from the skin, and reduced-motion users receive a static alternative.

The reusable `dsai-launch-workdesk` skill now documents filter/sort contracts, category notifications, bulk-read privacy rules and progress-based decorative avatar patterns.

## Verification and limitations

The release passed 52 Vitest tests, TypeScript no-emit, production build, shell/Node deployment syntax checks, reusable skill validation and 390×844 mobile verification. The previous hook-order crash caused by conditional-path `useMemo` was fixed by using deterministic local computation before the authenticated early-return paths; the Alpha Dashboard and Platform now render successfully in the mobile capture. The existing shared Vite chunk-size warning remains advisory and non-blocking.

All exports remain user-owned and privacy-scoped. Referral and reward truth remains operator-controlled; no synthetic history, payout balance or leaderboard score is generated. Browser print-to-PDF depends on the user’s local print dialog, and notification freshness uses polling rather than a WebSocket service.
