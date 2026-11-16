import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  assertFreeImageModelAvailable,
  assertZeroCostUsage,
} from "./imagePolicy.ts";

const allowedOrigin = Deno.env.get("DSAI_ALLOWED_ORIGIN") ?? "https://dsai-one.vercel.app";
const cors = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
type ImageResult = { bytes: Uint8Array; mime: "image/png" | "image/jpeg" | "image/webp"; model: string; provider: string; cost: number | null };
function decodeBase64(value: string): Uint8Array {
  const clean = value.replace(/^data:image\/[^;]+;base64,/i, "");
  const binary = atob(clean);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
async function secret(admin: AdminClient, name: string): Promise<string> {
  const { data, error } = await admin.rpc("dsai_get_provider_secret", { p_secret_name: name });
  if (error || typeof data !== "string" || !data.trim()) throw new Error("provider_secret_missing:" + name);
  return data.trim();
}
type AdminClient = ReturnType<typeof createClient<any>>;

const FREE_IMAGE_MODEL = "recraft/recraft-v4.1-flash-v2:free";
const freeAspectRatios: Record<string, string> = {
  "1:1": "1:1",
  "3:2": "4:3",
  "2:3": "3:4",
  "16:9": "16:9",
  "9:16": "9:16",
};

async function generateOpenRouter(
  admin: ReturnType<typeof createClient>,
  prompt: string,
  aspectRatio: string,
): Promise<ImageResult> {
  assertFreeImageModelAvailable(FREE_IMAGE_MODEL);
  const key = await secret(admin, "OPENROUTER_API_KEY");
  const response = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      "HTTP-Referer": allowedOrigin,
      "X-Title": "DSAI",
    },
    body: JSON.stringify({
      model: FREE_IMAGE_MODEL,
      prompt,
      aspect_ratio: freeAspectRatios[aspectRatio] ?? "1:1",
      n: 1,
      provider: { allow_fallbacks: false },
    }),
    signal: AbortSignal.timeout(60000),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("openrouter_image_http_" + response.status);

  const item = body?.data?.[0] ?? {};
  if (typeof item.b64_json !== "string" || !item.b64_json) {
    throw new Error("openrouter_image_payload_missing");
  }

  // Missing usage metadata is not evidence of a free request. Fail closed.
  const reportedCost = assertZeroCostUsage(body?.usage);

  const mimeValue = String(item.media_type ?? "image/png").toLowerCase();
  if (!["image/png", "image/jpeg", "image/webp"].includes(mimeValue)) {
    throw new Error("unsupported_image_type");
  }
  const bytes = decodeBase64(item.b64_json);
  return {
    bytes,
    mime: mimeValue as ImageResult["mime"],
    model: FREE_IMAGE_MODEL,
    provider: "openrouter",
    cost: reportedCost,
  };
}

async function generateWithFallback(
  admin: ReturnType<typeof createClient>,
  prompt: string,
  aspectRatio: string,
): Promise<ImageResult> {
  // Intentionally no paid-provider fallback: if the free endpoint is unavailable,
  // return a controlled error instead of spending money.
  try {
    const result = await generateOpenRouter(admin, prompt, aspectRatio);
    if (result.bytes.byteLength < 1000 || result.bytes.byteLength > 10 * 1024 * 1024) {
      throw new Error("image_size_out_of_range");
    }
    return result;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    console.error("DSAI free image provider failed", reason);
    throw new Error("free_image_provider_failed:" + reason);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "method_not_allowed" });
  const origin = req.headers.get("Origin");
  if (origin && origin !== allowedOrigin) return reply(403, { error: "origin_not_allowed" });
  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return reply(401, { error: "authentication_required" });
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return reply(503, { error: "backend_not_configured" });
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return reply(401, { error: "invalid_or_expired_session" });
  const isAnonymous = authData.user.is_anonymous === true;
  if (!isAnonymous && (!authData.user.email || !authData.user.email_confirmed_at)) {
    return reply(403, { error: "verified_email_required" });
  }
  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return reply(400, { error: "invalid_json" }); }
  const authUser = authData.user;
  const identity = {
    openId: "supabase:" + authUser.id, email: authUser.email ?? null,
    name: (authUser.user_metadata?.full_name as string | undefined) ?? (authUser.email?.split("@")[0] ?? "DSAI Guest"),
    loginMethod: isAnonymous ? "supabase-anonymous" : "supabase", lastSignedIn: new Date().toISOString(),
  };
  const { data: appUser, error: userError } = await admin.from("users").upsert(identity, { onConflict: "openId" }).select("id").single();
  if (userError || !appUser) return reply(500, { error: "user_profile_unavailable" });
  if (payload.action === "list") {
    const { data, error } = await admin.from("generated_images").select("id,prompt,model,mime_type,byte_size,created_at,storage_path").eq("user_id", appUser.id).order("created_at", { ascending: false }).limit(30);
    if (error) return reply(500, { error: "image_history_unavailable" });
    const images = [];
    for (const item of data ?? []) {
      const { data: signed } = await admin.storage.from("dsai-generated-images").createSignedUrl(item.storage_path, 90);
      const { storage_path: _privatePath, ...publicItem } = item;
      images.push({ ...publicItem, preview_url: signed?.signedUrl ?? null });
    }
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const [{ data: usage }, { count: usersToday }] = await Promise.all([
      admin.from("image_generation_usage").select("request_count").eq("user_id", appUser.id).eq("usage_date", today).maybeSingle(),
      admin.from("image_generation_daily_users").select("user_id", { count: "exact", head: true }).eq("usage_date", today),
    ]);
    const usedToday = usage?.request_count ?? 0;
    return reply(200, { images, quota: { used_today: usedToday, remaining_today: Math.max(0, 2 - usedToday), daily_limit: 2, users_today: usersToday ?? 0, global_user_limit: 500 } });
  }
  if (payload.action === "download") {
    const imageId = typeof payload.imageId === "string" ? payload.imageId : "";
    const { data: item, error } = await admin.from("generated_images").select("id,storage_path").eq("id", imageId).eq("user_id", appUser.id).single();
    if (error || !item) return reply(404, { error: "image_not_found" });
    const { data: signed, error: signedError } = await admin.storage.from("dsai-generated-images").createSignedUrl(item.storage_path, 120, { download: true });
    if (signedError || !signed?.signedUrl) return reply(500, { error: "download_link_unavailable" });
    return reply(200, { download_url: signed.signedUrl });
  }
  if (payload.action !== "generate") return reply(400, { error: "unsupported_action" });
  const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  if (prompt.length < 3 || prompt.length > 4000) return reply(400, { error: "prompt_must_be_3_to_4000_characters" });
  const aspectRatio = ["1:1", "3:2", "2:3", "16:9", "9:16"].includes(String(payload.aspectRatio)) ? String(payload.aspectRatio) : "1:1";
  const { data: reserved, error: reserveError } = await admin.rpc("dsai_reserve_image_generation", { p_user_id: appUser.id });
  const reservation = reserved?.[0];
  if (reserveError || !reservation?.allowed) {
    const reason = reserveError ? "quota_service_unavailable" : (reservation?.reason ?? "daily_limit_reached");
    return reply(reserveError ? 503 : 429, {
      error: reason,
      daily_limit: 2,
      used_today: reservation?.used_today ?? 2,
      provider_daily_limit: 40,
      provider_minute_limit: 10,
      global_user_limit: 500,
    });
  }
  let uploadedPath: string | null = null;
  let insertedId: string | null = null;
  try {
    const result = await generateWithFallback(admin, prompt, aspectRatio);
    const id = crypto.randomUUID();
    insertedId = id;
    uploadedPath = appUser.id + "/" + id + (result.mime === "image/jpeg" ? ".jpg" : result.mime === "image/webp" ? ".webp" : ".png");
    const { error: uploadError } = await admin.storage.from("dsai-generated-images").upload(uploadedPath, result.bytes, { contentType: result.mime, upsert: false, cacheControl: "3600" });
    if (uploadError) throw new Error("image_storage_failed");
    const { error: insertError } = await admin.from("generated_images").insert({ id, user_id: appUser.id, prompt, model: result.model, storage_path: uploadedPath, mime_type: result.mime, byte_size: result.bytes.byteLength, status: "completed", provider_cost_usd: result.cost });
    if (insertError) throw new Error("image_record_failed");
    const { data: signed, error: signedError } = await admin.storage.from("dsai-generated-images").createSignedUrl(uploadedPath, 120, { download: true });
    if (signedError || !signed?.signedUrl) throw new Error("download_link_unavailable");
    const { error: finalizeError } = await admin.rpc("dsai_finalize_image_generation", { p_user_id: appUser.id, p_usage_date: reservation.usage_date });
    if (finalizeError) throw new Error("quota_finalize_failed");
    return reply(200, { id, prompt, model: result.model, provider: result.provider, mime_type: result.mime, byte_size: result.bytes.byteLength, provider_cost_usd: result.cost, download_url: signed.signedUrl, daily_limit: 2, used_today: reservation.used_today, global_user_limit: 500 });
  } catch (error) {
    if (insertedId) await admin.from("generated_images").delete().eq("id", insertedId).eq("user_id", appUser.id);
    if (uploadedPath) await admin.storage.from("dsai-generated-images").remove([uploadedPath]);
    await admin.rpc("dsai_refund_image_generation", { p_user_id: appUser.id, p_usage_date: reservation.usage_date });
    const message = error instanceof Error ? error.message : "generation_failed";
    const code = message;
    const status = message.includes("provider_secret_missing:OPENROUTER_API_KEY")
      ? 503
      : message.includes("openrouter_image_http_429")
        ? 429
        : 502;
    return reply(status, { error: code, provider_daily_limit: 40 });
  }
});
