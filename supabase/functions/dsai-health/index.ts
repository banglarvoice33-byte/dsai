import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function getServerKey(): string | null {
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeysRaw) {
    try {
      const keys = JSON.parse(secretKeysRaw) as Record<string, string>;
      const key = keys.default;
      if (typeof key === "string" && key.length > 20) return key;
    } catch {
      // Fall through to the legacy service-role variable.
    }
  }
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return legacy && legacy.length > 20 ? legacy : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return Response.json({ error: "method_not_allowed" }, {
      status: 405,
      headers: { ...corsHeaders, Allow: "GET, OPTIONS", "Cache-Control": "no-store" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = getServerKey();
  if (!supabaseUrl || !secretKey) {
    return Response.json({ status: "degraded", service: "dsai-health", database: "not_configured" }, {
      status: 503,
      headers: { ...corsHeaders, "Cache-Control": "no-store" },
    });
  }

  try {
    const response = await fetch(new URL("/rest/v1/rpc/dsai_healthcheck", supabaseUrl), {
      method: "POST",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      signal: AbortSignal.timeout(5000),
    });
    const result = response.ok ? await response.json().catch(() => null) : null;
    const healthy = response.ok && result === true;
    return Response.json({
      status: healthy ? "ok" : "degraded",
      service: "dsai-health",
      database: healthy ? "reachable" : "unavailable",
      timestamp: new Date().toISOString(),
    }, {
      status: healthy ? 200 : 503,
      headers: { ...corsHeaders, "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ status: "degraded", service: "dsai-health", database: "unavailable" }, {
      status: 503,
      headers: { ...corsHeaders, "Cache-Control": "no-store" },
    });
  }
});
