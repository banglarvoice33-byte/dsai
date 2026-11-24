/**
 * Connector setup is exposed only for providers with an authenticated, owner-scoped
 * credential lifecycle and a verified WorkDesk execution path. Gemini is personal
 * BYOK and requires explicit provider-billing consent; it is not a DSAI free route.
 */
export const AI_HUB_CONNECTOR_SETUP_IDS = ["openrouter", "gemini"] as const;

export function isAiHubConnectorSetupAvailable(providerId: string): boolean {
  return AI_HUB_CONNECTOR_SETUP_IDS.some(allowedProviderId => allowedProviderId === providerId);
}
