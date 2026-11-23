import { getUserWorkDeskConnectorKey } from "./userConnectors";

type OpenRouterKeyReader = (userId: number, provider: "openrouter") => Promise<string>;

/**
 * Return the signed-in user's OpenRouter key when connected. Only the explicit
 * not-connected condition falls back to the server Vault credential; database,
 * encryption, and authorization failures must never be silently ignored.
 */
export async function getOptionalUserOpenRouterKey(
  userId: number,
  readKey: OpenRouterKeyReader = getUserWorkDeskConnectorKey,
): Promise<string | undefined> {
  try {
    return await readKey(userId, "openrouter");
  } catch (error) {
    if (
      typeof error === "object"
      && error !== null
      && "code" in error
      && (error as { code?: unknown }).code === "CONNECTOR_NOT_CONNECTED"
    ) {
      return undefined;
    }
    throw error;
  }
}
