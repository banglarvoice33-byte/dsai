# DSAI Feature Route Check — 2026-08-31

## Browser-verified

The DSAI homepage loaded from the current preview without a visible runtime error. It exposed bilingual navigation, the Access and Creative Studio paths, the multilingual lead composer CTA, the search input, login entry point, and truthful notices that live image/video generation, external messaging, calendar booking, billing, OCR upload, and automatic high-risk submission remain gated or roadmap.

The `/creative-studio` route loaded successfully. It displayed the provider-gated, preview-first, human-gated status, the Text → 2–3 Images, Text → 1 Video, and Image → 1 Video modes, the creative brief textarea, variation selector, rights declaration, safety/human-review declaration, and the Alokrekha agent plan. The page explicitly labels provider rendering, storage, quota, and export as gated rather than pretending they are live.

## Not yet browser-verified

Lead composer, authenticated dashboard actions, actual AI provider execution, Excel download, remote OAuth click-through, and Android WebView rendering still require either a controlled authenticated session, provider availability, a physical/emulated Android device, or remote operator evidence. No success claim is made for those boundaries.

The `/lead-composer` route loaded successfully. It displayed the any-language brief field, source-language input, market search, region filter, a 40 / 40 market catalog, target country/language, audience, industry, business stage, lead goal, working region, value proposition, tone, channel, draft-only consent checkbox, localized draft action, Excel export action, live preview panel, opt-out line, human-review notice, and no-automatic-send boundary. The route is visibly functional at the form/preview contract level; authenticated AI execution, actual download, and provider quality remain unverified in this browser session.

A non-sensitive Bengali brief was entered into `/lead-composer` with Bangladesh/Bengali target context, audience, working region, and value proposition. The route produced a visible live preview containing the localized context, greeting, brief text, next step, opt-out language, editable-draft warning, human-review boundary, and Excel export control. No outbound message was sent.

The public `/health` endpoint returned machine-readable `{"status":"ok","service":"dsai","uptimeSeconds":...}`. The `/admin` route did not expose privileged content while unauthenticated; it presented a Bengali identity-confirmation screen and a sign-in link with a return path. These results verify liveness and the visible admin auth boundary, but not privileged admin actions.

When the Studio preview action was invoked with a non-sensitive brief and both safety declarations, the app redirected to the Manus Login flow before running the protected operation. The redirect preserved the app ID, callback route, encoded return path, and one-time OAuth nonce state. This confirms the action is auth-gated; provider execution was not attempted without authentication.
