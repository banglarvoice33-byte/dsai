import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import postgres from "postgres";

export const USER_CONNECTOR_PROVIDERS = ["openrouter", "gemini", "openai", "xai"] as const;
export type UserConnectorProvider = (typeof USER_CONNECTOR_PROVIDERS)[number];

type ConnectorSecret = { apiKey: string };
type ConnectorDefinition = {
  id: UserConnectorProvider;
  name: string;
  description: string;
  docsUrl: string;
  freeTier: "free-route" | "account-dependent" | "paid";
  freeTierNote: string;
  workDeskEnabled: boolean;
};

export const USER_CONNECTOR_CATALOG: ConnectorDefinition[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "একটি API key দিয়ে OpenRouter-এর free model route ব্যবহার করুন",
    docsUrl: "https://openrouter.ai/docs",
    freeTier: "free-route",
    freeTierNote: "openrouter/free route; model availability ও provider rate limits পরিবর্তন হতে পারে",
    workDeskEnabled: true,
  },
  {
    id: "gemini",
    name: "Google Gemini API",
    description: "Google AI Studio API key যাচাই ও সংরক্ষণ করুন",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    freeTier: "account-dependent",
    freeTierNote: "নিজের Google AI Studio project-এর quota ও billing প্রযোজ্য; generation-এর আগে প্রতিবার ব্যবহারকারীর খরচ-সম্মতি আবশ্যক",
    workDeskEnabled: true,
  },
  {
    id: "openai",
    name: "OpenAI API",
    description: "নিজের OpenAI API project সংযুক্ত করুন",
    docsUrl: "https://platform.openai.com/docs",
    freeTier: "paid",
    freeTierNote: "API usage billable হতে পারে; ChatGPT consumer plan API credit নয়",
    workDeskEnabled: false,
  },
  {
    id: "xai",
    name: "xAI API",
    description: "নিজের xAI API key সংযুক্ত করুন",
    docsUrl: "https://docs.x.ai",
    freeTier: "paid",
    freeTierNote: "API usage billable হতে পারে; Free-only WorkDesk execution-এ ব্যবহার করা হয় না",
    workDeskEnabled: false,
  },
];

let sqlClient: ReturnType<typeof postgres> | undefined;
function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("connector_database_unavailable");
  if (!sqlClient) {
    sqlClient = postgres(url, {
      max: 1,
      idle_timeout: 10,
      connect_timeout: 5,
      prepare: false,
      ssl: "require",
    });
  }
  return sqlClient;
}

function getEncryptionKey(): Buffer {
  const encoded = process.env.DSAI_CONNECTOR_ENCRYPTION_KEY;
  if (!encoded || !/^[a-f0-9]{64}$/i.test(encoded)) {
    throw Object.assign(new Error("connector_encryption_not_configured"), {
      code: "CONNECTOR_ENCRYPTION_NOT_CONFIGURED",
    });
  }
  const key = Buffer.from(encoded, "hex");
  if (key.length !== 32) {
    throw Object.assign(new Error("connector_encryption_not_configured"), {
      code: "CONNECTOR_ENCRYPTION_NOT_CONFIGURED",
    });
  }
  return key;
}

export type ConnectorOwner = { userId: number; provider: UserConnectorProvider };
type EncryptedConnectorSecret = { ciphertext: string; nonce: string; authTag: string; version?: 1 | 2 };

function connectorAAD(owner: ConnectorOwner): Buffer {
  if (!Number.isSafeInteger(owner.userId) || owner.userId <= 0 || !USER_CONNECTOR_PROVIDERS.includes(owner.provider)) throw new Error("connector_owner_invalid");
  return Buffer.from(JSON.stringify(["dsai-user-connector", 2, owner.userId, owner.provider]));
}

export function encryptConnectorSecret(value: ConnectorSecret, key = getEncryptionKey(), owner?: ConnectorOwner) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  if (owner) cipher.setAAD(connectorAAD(owner));
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return {
    ciphertext: ciphertext.toString("base64"),
    nonce: nonce.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    version: owner ? 2 as const : 1 as const,
  };
}

export function decryptConnectorSecret(
  encrypted: EncryptedConnectorSecret,
  key = getEncryptionKey(),
  owner?: ConnectorOwner,
): ConnectorSecret {
  const decode = (value: string) => { const bytes = Buffer.from(value, "base64"); if (bytes.toString("base64") !== value) throw new Error("connector_secret_invalid"); return bytes; };
  const nonce = decode(encrypted.nonce);
  const authTag = decode(encrypted.authTag);
  const ciphertext = decode(encrypted.ciphertext);
  if (nonce.length !== 12 || authTag.length !== 16 || ciphertext.length > 16_384) throw new Error("connector_secret_invalid");
  const version = encrypted.version ?? 1;
  if (version !== 1 && version !== 2) throw new Error("connector_secret_version_unsupported");
  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  if (version === 2) { if (!owner) throw new Error("connector_owner_required"); decipher.setAAD(connectorAAD(owner)); }
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
  let parsed: ConnectorSecret;
  try { parsed = JSON.parse(plaintext) as ConnectorSecret; } catch { throw new Error("connector_secret_invalid"); }
  if (typeof parsed.apiKey !== "string" || parsed.apiKey.length < 12 || parsed.apiKey.length > 4096) {
    throw new Error("connector_secret_invalid");
  }
  return parsed;
}

async function consumeConnectorAttempt(userId: number) {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / 60_000) * 60_000);
  const rows = await getSql().unsafe(
    "insert into private.user_connector_rate_limits (user_id, window_start, request_count) values ($1, $2, 1) " +
    "on conflict (user_id, window_start) do update set request_count = private.user_connector_rate_limits.request_count + 1 " +
    "where private.user_connector_rate_limits.request_count < 5 returning request_count",
    [userId, windowStart],
  );
  if (!rows.length) {
    throw Object.assign(new Error("এক মিনিটে সর্বোচ্চ ৫ বার connector connect/test করা যাবে।"), { code: "TOO_MANY_REQUESTS" });
  }
  // Opportunistic bounded retention; cleanup failure never blocks a valid request.
  if (now % (60 * 60 * 1000) < 60_000) {
    try { await getSql().unsafe("delete from private.user_connector_rate_limits where window_start < $1", [new Date(now - 24 * 60 * 60 * 1000)]); }
    catch { /* best-effort cleanup */ }
  }
}
function connectorEndpoint(provider: UserConnectorProvider) {
  switch (provider) {
    case "openrouter": return "https://openrouter.ai/api/v1/key";
    case "gemini": return "https://generativelanguage.googleapis.com/v1beta/models?pageSize=1";
    case "openai": return "https://api.openai.com/v1/models";
    case "xai": return "https://api.x.ai/v1/models";
  }
}

/** Uses metadata-only GET endpoints; no prompt, generation or billable inference is sent. */
export async function verifyConnectorCredential(
  provider: UserConnectorProvider,
  apiKey: string,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const key = apiKey.trim();
  if (key.length < 12 || key.length > 4096) {
    return { ok: false, code: "INVALID_KEY_FORMAT", message: "API key-এর দৈর্ঘ্য বা format সঠিক নয়।" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(connectorEndpoint(provider), {
      method: "GET",
      headers: provider === "gemini"
        ? { "x-goog-api-key": key, accept: "application/json" }
        : { authorization: `Bearer ${key}`, accept: "application/json" },
      signal: controller.signal,
      redirect: "error",
      cache: "no-store",
    });
    if (response.ok) return { ok: true };
    if (response.status === 401 || response.status === 403) {
      return { ok: false, code: "CREDENTIAL_REJECTED", message: "Provider key গ্রহণ করেনি। Key ও প্রয়োজনীয় permission যাচাই করুন।" };
    }
    if (response.status === 429) {
      return { ok: false, code: "PROVIDER_RATE_LIMITED", message: "Provider rate limit দিয়েছে। কিছুক্ষণ পর আবার পরীক্ষা করুন।" };
    }
    if (response.status >= 500) {
      return { ok: false, code: "PROVIDER_UNAVAILABLE", message: "Provider সাময়িকভাবে unavailable। পরে আবার চেষ্টা করুন।" };
    }
    return { ok: false, code: "PROVIDER_CHECK_FAILED", message: "Provider connection যাচাই করা যায়নি। Key permission ও provider documentation পরীক্ষা করুন।" };
  } catch (error) {
    const code = error instanceof Error && error.name === "AbortError" ? "PROVIDER_TIMEOUT" : "PROVIDER_NETWORK_ERROR";
    return {
      ok: false,
      code,
      message: code === "PROVIDER_TIMEOUT"
        ? "Provider response দিতে ৮ সেকেন্ডের বেশি সময় নিয়েছে।"
        : "Provider-এর সঙ্গে নিরাপদ সংযোগ স্থাপন করা যায়নি।",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function listUserConnectors(userId: number) {
  const rows = await getSql()<
    {
      provider: UserConnectorProvider;
      status: "connected" | "degraded";
      secret_hint: string;
      last_tested_at: Date | null;
      created_at: Date;
      updated_at: Date;
      last_error_code: string | null;
    }[]
  >`
    select provider, status, secret_hint, last_tested_at, created_at, updated_at, last_error_code
    from private.user_connector_credentials
    where user_id = ${userId}
    order by created_at desc
  `;
  const byProvider = new Map(rows.map(row => [row.provider, row]));
  return USER_CONNECTOR_CATALOG.map(definition => {
    const saved = byProvider.get(definition.id);
    return {
      ...definition,
      connected: Boolean(saved && saved.status === "connected"),
      status: saved?.status ?? "not_connected",
      keyHint: saved ? `•••• ${saved.secret_hint}` : null,
      lastTestedAt: saved?.last_tested_at ?? null,
      lastErrorCode: saved?.last_error_code ?? null,
    };
  });
}

/**
 * DSAI's Free-only policy permits user-supplied OpenRouter free-route credentials only.
 * Fail closed before any credential is sent to a provider or any rate-limit quota is used.
 */
export function isConnectorAllowedByFreeOnlyPolicy(provider: UserConnectorProvider): boolean {
  return provider === "openrouter";
}

export function isConnectorAllowedForWorkDesk(provider: UserConnectorProvider): boolean {
  return provider === "openrouter" || provider === "gemini";
}

export function assertConnectorAllowedForWorkDesk(provider: UserConnectorProvider): void {
  if (!isConnectorAllowedForWorkDesk(provider)) {
    throw Object.assign(
      new Error("এই API connector DSAI-এর Free-only নীতিতে অনুমোদিত নয়।"),
      { code: "PAID_PROVIDER_BLOCKED" },
    );
  }
}

export async function connectUserConnector(
  userId: number,
  input: { provider: UserConnectorProvider; apiKey: string },
) {
  // Enforce the product cost policy before credential verification or persistence.
  assertConnectorAllowedForWorkDesk(input.provider);
  // Fail before sending a credential to any provider if secure storage is unavailable.
  const encryptionKey = getEncryptionKey();
  await consumeConnectorAttempt(userId);
  const apiKey = input.apiKey.trim();
  const verification = await verifyConnectorCredential(input.provider, apiKey);
  if (!verification.ok) {
    throw Object.assign(new Error(verification.message), {
      code: "CONNECTOR_VERIFICATION_FAILED",
      reason: verification.code,
    });
  }
  const encrypted = encryptConnectorSecret({ apiKey }, encryptionKey, { userId, provider: input.provider });
  const hint = apiKey.slice(-4);
  await getSql()`
    insert into private.user_connector_credentials
      (user_id, provider, secret_ciphertext, secret_nonce, secret_auth_tag,
       secret_version, secret_hint, status, last_tested_at, last_error_code, updated_at)
    values
      (${userId}, ${input.provider}, ${encrypted.ciphertext}, ${encrypted.nonce},
       ${encrypted.authTag}, ${encrypted.version ?? 1}, ${hint}, 'connected', now(), null, now())
    on conflict (user_id, provider) do update set
      secret_ciphertext = excluded.secret_ciphertext,
      secret_nonce = excluded.secret_nonce,
      secret_auth_tag = excluded.secret_auth_tag,
      secret_version = excluded.secret_version,
      secret_hint = excluded.secret_hint,
      status = 'connected',
      last_tested_at = now(),
      last_error_code = null,
      updated_at = now()
  `;
  return { provider: input.provider, connected: true as const, keyHint: `•••• ${hint}` };
}

export async function testUserConnector(userId: number, provider: UserConnectorProvider) {
  // Legacy paid credentials may be disconnected, but never tested or used.
  assertConnectorAllowedForWorkDesk(provider);
  await consumeConnectorAttempt(userId);
  const rows = await getSql()<
    { secret_ciphertext: string; secret_nonce: string; secret_auth_tag: string; secret_version: number }[]
  >`
    select secret_ciphertext, secret_nonce, secret_auth_tag, secret_version
    from private.user_connector_credentials
    where user_id = ${userId} and provider = ${provider}
    limit 1
  `;
  const row = rows[0];
  if (!row) {
    throw Object.assign(new Error("connector_not_connected"), { code: "NOT_FOUND" });
  }
  let verification: Awaited<ReturnType<typeof verifyConnectorCredential>>;
  try {
    const secret = decryptConnectorSecret({
      ciphertext: row.secret_ciphertext,
      nonce: row.secret_nonce,
      authTag: row.secret_auth_tag,
      version: row.secret_version as 1 | 2,
    }, getEncryptionKey(), { userId, provider });
    verification = await verifyConnectorCredential(provider, secret.apiKey);
  } catch {
    verification = { ok: false, code: "CONNECTOR_SECRET_UNREADABLE", message: "সংরক্ষিত credential decrypt করা যায়নি। নিরাপত্তার জন্য আবার Connect করুন।" };
  }
  await getSql()`
    update private.user_connector_credentials
    set status = ${verification.ok ? "connected" : "degraded"},
        last_tested_at = now(),
        last_error_code = ${verification.ok ? null : verification.code},
        updated_at = now()
    where user_id = ${userId} and provider = ${provider}
  `;
  return {
    provider,
    connected: verification.ok,
    status: verification.ok ? "connected" as const : "degraded" as const,
    code: verification.ok ? null : verification.code,
    message: verification.ok ? "Provider credential সফলভাবে যাচাই হয়েছে।" : verification.message,
  };
}

export async function disconnectUserConnector(userId: number, provider: UserConnectorProvider) {
  const result = await getSql()`
    delete from private.user_connector_credentials
    where user_id = ${userId} and provider = ${provider}
    returning provider
  `;
  return { provider, disconnected: result.length > 0 };
}

/** Only an explicit, user-owned OpenRouter connection may enter the no-charge WorkDesk route. */
export async function getUserWorkDeskConnectorKey(userId: number, provider: "openrouter" | "gemini"): Promise<string> {
  if (provider !== "openrouter" && provider !== "gemini") {
    throw Object.assign(new Error("connector_not_allowed_by_free_only_policy"), {
      code: "PAID_PROVIDER_BLOCKED",
    });
  }
  const rows = await getSql()<
    { secret_ciphertext: string; secret_nonce: string; secret_auth_tag: string }[]
  >`
    select secret_ciphertext, secret_nonce, secret_auth_tag
    from private.user_connector_credentials
    where user_id = ${userId} and provider = ${provider} and status = 'connected'
    limit 1
  `;
  const row = rows[0];
  if (!row) {
    throw Object.assign(new Error("connector_not_connected"), { code: "CONNECTOR_NOT_CONNECTED" });
  }
  return decryptConnectorSecret({
    ciphertext: row.secret_ciphertext,
    nonce: row.secret_nonce,
    authTag: row.secret_auth_tag,
    version: row.secret_version as 1 | 2,
  }, getEncryptionKey(), { userId, provider }).apiKey;
}
