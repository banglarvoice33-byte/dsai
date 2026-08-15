# DSAI Discovery Layer Verification — 2026-08-15

The public DSAI homepage was checked after the Learn-layer implementation at the managed desktop preview and a 390×844 mobile viewport. Desktop navigation exposes the new “শিখুন” anchor beside the existing pathway and trust navigation. The full-page mobile capture shows the Learn section between the introductory narrative and workflow cards, with four readable answer cards: what to do first, how DSAI helps, why choose DSAI, and what is not yet available.

The same capture includes the existing FAQ, final contact route, and the explicit statement that official social channels are not published yet. The new cards stack into one column without observed horizontal overflow, and the existing Bengali-first hierarchy remains intact. The implementation does not fabricate any social profile URLs or unavailable product capabilities.

The build and test suite passed after this change. A bundle-size warning remains a non-blocking performance follow-up. Final-domain crawling, Search Console/Bing verification, OAI-SearchBot behavior through any WAF/CDN, and social-account ownership still require operator verification.


An explicit 1280×720 full-page capture was also taken after the Learn changes. It shows the new DSAI শিখুন heading and four answer cards between the introductory section and the two workflow cards, while preserving the hero, trust, FAQ, CTA, and footer hierarchy. The desktop layout keeps the answer cards in a readable two-column grid; the prior 390×844 capture confirms one-column stacking.
