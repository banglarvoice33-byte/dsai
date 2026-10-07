# DSAI Koyeb Free-Tier + Gemini/OpenRouter/Groq Deployment Plan

**Date:** 2026-10-08  
**Scope:** Deploy the existing DSAI React/Vite + Express/tRPC + Drizzle/MySQL application without Google Cloud Run, using a controlled-alpha free-tier path.

## Executive decision

The safest low-change architecture is:

```text
GitHub: dulalsarder90-hash/DsAi_MANUS
        │
        ▼
Koyeb Free Web Service — current Dockerfile
        │
        ├── Express + tRPC backend
        ├── compiled Vite frontend
        └── /health and /readyz
                │
                ▼
Aiven Free MySQL — current Drizzle/mysql2 contract

AI providers — server-side only
        ├── Gemini Developer API
        ├── OpenRouter free-model router
        └── Groq API
```

Deploying the **whole current container to Koyeb** is preferable to splitting frontend to Vercel immediately. The existing browser client calls `/api/trpc`; same-origin hosting avoids an early CORS, cookie, OAuth callback, and API-base-url migration.

This is a **Controlled Alpha / free-tier pilot**, not a high-availability production service. Koyeb Free provides one web service per organization, 512 MB RAM, 0.1 vCPU, 2 GB SSD, no worker/volume/custom scaling, and scales to zero after one hour without traffic. It is explicitly intended for preview/hobby workloads.

## Critical truth boundary

Adding API keys alone will **not** activate Gemini, OpenRouter, or Groq in the current code. The checked repository has provider-gated Creative Studio and existing Manus Forge integration boundaries, but no verified live Gemini/OpenRouter/Groq adapter. The implementation must first add:

1. a provider-neutral server adapter;
2. explicit provider selection and fallback rules;
3. a protected tRPC procedure or internal service call;
4. timeout, retry, rate-limit, quota and error handling;
5. truthful provider status in the UI;
6. tests with mocked providers; and
7. no browser exposure of provider keys.

## Secrets: where each value belongs

### A. Koyeb runtime secrets — required for the deployed service

Configure these in **Koyeb Secrets/Environment**, not in source code and not in the frontend:

| Name | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | Aiven MySQL/TiDB-compatible connection string |
| `JWT_SECRET` | Yes | Server-only session signing secret; use a new random value of at least 32 characters |
| `GEMINI_API_KEY` | For Gemini | Google AI Studio / Gemini Developer API key |
| `OPENROUTER_API_KEY` | For OpenRouter | OpenRouter server-side API key |
| `GROQ_API_KEY` | For Groq | Groq server-side API key |
| `VITE_APP_ID` | Current auth | Existing Manus OAuth application ID, if Manus OAuth is retained |
| `OAUTH_SERVER_URL` | Current auth | Existing OAuth server base URL |
| `VITE_OAUTH_PORTAL_URL` | Current auth | Existing login portal URL |
| `OWNER_OPEN_ID` | Admin | Existing owner identity for admin authorization |
| `OWNER_NAME` | Optional | Owner display name |
| `VITE_CAPTCHA_SITE_KEY` | Public production | Turnstile site key for the final hostname |
| `CAPTCHA_SECRET_KEY` | Public production | Turnstile server secret |
| `CAPTCHA_ALLOWED_HOSTNAME` | Public production | Exact hostname without scheme/path |
| `CAPTCHA_VERIFY_URL` | Optional | Default: `https://challenges.cloudflare.com/turnstile/v0/siteverify` |
| `BUILT_IN_FORGE_API_URL` | Optional | Only if existing Manus Forge features remain enabled |
| `BUILT_IN_FORGE_API_KEY` | Optional | Server-only Manus Forge key |

**Never add these keys with a `VITE_` prefix:**

```text
VITE_GEMINI_API_KEY
VITE_OPENROUTER_API_KEY
VITE_GROQ_API_KEY
```

A `VITE_`-prefixed secret can be exposed in the browser bundle.

### B. Koyeb non-secret environment variables

These can be configured as ordinary Koyeb environment variables:

```env
NODE_ENV=production
PORT=3000
DSAI_APP_NAME=dsai-platform
DSAI_RUNTIME_MODE=production
DSAI_PRIVATE_ALPHA=false
DSAI_PRIVATE_ALPHA_BIND=127.0.0.1
CAPTCHA_ENABLED=true
DSAI_REQUIRE_FORGE=0
AI_PROVIDER_MODE=multi
AI_PRIMARY_PROVIDER=gemini
AI_FALLBACK_PROVIDERS=openrouter,groq
AI_TIMEOUT_MS=20000
AI_MAX_OUTPUT_TOKENS=1200
AI_USER_DAILY_LIMIT=20
AI_ADMIN_DAILY_LIMIT=200
GEMINI_MODEL=<operator-selected-active-model>
OPENROUTER_MODEL=<operator-selected-free-model>
GROQ_MODEL=<operator-selected-active-model>
OPENROUTER_SITE_URL=https://<final-public-hostname>
OPENROUTER_APP_NAME=DSAI
```

Do not hardcode model names until availability is verified in the provider accounts. Free-model availability and rate limits change.

### C. GitHub Actions secrets — only if CI/CD or migration is automated

GitHub Actions secrets are separate from Koyeb runtime secrets. Add only what a workflow actually uses:

| Name | Required when | Purpose |
|---|---:|---|
| `DATABASE_URL` | Migration workflow | Run Drizzle migration against Aiven from a controlled GitHub job |
| `KOYEB_API_TOKEN` | GitHub-driven Koyeb deployment | Authenticate deployment action/CLI |
| `KOYEB_APP_NAME` | GitHub-driven deployment | Target Koyeb app name, if the workflow uses it |
| `KOYEB_SERVICE_NAME` | GitHub-driven deployment | Target Koyeb service name, if the workflow uses it |
| `ANDROID_KEYSTORE_BASE64` | Release APK/AAB only | Operator-controlled release keystore, never for debug builds |
| `ANDROID_KEYSTORE_PASSWORD` | Release APK/AAB only | Keystore password |
| `ANDROID_KEY_ALIAS` | Release APK/AAB only | Signing alias |
| `ANDROID_KEY_PASSWORD` | Release APK/AAB only | Alias password |
| `PLAY_SERVICE_ACCOUNT_JSON` | Play upload only | Only if automated Play publishing is later approved |

For the first alpha, do **not** put AI provider keys in GitHub Actions unless a deployment workflow explicitly injects them into Koyeb. Prefer entering provider keys directly into Koyeb Secrets so they never pass through build logs or artifacts.

## Provider-specific requirements

### Gemini Developer API

- Create a key through Google AI Studio / Gemini Developer API.
- Confirm the selected model has free-tier availability for the account/project.
- Record RPM/TPM/RPD limits and use server-side throttling.
- Treat the key as a project/account credential, not unlimited capacity.
- Add `GEMINI_API_KEY` only to Koyeb runtime secrets.

Official references:

- https://ai.google.dev/gemini-api/docs/api-key
- https://ai.google.dev/gemini-api/docs/rate-limits

### OpenRouter

- Create an OpenRouter API key.
- Use a verified free model or the `openrouter/free` router only after checking current availability.
- Configure a per-key/provider limit where supported.
- Handle HTTP 402/429 and provider exhaustion as normal fallback states.
- Add `OPENROUTER_API_KEY` only to Koyeb runtime secrets.

Official references:

- https://openrouter.ai/openrouter/free
- https://openrouter.ai/docs/api_reference/authentication
- https://openrouter.ai/docs/api_reference/limits

### Groq

- Create a Groq API key.
- Check current organization-level rate limits in the Groq console.
- Use bounded request size, timeout and retry behavior.
- Add `GROQ_API_KEY` only to Koyeb runtime secrets.

Official references:

- https://console.groq.com/docs/quickstart
- https://console.groq.com/docs/rate-limits

## Deployment sequence

### Phase 1 — Account and database preparation

1. Create the Koyeb account and one Free Web Service capacity.
2. Create the Aiven Free MySQL service.
3. Copy the Aiven connection string into the protected `DATABASE_URL` secret field.
4. Do not paste the connection string into chat, GitHub issue, README, or screenshots.
5. Choose a final Koyeb region supported by the free instance: Frankfurt or Washington, DC.

### Phase 2 — Provider adapter implementation

Implement a server-only provider module with this contract:

```ts
type AiProvider = "gemini" | "openrouter" | "groq";

type GenerateInput = {
  provider: AiProvider;
  system: string;
  prompt: string;
  maxOutputTokens: number;
  timeoutMs: number;
};

type GenerateResult = {
  provider: AiProvider;
  model: string;
  text: string;
  requestId?: string;
  usage?: { inputTokens?: number; outputTokens?: number };
};
```

The adapter must:

- read keys only from `process.env`;
- never return the key to the browser;
- enforce provider allowlists;
- apply timeouts and bounded retries;
- detect 401, 402, 403, 408, 429 and 5xx distinctly;
- fail over only for eligible transient/quota errors;
- stop after a bounded provider chain;
- record provider/model/status without recording prompts containing sensitive data;
- preserve the existing human-review and no-auto-send boundary;
- keep Creative Studio labelled provider-gated until a real output path is implemented.

### Phase 3 — Deployment configuration

1. Connect `dulalsarder90-hash/DsAi_MANUS` to Koyeb.
2. Select the `main` branch.
3. Use the repository `Dockerfile`.
4. Set service port to `3000` and health check path to `/health`.
5. Add Koyeb runtime variables and secrets.
6. Deploy the container.
7. Confirm `/health` returns liveness.
8. Confirm `/readyz` returns database-ready only after the Aiven migration succeeds.

### Phase 4 — Database migration

The current repository uses:

```bash
pnpm db:push
```

This generates Drizzle migration output and applies it using the current MySQL/TiDB contract. Run it from a protected CI job or an operator-controlled migration environment, never from an untrusted public build step.

If GitHub Actions performs the migration, the job must:

1. use a protected environment approval;
2. load `DATABASE_URL` from GitHub Secrets;
3. install with `pnpm install --frozen-lockfile`;
4. run `pnpm db:push`;
5. run a non-mutating readiness check; and
6. never echo environment values.

### Phase 5 — GitHub Actions APK

The existing Android wrapper can use a public-repository GitHub Actions Linux runner for debug APK artifacts. A release-signed APK/AAB remains blocked until the operator supplies the production keystore through GitHub Secrets.

The first workflow should build:

```text
pnpm install --frozen-lockfile
pnpm run check
pnpm test
pnpm run build
./scripts/build-android-apk.sh debug
```

Do not automatically publish to Play Store in the first workflow.

## Acceptance tests before calling the alpha live

- `GET /health` returns 200.
- `GET /readyz` returns 200 with the real Aiven database.
- Database migration completes and is reversible/documented.
- Login callback uses the final hostname and preserves OAuth state.
- CAPTCHA site key hostname matches the deployed hostname.
- Lead Composer produces a bounded response through one provider.
- Provider rate limit triggers fallback without exposing a key.
- All providers unavailable triggers a truthful fallback/error state.
- Logs contain provider status, not API keys or full user prompts.
- `/admin` remains auth-gated.
- Koyeb restart and scale-to-zero wake-up are understood and documented.
- No generated media or outbound CRM send is claimed unless its adapter is independently verified.
- Debug APK artifact installs on a test device.

## What is still not solved by free-tier deployment

- High availability
- Always-on worker/queue execution
- Durable media rendering
- Guaranteed provider capacity
- Production backup/restore SLA
- Play Store signing
- Payment settlement
- Enterprise CRM send/write-back
- Public production certification

## Final recommendation

Use **Koyeb full-stack + Aiven MySQL** for the first free-tier controlled-alpha. Keep Vercel/Netlify optional for a later frontend split. Put runtime secrets in Koyeb, use GitHub Secrets only for CI/CD and controlled migrations, and do not provide secret values through chat.
