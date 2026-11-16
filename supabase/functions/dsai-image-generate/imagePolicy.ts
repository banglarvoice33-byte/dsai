export const FREE_IMAGE_MODEL_RETIREMENT_DATE = "2026-11-28";

export function assertFreeImageModelAvailable(model: string, now = new Date()): void {
  if (!model.endsWith(":free")) {
    throw new Error("free_image_model_required");
  }
  const retirement = new Date(FREE_IMAGE_MODEL_RETIREMENT_DATE + "T00:00:00.000Z");
  if (now >= retirement) {
    throw new Error("free_image_model_retired");
  }
}

/**
 * Fail closed: never infer zero cost when OpenRouter omits its usage metadata.
 * The image is persisted only when the provider explicitly reports cost=0.
 */
export function assertZeroCostUsage(usage: unknown): number {
  if (!usage || typeof usage !== "object" || !("cost" in usage)) {
    throw new Error("free_image_cost_metadata_missing");
  }
  const cost = Number((usage as { cost: unknown }).cost);
  if (!Number.isFinite(cost) || cost !== 0) {
    throw new Error("free_image_model_reported_nonzero_cost");
  }
  return cost;
}
