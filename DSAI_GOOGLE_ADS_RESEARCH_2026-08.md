# DSAI Google Advertising Readiness Research

**Date:** 2026-08-20

## Decision summary

DSAI should treat Google advertising as an optional, disabled-by-default publisher feature for public, low-focus pages only. Authenticated workspace, private communication, creative production, payment, admin, OAuth, and high-risk action surfaces remain permanent no-ad zones. Pro and Enterprise should be offered an ad-free experience as a product-quality policy, not as a deceptive pressure mechanism.

Google AdSense requires publishers to follow publisher and program policies, and Google may limit or disable ad serving for violations [1]. Eligibility includes having original, high-quality content, access to the submitted site's HTML, policy compliance, and an applicant who meets the age requirement [2]. Revenue is not guaranteed and depends on demand, user location, device, content vertical, seasonality, and format [3].

Google's placement guidance prohibits encouraging clicks, unnatural attention, misleading labels, designs that resemble navigation, compensation for clicks, pop-ups/pop-unders, automatic refresh, and ads in private communications [4]. DSAI therefore must never place ads beside action buttons, search results, chat, workspace controls, payment controls, or any UI where an ad could be mistaken for a product action.

For users in the European Economic Area, the United Kingdom, and Switzerland, Google's consent policy requires legally valid consent where applicable for cookies/local storage and personalized-ad data use, consent records, revocation instructions, party disclosures, and prominent privacy information [5]. A consent-aware ad adapter is required before any personalized ads are served. Non-personalized ads still require a careful legal/privacy review.

## DSAI placement policy

| Surface | Ads | Reason |
|---|---:|---|
| Public educational pages, Method, Learn, public Changelog | Optional, one clearly labeled unit after primary content | Lower workflow friction; content remains primary |
| Homepage hero and primary CTA | No | Protects first impression and prevents accidental clicks |
| Search overlay/results | No | Prevents ads being mistaken for discovery results |
| Auth/login/OAuth/CAPTCHA | No | Sensitive identity and security flow |
| Workspace, AI chat, private messages, uploads, creative work | No | Private communication and focused work |
| Plans, checkout, payment, billing | No | Prevents confusion and commercial pressure |
| Admin, trace, quality, compliance, deletion, connector controls | No | Operational and privacy-sensitive surfaces |
| Pro/Enterprise authenticated experience | No | Premium ad-free policy |

## Safe implementation rules

The first implementation should be an ad-readiness layer, not live ad code. It should have an environment flag disabled by default, a route allowlist, a consent state, a visible “Advertisement” label if enabled, no pop-ups, no auto-refresh, no click incentives, no ad loading in protected zones, and a kill switch. It must not accept publisher IDs from public query parameters. A future provider adapter must be reviewed against the current Google policies before enabling production traffic.

## References

[1]: https://support.google.com/adsense/answer/48182?hl=en "Google AdSense Program policies"
[2]: https://support.google.com/adsense/answer/9724?hl=en "Google AdSense eligibility requirements"
[3]: https://adsense.google.com/start/ "Google AdSense overview"
[4]: https://support.google.com/adsense/answer/1346295?hl=en "Google AdSense ad placement policies"
[5]: https://www.google.com/about/company/user-consent-policy/ "Google EU user consent policy"
