import {
  assertFreeImageModelAvailable,
  assertZeroCostUsage,
} from "./imagePolicy.ts";
import {
  toPublicImageError,
  toPublicImageQuota,
  toPublicImageRecord,
} from "./publicResponse.ts";

Deno.test("accepts an explicitly free image model before retirement", () => {
  assertFreeImageModelAvailable(
    "recraft/recraft-v4.1-flash-v2:free",
    new Date("2026-11-27T23:59:59.000Z"),
  );
});

Deno.test("blocks non-free image model identifiers", () => {
  let message = "";
  try {
    assertFreeImageModelAvailable("recraft/recraft-v4.1-flash-v2");
  } catch (error) {
    message = error instanceof Error ? error.message : "";
  }
  if (message !== "free_image_model_required") throw new Error("non-free model was not blocked");
});

Deno.test("blocks the model on its announced retirement date", () => {
  let message = "";
  try {
    assertFreeImageModelAvailable(
      "recraft/recraft-v4.1-flash-v2:free",
      new Date("2026-11-28T00:00:00.000Z"),
    );
  } catch (error) {
    message = error instanceof Error ? error.message : "";
  }
  if (message !== "free_image_model_retired") throw new Error("retired model was not blocked");
});

Deno.test("accepts explicit zero-cost metadata", () => {
  if (assertZeroCostUsage({ cost: 0 }) !== 0) throw new Error("expected zero cost");
  if (assertZeroCostUsage({ cost: "0" }) !== 0) throw new Error("expected string zero cost");
});

Deno.test("rejects missing, malformed, or non-zero cost metadata", () => {
  for (const usage of [undefined, null, {}, { cost: "unknown" }, { cost: 0.0001 }]) {
    let failed = false;
    try {
      assertZeroCostUsage(usage);
    } catch {
      failed = true;
    }
    if (!failed) throw new Error("unsafe cost metadata was accepted");
  }
});

Deno.test("public image records omit provider, model, cost and storage metadata", () => {
  const result = toPublicImageRecord({
    id: "image-1",
    prompt: "test prompt",
    model: "private-model-name",
    provider: "private-provider-name",
    provider_cost_usd: 0,
    storage_path: "private/user/path.png",
    mime_type: "image/png",
    byte_size: 1234,
    created_at: "2026-11-17T00:00:00.000Z",
  }, "https://example.invalid/signed-image");
  const keys = Object.keys(result).sort().join(",");
  if (keys !== "byte_size,created_at,id,mime_type,preview_url,prompt") {
    throw new Error("public image response contains internal metadata");
  }
  if (JSON.stringify(result).includes("private-provider-name") || JSON.stringify(result).includes("private-model-name")) {
    throw new Error("internal provider metadata leaked");
  }
});

Deno.test("public image quota exposes only the user's daily allowance", () => {
  const result = toPublicImageQuota(1);
  if (result.used_today !== 1 || result.remaining_today !== 1 || result.daily_limit !== 2) {
    throw new Error("public quota values are incorrect");
  }
  if ("global_user_limit" in result || "users_today" in result) {
    throw new Error("global quota details leaked");
  }
});

Deno.test("internal provider errors are converted to safe public error codes", () => {
  const cases: Array<[string, string]> = [
    ["provider_secret_missing:OPENROUTER_API_KEY", "image_generation_unavailable"],
    ["free_image_provider_failed:openrouter_image_http_500", "image_generation_unavailable"],
    ["openrouter_image_http_429", "image_generation_busy"],
    ["provider_minute_limit", "image_generation_busy"],
    ["global_daily_limit", "daily_limit_reached"],
    ["provider_daily_limit", "daily_limit_reached"],
    ["quota_service_unavailable", "service_unavailable"],
  ];
  for (const [input, expected] of cases) {
    if (toPublicImageError(input) !== expected) {
      throw new Error("unsafe public error mapping for " + input);
    }
  }
});
