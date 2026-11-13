import { createHash } from "node:crypto";
import postgres from "postgres";

export type AIProvider = "openrouter" | "xai" | "openai" | "gemini";
const SECRET_NAMES: Record<AIProvider, string> = {
  openrouter: "OPENROUTER_API_KEY",
  xai: "XAI_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
};
const DEFAULT_MODELS: Record<AIProvider, string> = {
  openrouter: "openai/gpt-4o-mini",
  xai: "grok-3-mini",
  openai: "gpt-4o-mini",
  gemini: "gemini-2.0-flash",
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
    result[provider] = { configured, enabled: process.env.AI_PROVIDERS_ENABLED === "true" && configured, model: process.env[`AI_MODEL_${provider.toUpperCase()}`] || DEFAULT_MODELS[provider] };
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
};

export async function runAIProvider(input: AICompletionInput, options: { skipRateLimit?: boolean } = {}) {
  if (process.env.AI_PROVIDERS_ENABLED !== "true") throw Object.assign(new Error("ai_providers_disabled"), { code: "AI_PROVIDERS_DISABLED", status: 503 });
  const key = await readVaultSecret(SECRET_NAMES[input.provider]);
  if (!key) throw Object.assign(new Error("provider_not_configured"), { code: "PROVIDER_NOT_CONFIGURED", status: 503 });
  if (!options.skipRateLimit) await consumeAIRequest(input.requestIdentity || "system");
  const model = process.env[`AI_MODEL_${input.provider.toUpperCase()}`] || DEFAULT_MODELS[input.provider];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const url = input.provider === "gemini"
      ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
      : endpoint(input.provider);
    const body = input.provider === "gemini"
      ? { contents: input.messages.filter(m => m.role !== "system").map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })), systemInstruction: input.messages.find(m => m.role === "system") ? { parts: [{ text: input.messages.find(m => m.role === "system")!.content }] } : undefined, generationConfig: { maxOutputTokens: Math.min(Math.max(input.maxTokens || 1024, 1), 4096), ...(input.responseFormat ? { responseMimeType: "application/json" } : {}) } }
      : { model, messages: input.messages, max_tokens: Math.min(Math.max(input.maxTokens || 1024, 1), 4096), ...(input.responseFormat ? { response_format: input.responseFormat } : {}), stream: false };
    const response = await fetch(url, {
      method: "POST", signal: controller.signal,
      headers: input.provider === "gemini" ? { "content-type": "application/json", "x-goog-api-key": key } : { authorization: `Bearer ${key}`, "content-type": "application/json", ...(input.provider === "openrouter" ? { "HTTP-Referer": process.env.APP_PUBLIC_URL || "https://dsai-one.vercel.app", "X-Title": "DSAI" } : {}) },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({})) as any;
    if (!response.ok) throw Object.assign(new Error("provider_request_failed"), { code: "PROVIDER_REQUEST_FAILED", status: 502, providerStatus: response.status });
    const text = input.provider === "gemini" ? payload.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") : payload.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text) throw Object.assign(new Error("provider_empty_response"), { code: "PROVIDER_EMPTY_RESPONSE", status: 502 });
    return { provider: input.provider, model, text };
  } finally { clearTimeout(timer); }
}

export async function runAIProviderWithFallback(input: Omit<AICompletionInput, "provider"> & { preferredProvider?: AIProvider }) {
  if (process.env.AI_PROVIDERS_ENABLED !== "true") throw Object.assign(new Error("ai_providers_disabled"), { code: "AI_PROVIDERS_DISABLED", status: 503 });
  await consumeAIRequest(input.requestIdentity || "system");
  const preferred = input.preferredProvider ?? "openrouter";
  const order: AIProvider[] = Array.from(new Set<AIProvider>([preferred, "openrouter", "xai", "gemini", "openai"]));
  const failures: string[] = [];
  for (const provider of order) {
    try {
      return await runAIProvider({ ...input, provider, requestIdentity: undefined }, { skipRateLimit: true });
    } catch (error) {
      const status = typeof error === "object" && error !== null && "providerStatus" in error ? Number((error as { providerStatus?: unknown }).providerStatus) : null;
      const code = error instanceof Error ? error.message : "unknown";
      failures.push(provider + ":" + code);
      if (status !== null && status >= 400 && status < 500 && ![401, 403, 408, 409, 429].includes(status)) break;
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
      agnesApiHub: Boolean(agnesKey),
      cloudflareWorkersAI: Boolean(cloudflareAccount && cloudflareToken),
      thirdIndependentImageProvider: false,
      openrouterForImages: false,
      openrouterForTextAI: Boolean(textProviders.openrouter.enabled),
      xaiFallback: Boolean(textProviders.xai.enabled),
      geminiFallback: Boolean(textProviders.gemini.enabled),
      openaiFallback: Boolean(textProviders.openai.enabled),
    },
    healthCheck: "credentials_configured_only_not_live_provider_test",
  };
}
