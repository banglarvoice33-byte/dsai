export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

export const OAUTH_STATE_COOKIE = "__Host-oauth_state";
export type OAuthState = { redirectUri: string; nonce?: string; returnTo?: string };

export const AUTH_RETURN_TO_DEFAULT = "/workspace";

/** Reject open redirects and keep post-auth navigation inside the application. */
export const sanitizeOAuthReturnTo = (value: string | undefined | null): string => {
  if (typeof value !== "string" || value.length === 0 || !value.startsWith("/")
    || value.startsWith("//") || value.includes("\\")
    || Array.from(value).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) {
    return AUTH_RETURN_TO_DEFAULT;
  }
  try {
    const base = "https://dsai.invalid";
    const destination = new URL(value, base);
    if (destination.origin !== base || destination.pathname === "/api" || destination.pathname.startsWith("/api/")) {
      return AUTH_RETURN_TO_DEFAULT;
    }
    return destination.pathname + destination.search + destination.hash;
  } catch {
    return AUTH_RETURN_TO_DEFAULT;
  }
};

export const encodeOAuthState = (state: OAuthState): string => btoa(JSON.stringify(state));

export const decodeOAuthState = (state: string): OAuthState => {
  let decoded: string;
  try { decoded = atob(state); }
  catch { return { redirectUri: "" }; }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
    // Legacy links encoded only the redirect URI.
  }
  return { redirectUri: decoded };
};
