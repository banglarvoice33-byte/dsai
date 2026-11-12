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
  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return reply(400, { error: "invalid_json" }); }
  const authUser = authData.user;
  const identity = {
    openId: "supabase:" + authUser.id,
    email: authUser.email ?? null,
    name: (authUser.user_metadata?.full_name as string | undefined) ?? (authUser.email?.split("@")[0] ?? "DSAI Guest"),
    loginMethod: "supabase",
    lastSignedIn: new Date().toISOString(),
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
    return reply(200, { images });
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
  if (reserveError || !reserved?.[0]?.allowed) return reply(reserveError ? 503 : 429, { error: reserveError ? "quota_service_unavailable" : "daily_limit_reached", daily_limit: 3, used_today: reserved?.[0]?.used_today ?? 3 });

  let uploadedPath: string | null = null;
  try {
    const { data: key, error: keyError } = await admin.rpc("dsai_get_openrouter_key");
    if (keyError || typeof key !== "string" || !key) throw new Error("provider_not_configured");
    const providerResponse = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", "HTTP-Referer": allowedOrigin, "X-Title": "DSAI Image Studio" },
      body: JSON.stringify({ model: "bytedance-seed/seedream-4.5", prompt, n: 1, aspect_ratio: aspectRatio, resolution: "1K", output_format: "png" }),
      signal: AbortSignal.timeout(90000),
    });
    const providerBody = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok) throw new Error(providerResponse.status === 402 ? "provider_balance_required" : providerResponse.status === 429 ? "provider_rate_limited" : "provider_generation_failed");
    const encoded = providerBody?.data?.[0]?.b64_json;
    if (typeof encoded !== "string" || !encoded) throw new Error("provider_returned_no_image");
    const binary = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    if (binary.byteLength < 1000 || binary.byteLength > 10 * 1024 * 1024) throw new Error("image_size_out_of_range");
    const id = crypto.randomUUID();
    uploadedPath = appUser.id + "/" + id + ".png";
    const { error: uploadError } = await admin.storage.from("dsai-generated-images").upload(uploadedPath, binary, { contentType: "image/png", upsert: false, cacheControl: "3600" });
    if (uploadError) throw new Error("image_storage_failed");
    const cost = typeof providerBody?.usage?.cost === "number" ? providerBody.usage.cost : null;
    const { error: insertError } = await admin.from("generated_images").insert({ id, user_id: appUser.id, prompt, model: "bytedance-seed/seedream-4.5", storage_path: uploadedPath, mime_type: "image/png", byte_size: binary.byteLength, status: "completed", provider_cost_usd: cost });
    if (insertError) throw new Error("image_record_failed");
    const { data: signed, error: signedError } = await admin.storage.from("dsai-generated-images").createSignedUrl(uploadedPath, 120, { download: true });
    if (signedError || !signed?.signedUrl) throw new Error("download_link_unavailable");
    return reply(200, { id, prompt, model: "bytedance-seed/seedream-4.5", mime_type: "image/png", byte_size: binary.byteLength, provider_cost_usd: cost, download_url: signed.signedUrl });
  } catch (error) {
    if (uploadedPath) await admin.storage.from("dsai-generated-images").remove([uploadedPath]);
    await admin.rpc("dsai_refund_image_generation", { p_user_id: appUser.id });
    const code = error instanceof Error ? error.message : "generation_failed";
    const status = code === "provider_not_configured" ? 503 : code === "provider_balance_required" ? 402 : code === "provider_rate_limited" ? 429 : 502;
    return reply(status, { error: code });
  }
});
