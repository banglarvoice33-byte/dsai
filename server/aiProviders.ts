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
  // Pinned to a currently published Free-tier text model; no paid routing override.
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
  openrouter: { perMinute: 15, perDay: 40 },
  cloudflare: { perMinute: 5, perDay: 20 },
  // Conservative DSAI-wide cap, intentionally below typical Free-tier allowances.
  gemini: { perMinute: 5, perDay: 50 },
} as const;

const FREE_CLOUDFLARE_MODELS = new Set<string>(["@cf/zai-org/glm-4.7-flash"]);

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
export type AIMessage = { role: "system" | "user" | "assistant"; content: string };
export type AICompletionInput = {
  provider: AIProvider;
  messages: AIMessage[];
  maxTokens?: number;
  requestIdentity?: string;
  responseFormat?: { type: "json_object" };
  timeoutMs?: number;
};

/**
 * Free-only mode allows providers with an explicitly constrained free-route policy.
 * Cloudflare is constrained below to Workers AI model IDs (@cf/*), never paid
 * external catalog models. Keep this helper pure so routing policy is testable.
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

export async function runAIProvider(input: AICompletionInput, options: { skipRateLimit?: boolean } = {}) {
  if (process.env.AI_PROVIDERS_ENABLED !== "true") throw Object.assign(new Error("ai_providers_disabled"), { code: "AI_PROVIDERS_DISABLED", status: 503 });
  if (!isProviderAllowedInFreeOnlyMode(input.provider)) throw Object.assign(new Error("paid_provider_blocked_in_free_only_mode"), { code: "PAID_PROVIDER_BLOCKED", status: 503 });
  const key = await readVaultSecret(SECRET_NAMES[input.provider]);
  if (!key) throw Object.assign(new Error("provider_not_configured"), { code: "PROVIDER_NOT_CONFIGURED", status: 503 });
  const cloudflareAccountId = input.provider === "cloudflare" ? await readVaultSecret("CLOUDFLARE_ACCOUNT_ID") : null;
  if (input.provider === "cloudflare" && (!cloudflareAccountId || !/^[a-f0-9]{32}$/i.test(cloudflareAccountId))) {
    throw Object.assign(new Error("cloudflare_account_not_configured"), { code: "PROVIDER_NOT_CONFIGURED", status: 503 });
  }
  if (!options.skipRateLimit) await consumeAIRequest(input.requestIdentity || "system");
  if (FREE_ONLY_MODE && (input.provider === "openrouter" || input.provider === "cloudflare")) {
    await consumeProviderQuota(input.provider);
  }
  const model = FREE_ONLY_MODE && input.provider === "openrouter" ? "openrouter/free" : input.provider === "cloudflare" ? (FREE_ONLY_MODE ? DEFAULT_MODELS.cloudflare : (process.env.AI_MODEL_CLOUDFLARE || DEFAULT_MODELS.cloudflare)) : (process.env[`AI_MODEL_${input.provider.toUpperCase()}`] || DEFAULT_MODELS[input.provider]);
  if (input.provider === "cloudflare" && !/^@cf\/[a-z0-9._/-]+$/i.test(model)) {
    throw Object.assign(new Error("cloudflare_model_must_be_workers_ai_free_model"), { code: "PAID_PROVIDER_BLOCKED", status: 503 });
  }
  const controller = new AbortController();
  const requestTimeoutMs = Math.min(Math.max(input.timeoutMs ?? 30_000, 1_000), 30_000);
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const url = input.provider === "gemini"
      ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
      : input.provider === "cloudflare"
        ? `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${model}`
        : endpoint(input.provider);
    const body = input.provider === "gemini"
      ? { contents: input.messages.filter(m => m.role !== "system").map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })), systemInstruction: input.messages.find(m => m.role === "system") ? { parts: [{ text: input.messages.find(m => m.role === "system")!.content }] } : undefined, generationConfig: { maxOutputTokens: Math.min(Math.max(input.maxTokens || 1024, 1), 4096), ...(input.responseFormat ? { responseMimeType: "application/json" } : {}) } }
      : input.provider === "cloudflare"
        ? { messages: input.messages, max_tokens: Math.min(Math.max(input.maxTokens || 1024, 1), 2048), temperature: 0.2 }
        : { model, messages: input.messages, max_tokens: Math.min(Math.max(input.maxTokens || 1024, 1), 4096), ...(input.responseFormat ? { response_format: input.responseFormat } : {}), stream: false };
    const response = await fetch(url, {
      method: "POST", signal: controller.signal,
      headers: input.provider === "gemini" ? { "content-type": "application/json", "x-goog-api-key": key } : { authorization: `Bearer ${key}`, "content-type": "application/json", ...(input.provider === "openrouter" ? { "HTTP-Referer": process.env.APP_PUBLIC_URL || "https://dsai-one.vercel.app", "X-Title": "DSAI" } : {}) },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({})) as any;
    if (!response.ok) throw Object.assign(new Error("provider_request_failed"), { code: "PROVIDER_REQUEST_FAILED", status: 502, providerStatus: response.status });
    const text = input.provider === "gemini"
      ? payload.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("")
      : input.provider === "cloudflare"
        ? (payload.result?.response || payload.result?.choices?.[0]?.message?.content)
        : payload.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text) throw Object.assign(new Error("provider_empty_response"), { code: "PROVIDER_EMPTY_RESPONSE", status: 502 });
    return { provider: input.provider, model, text };
  } finally { clearTimeout(timer); }
}

export async function runAIProviderWithFallback(input: Omit<AICompletionInput, "provider"> & { preferredProvider?: AIProvider }) {
  if (process.env.AI_PROVIDERS_ENABLED !== "true") throw Object.assign(new Error("ai_providers_disabled"), { code: "AI_PROVIDERS_DISABLED", status: 503 });
  await consumeAIRequest(input.requestIdentity || "system");
  const preferred = input.preferredProvider ?? "openrouter";
  const order: AIProvider[] = FREE_ONLY_MODE
    ? [
        "openrouter",
        ...(GEMINI_FREE_QUOTA_CONFIRMED ? ["gemini" as const] : []),
        ...(CLOUDFLARE_FREE_QUOTA_CONFIRMED ? ["cloudflare" as const] : []),
      ]
    : Array.from(new Set<AIProvider>([preferred, "openrouter", "cloudflare", "xai", "gemini", "openai"]));
  const failures: string[] = [];
  for (const provider of order) {
    try {
      return await runAIProvider({ ...input, provider, requestIdentity: undefined }, { skipRateLimit: true });
    } catch (error) {
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
