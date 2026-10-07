type ProviderName = "gemini" | "openrouter" | "groq";

type StructuredRequest = {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  maxOutputTokens: number;
};

type StructuredResponse = {
  provider: ProviderName;
  model: string;
  text: string;
};

const DEFAULT_TIMEOUT_MS = 20_000;
const providerOrder: ProviderName[] = ["gemini", "openrouter", "groq"];

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function configuredProviders(): ProviderName[] {
  const primary = env("AI_PRIMARY_PROVIDER") as ProviderName;
  const fallback = env("AI_FALLBACK_PROVIDERS").split(",").map(value => value.trim() as ProviderName);
  const requested = [primary, ...fallback].filter(value => providerOrder.includes(value));
  const available = requested.length ? requested : providerOrder;
  return available.filter((provider, index) => available.indexOf(provider) === index && keyFor(provider));
}

function keyFor(provider: ProviderName): string {
  if (provider === "gemini") return env("GEMINI_API_KEY");
  if (provider === "openrouter") return env("OPENROUTER_API_KEY");
  return env("GROQ_API_KEY");
}

function modelFor(provider: ProviderName): string {
  if (provider === "gemini") return env("GEMINI_MODEL") || "gemini-2.5-flash";
  if (provider === "openrouter") return env("OPENROUTER_MODEL") || "openrouter/free";
  return env("GROQ_MODEL") || "llama-3.3-70b-versatile";
}

function timeoutMs(): number {
  const value = Number(env("AI_TIMEOUT_MS"));
  return Number.isFinite(value) && value >= 1_000 && value <= 60_000 ? value : DEFAULT_TIMEOUT_MS;
}

function isRetryable(status: number): boolean {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

async function requestJson(url: string, init: RequestInit): Promise<{ status: number; body: unknown }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let body: unknown = {};
    try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
    return { status: response.status, body };
  } finally {
    clearTimeout(timer);
  }
}

function textFromOpenAi(body: unknown): string {
  const content = (body as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

function textFromGemini(body: unknown): string {
  const parts = (body as { candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }> })?.candidates?.[0]?.content?.parts;
  return Array.isArray(parts) ? parts.map(part => typeof part.text === "string" ? part.text : "").join("\n") : "";
}

async function callOpenAiCompatible(provider: "openrouter" | "groq", request: StructuredRequest): Promise<StructuredResponse> {
  const model = modelFor(provider);
  const url = provider === "openrouter" ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
  const headers: Record<string, string> = {
    Authorization: `Bearer ${keyFor(provider)}`,
    "Content-Type": "application/json",
  };
  if (provider === "openrouter") {
    const siteUrl = env("OPENROUTER_SITE_URL");
    const appName = env("OPENROUTER_APP_NAME");
    if (siteUrl) headers["HTTP-Referer"] = siteUrl;
    if (appName) headers["X-Title"] = appName;
  }
  const result = await requestJson(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: request.system }, { role: "user", content: request.user }],
      max_tokens: request.maxOutputTokens,
      response_format: { type: "json_object" },
    }),
  });
  if (result.status < 200 || result.status >= 300) throw Object.assign(new Error(`${provider} returned ${result.status}`), { status: result.status, retryable: isRetryable(result.status) });
  const text = textFromOpenAi(result.body);
  if (!text) throw new Error(`${provider} returned empty content`);
  return { provider, model, text };
}

async function callGemini(request: StructuredRequest): Promise<StructuredResponse> {
  const model = modelFor("gemini");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(keyFor("gemini"))}`;
  const result = await requestJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: request.system }] },
      contents: [{ role: "user", parts: [{ text: request.user }] }],
      generationConfig: {
        maxOutputTokens: request.maxOutputTokens,
        responseMimeType: "application/json",
        responseSchema: request.schema,
      },
    }),
  });
  if (result.status < 200 || result.status >= 300) throw Object.assign(new Error(`gemini returned ${result.status}`), { status: result.status, retryable: isRetryable(result.status) });
  const text = textFromGemini(result.body);
  if (!text) throw new Error("gemini returned empty content");
  return { provider: "gemini", model, text };
}

export function hasExternalAiProvider(): boolean {
  return configuredProviders().length > 0;
}

export async function generateStructuredJson(request: StructuredRequest): Promise<StructuredResponse> {
  const providers = configuredProviders();
  if (!providers.length) throw new Error("No external AI provider is configured");
  let lastError: unknown;
  for (const provider of providers) {
    try {
      return provider === "gemini" ? await callGemini(request) : await callOpenAiCompatible(provider, request);
    } catch (error) {
      lastError = error;
      const retryable = Boolean((error as { retryable?: boolean })?.retryable);
      if (!retryable) continue;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All external AI providers failed");
}
