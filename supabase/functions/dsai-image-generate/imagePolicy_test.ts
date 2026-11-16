import {
  assertFreeImageModelAvailable,
  assertZeroCostUsage,
} from "./imagePolicy.ts";

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
