import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
const dimensions: Record<string, string> = { "1:1": "1024x1024", "3:2": "1536x1024", "2:3": "1024x1536", "16:9": "1536x864", "9:16": "864x1536" };
function decodeBase64(value: string): Uint8Array {
  const clean = value.replace(/^data:image\/[^;]+;base64,/i, "");
  const binary = atob(clean);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
async function secret(admin: ReturnType<typeof createClient>, name: string): Promise<string> {
  const { data, error } = await admin.rpc("dsai_get_provider_secret", { p_secret_name: name });
  if (error || typeof data !== "string" || !data.trim()) throw new Error("provider_secret_missing:" + name);
  return data.trim();
}
async function fetchImageUrl(url: string): Promise<{bytes: Uint8Array; mime: ImageResult["mime"]}> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== "apihub.agnes-ai.com") throw new Error("agnes_image_url_rejected");
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error("agnes_image_download_failed");
  const mime = (response.headers.get("content-type")?.split(";")[0] ?? "image/png") as ImageResult["mime"];
  if (!["image/png", "image/jpeg", "image/webp"].includes(mime)) throw new Error("unsupported_image_type");
  return { bytes: new Uint8Array(await response.arrayBuffer()), mime };
}
async function generateAgnes(admin: ReturnType<typeof createClient>, prompt: string, size: string): Promise<ImageResult> {
  const key = await secret(admin, "AGNES_API_KEY");
  const response = await fetch("https://apihub.agnes-ai.com/v1/images/generations", {
    method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "agnes-image-2.1-flash", prompt, n: 1, size, return_base64: true }),
    signal: AbortSignal.timeout(60000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("agnes_http_" + response.status);
  const item = body?.data?.[0] ?? body?.images?.[0] ?? {};
  let bytes: Uint8Array, mime: ImageResult["mime"] = "image/png";
  const encoded = item.b64_json ?? item.base64 ?? item.image;
  if (typeof encoded === "string") bytes = decodeBase64(encoded);
  else if (typeof item.url === "string") ({ bytes, mime } = await fetchImageUrl(item.url));
  else throw new Error("agnes_no_image_payload");
  return { bytes, mime, model: "agnes-image-2.1-flash", provider: "agnes", cost: typeof body?.usage?.cost === "number" ? body.usage.cost : null };
}
async function generateCloudflare(admin: ReturnType<typeof createClient>, prompt: string, aspectRatio: string): Promise<ImageResult> {
  const [account, token] = await Promise.all([secret(admin, "CLOUDFLARE_ACCOUNT_ID"), secret(admin, "CLOUDFLARE_API_TOKEN")]);
  const [w, h] = dimensions[aspectRatio].split("x").map(Number);
  const response = await fetch("https://api.cloudflare.com/client/v4/accounts/" + encodeURIComponent(account) + "/ai/run/@cf/black-forest-labs/flux-1-schnell", {
    method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, width: w, height: h, steps: 4 }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error("cloudflare_http_" + response.status);
  const body = await response.json().catch(() => ({}));
  const encoded = body?.result?.image ?? body?.image;
  if (typeof encoded !== "string") throw new Error("cloudflare_no_image_payload");
  return { bytes: decodeBase64(encoded), mime: "image/jpeg", model: "@cf/black-forest-labs/flux-1-schnell", provider: "cloudflare", cost: null };
}
async function generateWithFallback(admin: ReturnType<typeof createClient>, prompt: string, aspectRatio: string): Promise<ImageResult> {
  const attempts: Array<[string, () => Promise<ImageResult>]> = [
    ["agnes", () => generateAgnes(admin, prompt, dimensions[aspectRatio])],
    ["cloudflare", () => generateCloudflare(admin, prompt, aspectRatio)],
  ];
  const failures: string[] = [];
  for (const [name, run] of attempts) {
    try {
      const result = await run();
      if (result.bytes.byteLength < 1000 || result.bytes.byteLength > 10 * 1024 * 1024) throw new Error("image_size_out_of_range");
      return result;
    } catch (error) {
      failures.push(name + ":" + (error instanceof Error ? error.message : "unknown"));
      console.error("DSAI image provider failed", name, error);
    }
  }
  throw new Error("all_image_providers_failed:" + failures.join("|"));
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
  if (authData.user.is_anonymous || !authData.user.email || !authData.user.email_confirmed_at) {
    return reply(403, { error: "verified_email_required" });
  }
  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return reply(400, { error: "invalid_json" }); }
  const authUser = authData.user;
  const identity = {
    openId: "supabase:" + authUser.id, email: authUser.email ?? null,
    name: (authUser.user_metadata?.full_name as string | undefined) ?? (authUser.email?.split("@")[0] ?? "DSAI Guest"),
    loginMethod: "supabase", lastSignedIn: new Date().toISOString(),
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
    return reply(reserveError ? 503 : 429, { error: reason, daily_limit: 2, used_today: reservation?.used_today ?? 2, global_user_limit: 500 });
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
    const code = message.startsWith("all_image_providers_failed") ? "all_providers_failed" : message;
    const status = code === "provider_secret_missing:AGNES_API_KEY" ? 503 : code === "all_providers_failed" ? 502 : 502;
    return reply(status, { error: code });
  }
});
