/**
 * Prevent direct built-in Forge API calls from bypassing the platform's
 * free-only provider policy. Enable only after its billing boundary is verified.
 */
export function assertForgeProviderAllowed(feature: string): void {
  const freeOnlyMode = process.env.AI_FREE_ONLY_MODE === "true";
  const freeTierConfirmed = process.env.AI_FORGE_FREE_TIER_CONFIRMED === "true";
  if (freeOnlyMode && !freeTierConfirmed) {
    throw Object.assign(
      new Error("forge_provider_blocked_by_free_only_mode:" + feature),
      { code: "PAID_PROVIDER_BLOCKED", status: 503 },
    );
  }
}
