# User-installable WorkDesk connectors

## Supported connectors and execution boundary

- **OpenRouter:** credential validation, owner-scoped encrypted storage and Work Desk execution through the `openrouter/free` route. Free-model availability and account rate limits are controlled by OpenRouter and can change; DSAI does not guarantee provider uptime or quota.
- **Gemini:** credential validation, owner-scoped encrypted storage and personal BYOK Work Desk execution. Each generation and retry requires explicit user consent because usage is sent to the user's Google AI Studio project. The user's project quota and billing settings apply; DSAI does not pay or guarantee that the project remains on a free tier.
- **OpenAI and xAI:** credential validation and secure storage only. These paid API providers are not enabled for the current Free-only Work Desk execution route.

Credential validation uses provider metadata/list endpoints only. It does not submit prompts or generate content.

## Platform-owned provider adapters

Cloudflare Workers AI has a server-side provider adapter with an exact model allowlist, but its Free-only fallback remains disabled until an operator verifies the account's Free allocation, billing boundary, account ID and token configuration. It is not currently a user-installable connector and must not be shown as a connected user-owned account.

## Encryption key

Set `DSAI_CONNECTOR_ENCRYPTION_KEY` to a randomly generated 32-byte key encoded as 64 hexadecimal characters in both Vercel Preview and Production. Keep the values separate between environments. Do not commit the value, add it to client-side variables, or print it in logs.

Example generation command (run in a trusted local terminal):

```bash
openssl rand -hex 32
```

The key is required to encrypt new credentials and decrypt saved credentials. Back it up in an owner-controlled password manager. Rotating it requires a controlled re-encryption migration; replacing it directly makes existing connector secrets unreadable.

## User flow

1. User opens WorkDesk → Marketplace → Connectors.
2. User creates an API key at the provider's official key-management page.
3. DSAI tests the key against a fixed provider metadata endpoint.
4. On success, DSAI stores an AES-256-GCM encrypted payload in `private.user_connector_credentials`.
5. The browser receives only provider metadata, a four-character hint, and status.
6. The Work Desk composer can explicitly select the user's OpenRouter or Gemini connector. The worker decrypts it server-side; OpenRouter is pinned to `openrouter/free`, while Gemini uses the server-controlled Gemini model allowlist and requires explicit per-request billing consent.
7. Test and disconnect actions are owner-scoped. Disconnect deletes the stored credential row.

## Security boundaries

- No arbitrary endpoint URLs; all provider URLs are fixed in server code.
- Provider tests use GET metadata endpoints, an 8-second timeout, and reject redirects.
- Raw keys and provider response bodies are never returned or logged.
- RLS is forced and browser roles have no privileges on the credential table.
- The API key is write-only from the UI; it is not re-displayed after connect.
- Free-tier availability and provider quotas are not guaranteed by DSAI. The UI distinguishes Free route from account-dependent and paid APIs.
- A Gemini request that may have reached Google but has an unknown outcome is not automatically retried; a manual retry requires renewed consent and may incur another charge.

## Cloudflare Workers AI free-tier verification (2026-11-24)

- The connected Cloudflare account is reachable through the account and Workers AI model-catalog read APIs.
- The Cloudflare model catalogue returns `@cf/zai-org/glm-4.7-flash`; the official Workers AI pricing page states a 10,000-Neuron daily free allocation and that this model remains available on Workers Free. Usage above the daily allocation on Workers Paid is billed at the published per-Neuron rate. See https://developers.cloudflare.com/workers-ai/platform/pricing/ and https://developers.cloudflare.com/changelog/post/2026-07-28-models-require-workers-paid/.
- The connected API session can read AI Gateway prepaid credit balance: `0`; the account also has a default payment method on file. A zero AI Gateway credit balance is not proof that Workers AI usage cannot be billed.
- Reading the account subscription endpoint returns HTTP 403 because this connection lacks the accepted `billing:read` scope. The Workers plan and remaining daily Neuron allocation are therefore not independently verified from the API.
- Cloudflare's official pricing documentation (updated 2026-11-18) states that Workers Free includes 10,000 Neurons per day at no charge and requests fail after the allocation is exhausted; Workers Paid includes the same daily allocation but bills usage above it at $0.011 per 1,000 Neurons. The official model catalogue includes `@cf/zai-org/glm-4.7-flash` among models available on Workers Free. See https://developers.cloudflare.com/workers-ai/platform/pricing/ and https://developers.cloudflare.com/changelog/post/2026-07-28-models-require-workers-paid/.
- Keep `AI_CLOUDFLARE_FREE_QUOTA_CONFIRMED` unset/false, do not issue a live inference request from the production account, and do not count Cloudflare as an enabled Work Desk connector until the operator confirms the account's Workers Free plan and quota boundary. No paid plan change is requested or authorized.
- This is an account-permission/plan-verification gap, not a missing Cloudflare connection. Grant only the read-only Billing Read scope if API verification is needed; never grant Billing Write for this check.
