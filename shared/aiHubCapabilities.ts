/**
 * AI Hub remains a broad provider directory, but connector setup is exposed only
 * for providers explicitly backed by the current Free-only execution policy.
 * Add a provider here only after its free API quota, server route, and tests are verified.
 */
export const AI_HUB_CONNECTOR_SETUP_IDS = ["openrouter"] as const;

export function isAiHubConnectorSetupAvailable(providerId: string): boolean {
  return AI_HUB_CONNECTOR_SETUP_IDS.some(allowedProviderId => allowedProviderId === providerId);
}
