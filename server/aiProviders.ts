import { createHash } from "node:crypto";
import postgres from "postgres";

export type AIProvider = "openrouter" | "xai" | "openai" | "gemini" | "cloudflare";

// Free-only mode must never fall back to a paid provider or model.
const FREE_ONLY_MODE = process.env.AI_FREE_ONLY_MODE === "true";
// Cloudflare Billing Read/Subscription access was unavailable during the 2026-11-16 audit.
// Keep Workers AI disabled in free-only routing until an operator verifies the account is
// on Workers Free (or otherwise confirms a hard no-billing boundary) and sets this flag.
const CLOUDFLARE_FREE_QUOTA_CONFIRMED = process.env.AI_CLOUDFLARE_FREE_QUOTA_CONFIRMED === "true";
// Gemini Free tier eligibility is project-specific. Never enable it from key presence alone.
const GEMINI_FREE_QUOTA_CONFIRMED = process.env.AI_GEMINI_FREE_QUOTA_CONFIRMED === "true";
const SECRET_NAMES: Record<AIProvider, string> = {
  openrouter: "OPENROUTER_API_KEY",
  xai: "XAI_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
  cloudflare: "CLOUDFLARE_API_TOKEN",
};
const DEFAULT_MODELS: Record<AIProvider, string> = {
  openrouter: "openrouter/free",
  xai: "grok-3-mini",
  openai: "gpt-4o-mini",
  // Gemini 3.8 Flash is listed in Google's Free tier; account and per-request privacy gates still apply.
  gemini: "gemini-3.8-flash",
  // Exact allowlist only. A generic @cf/* prefix is not a sufficient no-billing guarantee.
  cloudflare: "@cf/zai-org/glm-4.7-flash",
};
let sqlClient: ReturnType<typeof postgres> | undefined;
function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("AI provider secrets are unavailable: database is not configured");
  if (!sqlClient) sqlClient = postgres(url, { max: 1, idle_timeout: 10, connect_timeout: 5, prepare: false, ssl: "require" });
  return sqlClient;
}
async function readVaultSecret(name: string): Promise<string | null> {
  const rows = await getSql()<{ decrypted_secret: string }[]>`select decrypted_secret from vault.decrypted_secrets where name = ${name} limit 1`;
  return rows[0]?.decrypted_secret || null;
}

const AI_REQUEST_WINDOW_MS = 10 * 60 * 1000;
const AI_REQUEST_MAX = 5;
const AI_RATE_LIMIT_RETENTION_MS = 24 * 60 * 60 * 1000;
let lastRateLimitCleanupAt = 0;

export const FREE_PROVIDER_QUOTAS = {
  // Match OpenRouter Free model's published 20 RPM / 50 RPD account ceiling.
  openrouter: { perMinute: 20, perDay: 50 },
  cloudflare: { perMinute: 5, perDay: 20 },
  // Conservative DSAI-wide cap, intentionally below typical Free-tier allowances.
  gemini: { perMinute: 5, perDay: 50 },
} as const;

const FREE_CLOUDFLARE_MODELS = new Set<string>(["@cf/zai-org/glm-4.7-flash"]);
const FREE_GEMINI_MODELS = new Set<string>(["gemini-3.8-flash", "gemini-3.1-flash-lite"]);

export function isCloudflareModelAllowedInFreeOnlyMode(model: string, freeOnlyMode = FREE_ONLY_MODE): boolean {
  return !freeOnlyMode || FREE_CLOUDFLARE_MODELS.has(model);
}

export function isGeminiModelAllowedInFreeOnlyMode(model: string, freeOnlyMode = FREE_ONLY_MODE): boolean {
  return !freeOnlyMode || FREE_GEMINI_MODELS.has(model);
}

/**
 * GLM-4.7-Flash can spend a small completion budget on hidden reasoning and
 * return no user-facing content. Keep default reasoning effort low and use the
 * current completion-token field so short Bengali chat requests still finish.
 */
export function buildCloudflareRequestBody(messages: AIMessage[], maxTokens = 1024) {
  return {
    messages,
    max_completion_tokens: Math.min(Math.max(maxTokens || 1024, 1), 2048),
    reasoning_effort: "low" as const,
    temperature: 0.2,
  };
}

/**
 * Account-wide sliding-window free-tier guard. The database function serializes
 * concurrent requests per provider and records the attempt before network I/O.
 * Failed attempts therefore consume the same conservative quota slot.
 */
async function consumeProviderQuota(provider: "openrouter" | "cloudflare" | "gemini"): Promise<void> {
  const limits = FREE_PROVIDER_QUOTAS[provider];
  const sql = getSql();
  const rows = await sql<{ allowed: boolean }[]>`
    SELECT private.consume_ai_provider_quota(
      ${provider},
      ${limits.perMinute},
      ${limits.perDay}
    ) AS allowed
  `;
  if (!rows[0]?.allowed) {
    throw Object.assign(new Error("provider_free_quota_exceeded"), {
      code: "AI_PROVIDER_QUOTA_EXCEEDED",
      status: 429,
      providerStatus: 429,
    });
  }
}

async function consumeAIRequest(identity: string): Promise<void> {
  const subjectHash = createHash("sha256").update(identity.trim().slice(0, 256) || "unknown").digest("hex");
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / AI_REQUEST_WINDOW_MS) * AI_REQUEST_WINDOW_MS);
  const sql = getSql();
  const rows = await sql<{ request_count: number }[]>`
    insert into public.ai_provider_rate_limits (subject_hash, window_start, request_count)
    values (${subjectHash}, ${windowStart}, 1)
    on conflict (subject_hash, window_start)
    do update set request_count = public.ai_provider_rate_limits.request_count + 1
    where public.ai_provider_rate_limits.request_count < ${AI_REQUEST_MAX}
    returning request_count
  `;
  if (!rows.length) {
    throw Object.assign(new Error("ai_rate_limit_exceeded"), { code: "AI_RATE_LIMITED", status: 429 });
  }
  if (now - lastRateLimitCleanupAt > 60 * 60 * 1000) {
    lastRateLimitCleanupAt = now;
    try {
      await sql`delete from public.ai_provider_rate_limits where window_start < ${new Date(now - AI_RATE_LIMIT_RETENTION_MS)}`;
    } catch {
      // Expired quota cleanup is best-effort; it must not block a valid request.
    }
  }
}
export async function getAIProviderStatus() {
  const result = {} as Record<AIProvider, { configured: boolean; enabled: boolean; model: string }>;
  for (const provider of Object.keys(SECRET_NAMES) as AIProvider[]) {
    let configured = false;
    try { configured = Boolean(await readVaultSecret(SECRET_NAMES[provider])); } catch { configured = false; }
    if (provider === "cloudflare") {
      try { configured = configured && Boolean(await readVaultSecret("CLOUDFLARE_ACCOUNT_ID")); } catch { configured = false; }
    }
    result[provider] = {
      configured,
      enabled: process.env.AI_PROVIDERS_ENABLED === "true" && configured && isProviderAllowedInFreeOnlyMode(provider),
      model: FREE_ONLY_MODE && (provider === "openrouter" || provider === "gemini" || provider === "cloudflare") ? DEFAULT_MODELS[provider] : (process.env[`AI_MODEL_${provider.toUpperCase()}`] || DEFAULT_MODELS[provider]),
    };
  }
  return result;
}
function endpoint(provider: AIProvider) {
  if (provider === "openrouter") return "https://openrouter.ai/api/v1/chat/completions";
  if (provider === "xai") return "https://api.x.ai/v1/chat/completions";
  if (provider === "openai") return "https://api.openai.com/v1/chat/completions";
  return "";
}
export function resolveProviderModel(provider: AIProvider, requestedModel: string, responseModel: unknown): string {
  // OpenRouter reports the concrete upstream model selected by its free router.
  if (provider === "openrouter" && typeof responseModel === "string" && responseModel.trim()) {
    return responseModel.trim();
  }
  return requestedModel;
}

export type AIMessage = { role: "system" | "user" | "assistant"; content: string };

/** Fail before spending quota or network work when the owning operation is cancelled. */
export function throwIfRequestAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw Object.assign(new Error("request_aborted"), { code: "REQUEST_ABORTED" });
  }
}
export type AICompletionInput = {
  provider: AIProvider;
  messages: AIMessage[];
  maxTokens?: number;
  requestIdentity?: string;
  responseFormat?: { type: "json_object" };
  timeoutMs?: number;
  /** Owner-scoped key decrypted only on the server for an explicitly selected connector. */
  apiKeyOverride?: string;
  /** Abort in-flight provider I/O when the owning WorkDesk task is cancelled. */
  signal?: AbortSignal;
};

/**
 * Free-only mode allows providers with an explicitly constrained free-route policy.
 * Cloudflare is constrained to an exact model allowlist, never a generic @cf/* prefix.
 * Gemini additionally requires account-level Free-tier confirmation and per-request user consent.
 */
export function isProviderAllowedInFreeOnlyMode(
  provider: AIProvider,
  freeOnlyMode = FREE_ONLY_MODE,
  cloudflareFreeQuotaConfirmed = CLOUDFLARE_FREE_QUOTA_CONFIRMED,
  geminiFreeQuotaConfirmed = GEMINI_FREE_QUOTA_CONFIRMED,
): boolean {
  return !freeOnlyMode
    || provider === "openrouter"
    || (provider === "cloudflare" && cloudflareFreeQuotaConfirmed)
    || (provider === "gemini" && geminiFreeQuotaConfirmed);
}

/**
 * In free-only mode every attempted provider is on the explicit free allowlist,
 * so a failure at one provider must not prevent trying the next free provider.
 * In normal mode preserve the existing stop-on-most-client-errors behavior.
 */
export function shouldContinueProviderFallback(providerStatus: number | null, freeOnlyMode = FREE_ONLY_MODE): boolean {
  if (freeOnlyMode) return true;
  return !(providerStatus !== null && providerStatus >= 400 && providerStatus < 500
    && ![401, 403, 408, 409, 429].includes(providerStatus));
}


async function readBoundedProviderJson(response: Response, maxBytes = 512_000): Promise<unknown> {
  if (!response.body) throw Object.assign(new Error("provider_empty_response"), { code: "PROVIDER_EMPTY_RESPONSE", status: 502 });
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      total += part.value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw Object.assign(new Error("provider_response_too_large"), { code: "PROVIDER_RESPONSE_TOO_LARGE", status: 502 });
      }
      chunks.push(part.value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw Object.assign(new Error("provider_invalid_response"), { code: "PROVIDER_INVALID_RESPONSE", status: 502 }); }
}
/** DSAI-wide provider quota is reserved for platform-owned credentials, never personal BYOK. */
export function shouldConsumeSharedProviderQuota(provider: AIProvider, hasUserKey: boolean, freeOnlyMode = FREE_ONLY_MODE): boolean {
  return !hasUserKey && freeOnlyMode && (provider === "openrouter" || provider === "cloudflare" || provider === "gemini");
}
export async function runAIProvider(input: AICompletionInput, options: { skipRateLimit?: boolean } = {}) {
  throwIfRequestAborted(input.signal);
  if (process.env.AI_PROVIDERS_ENABLED !== "true") throw Object.assign(new Error("ai_providers_disabled"), { code: "AI_PROVIDERS_DISABLED", status: 503 });
  const personalGemini = Boolean(input.apiKeyOverride && input.provider === "gemini");
  if (input.apiKeyOverride && input.provider !== "openrouter" && !personalGemini) throw Object.assign(new Error("personal_connector_provider_not_allowed"), { code: "PAID_PROVIDER_BLOCKED", status: 503 });
  // A personal Gemini key is an explicit user-funded route, not a DSAI free-provider route.
  if (!personalGemini && !isProviderAllowedInFreeOnlyMode(input.provider)) throw Object.assign(new Error("paid_provider_blocked_in_free_only_mode"), { code: "PAID_PROVIDER_BLOCKED", status: 503 });
  const key = input.apiKeyOverride?.trim() || await readVaultSecret(SECRET_NAMES[input.provider]);
  if (!key) throw Object.assign(new Error("provider_not_configured"), { code: "PROVIDER_NOT_CONFIGURED", status: 503 });
  const cloudflareAccountId = input.provider === "cloudflare" ? await readVaultSecret("CLOUDFLARE_ACCOUNT_ID") : null;
  if (input.provider === "cloudflare" && (!cloudflareAccountId || !/^[a-f0-9]{32}$/i.test(cloudflareAccountId))) {
    throw Object.assign(new Error("cloudflare_account_not_configured"), { code: "PROVIDER_NOT_CONFIGURED", status: 503 });
  }
  if (!options.skipRateLimit) await consumeAIRequest(input.requestIdentity || "system");
  // Shared provider quotas apply only to DSAI-owned credentials. Personal BYOK requests
  // still pass the per-user abuse rate limit above, but never consume DSAI provider quota.
  if (shouldConsumeSharedProviderQuota(input.provider, Boolean(input.apiKeyOverride))) {
    await consumeProviderQuota(input.provider);
  }
  // BYOK Gemini model selection is server-controlled and constrained to an explicit allowlist.
  const byokGeminiModels = new Set((process.env.BYOK_GEMINI_MODELS || "gemini-3.8-flash,gemini-3.5-flash-lite").split(",").map(value => value.trim()).filter(Boolean));
  const byokGeminiModel = process.env.BYOK_GEMINI_MODEL || "gemini-3.8-flash";
  const model = personalGemini
    ? byokGeminiModel
    : input.apiKeyOverride
      ? "openrouter/free"
      : FREE_ONLY_MODE
        ? DEFAULT_MODELS[input.provider]
        : (process.env[`AI_MODEL_${input.provider.toUpperCase()}`] || DEFAULT_MODELS[input.provider]);
  if (personalGemini && !byokGeminiModels.has(model)) {
    throw Object.assign(new Error("gemini_model_not_on_byok_allowlist"), { code: "MODEL_NOT_ALLOWED", status: 400 });
  }
  if (input.provider === "gemini" && !isGeminiModelAllowedInFreeOnlyMode(model)) {
    throw Object.assign(new Error("gemini_model_not_on_free_only_allowlist"), { code: "PAID_PROVIDER_BLOCKED", status: 503 });
  }
  if (input.provider === "cloudflare" && !isCloudflareModelAllowedInFreeOnlyMode(model)) {
    throw Object.assign(new Error("cloudflare_model_not_on_free_only_allowlist"), { code: "PAID_PROVIDER_BLOCKED", status: 503 });
  }
  throwIfRequestAborted(input.signal);
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(input.signal?.reason);
  input.signal?.addEventListener("abort", abortFromCaller, { once: true });
  // Close the race between the initial check and listener registration.
  if (input.signal?.aborted) abortFromCaller();
  const requestTimeoutMs = Math.min(Math.max(input.timeoutMs ?? 30_000, 1_000), 30_000);
  const timer = setTimeout(() => controller.abort(new Error("provider_timeout")), requestTimeoutMs);
  try {
    const url = input.provider === "gemini"
      ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
      : input.provider === "cloudflare"
        ? `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${model}`
        : endpoint(input.provider);
    const body = input.provider === "gemini"
      ? { contents: input.messages.filter(m => m.role !== "system").map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })), systemInstruction: input.messages.find(m => m.role === "system") ? { parts: [{ text: input.messages.find(m => m.role === "system")!.content }] } : undefined, generationConfig: { maxOutputTokens: Math.min(Math.max(input.maxTokens || 1024, 1), 4096), ...(input.responseFormat ? { responseMimeType: "application/json" } : {}) } }
      : input.provider === "cloudflare"
        ? buildCloudflareRequestBody(input.messages, input.maxTokens)
        : { model, messages: input.messages, max_tokens: Math.min(Math.max(input.maxTokens || 1024, 1), 4096), ...(input.responseFormat ? { response_format: input.responseFormat } : {}), stream: false };
    const response = await fetch(url, {
      method: "POST", redirect: "error", signal: controller.signal,
      headers: input.provider === "gemini" ? { "content-type": "application/json", "x-goog-api-key": key } : { authorization: `Bearer ${key}`, "content-type": "application/json", ...(input.provider === "openrouter" ? { "HTTP-Referer": process.env.APP_PUBLIC_URL || "https://dsai-one.vercel.app", "X-Title": "DSAI" } : {}) },
      body: JSON.stringify(body),
    });
    const payload = await readBoundedProviderJson(response) as any;
    if (!response.ok) throw Object.assign(new Error("provider_request_failed"), { code: "PROVIDER_REQUEST_FAILED", status: 502, providerStatus: response.status });
    const text = input.provider === "gemini"
      ? payload.candidates?.[0]?.content?.parts?.filter((part: any) => part?.thought !== true).map((p: any) => p.text || "").join("")
      : input.provider === "cloudflare"
        ? (payload.result?.response || payload.result?.choices?.[0]?.message?.content)
        : payload.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text) throw Object.assign(new Error("provider_empty_response"), { code: "PROVIDER_EMPTY_RESPONSE", status: 502 });
    return { provider: input.provider, model: resolveProviderModel(input.provider, model, payload.model), text };
  } catch (error) {
    // A transport or timeout failure cannot prove whether the provider accepted or billed the request.
    if (controller.signal.aborted) {
      throw Object.assign(new Error("provider_timeout_charge_status_unknown"), { code: "PROVIDER_TIMEOUT", status: 504, chargeStatus: "unknown" as const });
    }
    if (error instanceof Error && !("chargeStatus" in error)) Object.assign(error, { chargeStatus: "unknown" as const });
    throw error;
  } finally {
    clearTimeout(timer);
    input.signal?.removeEventListener("abort", abortFromCaller);
  }
}

export function buildAIProviderFallbackOrder(options: {
  freeOnlyMode: boolean;
  geminiFreeQuotaConfirmed: boolean;
  cloudflareFreeQuotaConfirmed: boolean;
  allowGemini?: boolean;
  preferredProvider?: AIProvider;
}): AIProvider[] {
  if (options.freeOnlyMode) {
    return [
      "openrouter",
      ...(options.geminiFreeQuotaConfirmed && options.allowGemini === true ? ["gemini" as const] : []),
      ...(options.cloudflareFreeQuotaConfirmed ? ["cloudflare" as const] : []),
    ];
  }
  return Array.from(new Set<AIProvider>([
    options.preferredProvider ?? "openrouter",
    "openrouter",
    "cloudflare",
    "xai",
    "gemini",
    "openai",
  ]));
}

export async function runAIProviderWithFallback(input: Omit<AICompletionInput, "provider"> & { preferredProvider?: AIProvider; allowGemini?: boolean }) {
  throwIfRequestAborted(input.signal);
  if (process.env.AI_PROVIDERS_ENABLED !== "true") throw Object.assign(new Error("ai_providers_disabled"), { code: "AI_PROVIDERS_DISABLED", status: 503 });
  await consumeAIRequest(input.requestIdentity || "system");
  const preferred = input.preferredProvider ?? "openrouter";
  const order = buildAIProviderFallbackOrder({
    freeOnlyMode: FREE_ONLY_MODE,
    geminiFreeQuotaConfirmed: GEMINI_FREE_QUOTA_CONFIRMED,
    cloudflareFreeQuotaConfirmed: CLOUDFLARE_FREE_QUOTA_CONFIRMED,
    allowGemini: input.allowGemini,
    preferredProvider: preferred,
  });
  const failures: string[] = [];
  for (const provider of order) {
    try {
      return await runAIProvider({ ...input, provider, requestIdentity: undefined }, { skipRateLimit: true });
    } catch (error) {
      // Cancellation is an owner action, not a provider outage: never spend quota on fallbacks.
      if (input.signal?.aborted) throw error;
      const status = typeof error === "object" && error !== null && "providerStatus" in error ? Number((error as { providerStatus?: unknown }).providerStatus) : null;
      const code = error instanceof Error ? error.message : "unknown";
      failures.push(provider + ":" + code);
      if (!shouldContinueProviderFallback(status)) break;
    }
  }
  throw Object.assign(new Error("ai_provider_fallback_failed:" + failures.join("|")), { code: "AI_PROVIDER_FALLBACK_FAILED", status: 502 });
}

export async function getImageGenerationAdminStatus() {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const [rows, agnesKey, cloudflareAccount, cloudflareToken, textProviders] = await Promise.all([
    getSql().unsafe(
      "select " +
      "(select count(*)::int from public.image_generation_daily_users where usage_date = $1::date) as accounts_today, " +
      "(select coalesce(sum(successful_count), 0)::int from public.image_generation_daily_users where usage_date = $1::date) as images_today, " +
      "(select coalesce(sum(request_count), 0)::int from public.image_generation_usage where usage_date = $1::date) as requests_today, " +
      "(select count(*)::int from public.generated_images where status = 'completed' and (created_at at time zone 'Asia/Dhaka')::date = $1::date) as completed_images_today",
      [today],
    ),
    readVaultSecret("AGNES_API_KEY").catch(() => null),
    readVaultSecret("CLOUDFLARE_ACCOUNT_ID").catch(() => null),
    readVaultSecret("CLOUDFLARE_API_TOKEN").catch(() => null),
    getAIProviderStatus(),
  ]);
  const usage = rows[0] as unknown as { accounts_today: number | string; images_today: number | string; requests_today: number | string; completed_images_today: number | string } | undefined;
  return {
    usageDate: today,
    accountsToday: Number(usage?.accounts_today ?? 0),
    imagesToday: Number(usage?.images_today ?? 0),
    requestsToday: Number(usage?.requests_today ?? 0),
    completedImagesToday: Number(usage?.completed_images_today ?? 0),
    dailyAccountCap: 500,
    dailyImagesPerAccount: 2,
    providers: {
      openrouterForImages: Boolean(textProviders.openrouter.configured),
      openrouterImageModel: "recraft/recraft-v4.1-flash-v2:free",
      openrouterImageFreeModelRetiresOn: "2026-11-28",
      imagePaidFallback: false,
      agnesApiHubConfiguredButNotUsed: Boolean(agnesKey),
      cloudflareWorkersAIConfiguredButNotUsed: Boolean(cloudflareAccount && cloudflareToken),
      openrouterForTextAI: Boolean(textProviders.openrouter.enabled),
      xaiFallback: Boolean(textProviders.xai.enabled),
      geminiFallback: Boolean(textProviders.gemini.enabled),
      openaiFallback: Boolean(textProviders.openai.enabled),
    },
    healthCheck: "vault_credential_presence_only_image_endpoint_requires_explicit_zero_cost_usage",
  };
}
