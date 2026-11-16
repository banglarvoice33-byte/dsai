# Free-only AI provider routing

DSAI never enables a provider merely because a credential exists.

## Provider gates

- OpenRouter is pinned to `openrouter/free` and has a DSAI-wide sliding-window guard.
- Gemini is pinned to `gemini-3.8-flash`, with a DSAI-wide guard of 5 requests/minute and 50 requests/24 hours. It remains disabled in Free-only mode unless `AI_GEMINI_FREE_QUOTA_CONFIRMED=true` is set after an operator verifies the Google AI Studio project is on the Free usage tier and has no linked paid billing account. Even then, each user request must separately opt in through the Workspace disclosure checkbox.
- Cloudflare Workers AI is pinned to the exact allowlisted model `@cf/zai-org/glm-4.7-flash`, with a DSAI-wide guard of 5 requests/minute and 20 requests/24 hours. It remains disabled unless `AI_CLOUDFLARE_FREE_QUOTA_CONFIRMED=true` is set after the account's billing boundary is verified.
- A generic `@cf/*` model prefix is not considered a free-tier guarantee. New models require an explicit code review and allowlist entry.
- Paid-provider routes and paid fallbacks remain blocked while `AI_FREE_ONLY_MODE=true`.

## Privacy and free-tier terms

Google's Gemini API Free tier may use submitted content to improve Google products. DSAI therefore requires both an operator-level no-billing gate and an explicit per-request user opt-in. The Workspace checkbox explains this before the prompt is sent. Users should not submit confidential or sensitive content to the Gemini Free route. The DSAI-wide quota is a safety ceiling, not proof of Google's account-specific quota.

Official references:
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/rate-limits
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/changelog/post/2026-07-28-models-require-workers-paid/
