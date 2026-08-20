# DSAI Media Provider Research Notes — 2026-08

## Official evidence

OpenAI's official Sora video guide states that video generation is asynchronous: create a job, receive an ID and status, poll the job or receive a webhook, and fetch the final MP4 only after completion. This confirms that DSAI live video needs a durable job state machine, polling/webhook handling, signed callback verification, retries, idempotency, cost/quota control, storage, and deletion—not a synchronous request-only implementation.

Source: https://developers.openai.com/api/docs/guides/video-generation

Google's official Gemini video documentation describes Veo 3.1 as video generation with native audio and image-based direction, with asynchronous generation through the Gemini API workflow. This supports a provider adapter for text-to-video and image-to-video with audio-capable output, but it does not remove the need for credentials, billing/quota, regional availability, safety policy, storage, moderation, and operational controls.

Source: https://ai.google.dev/gemini-api/docs/video

OpenAI's current API reference search result also displayed a deprecation notice for the Videos API on September 24, 2026. Provider lifecycle must therefore be monitored and the implementation must not hard-code one provider as the only production path.

Source: https://developers.openai.com/api/reference/resources/videos/methods/create

## Architecture implication

The current DSAI Creative Studio planner is correctly provider-gated. The next live-media stage requires a typed adapter interface, durable `media_jobs` state, source-asset authorization, moderation verdict, signed provider callback or bounded polling, retry/dead-letter behavior, quota/cost ledger, object-storage output, provenance, deletion propagation, and human-review/export states. Audio/TTS requires an analogous job/output path and a provider-specific voice/consent policy.
