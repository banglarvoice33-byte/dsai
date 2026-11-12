import { sanitizeOAuthReturnTo } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Keep one compatibility entry point for older buttons while routing every
// new login attempt through the Supabase Auth page.
export const startLogin = (returnTo?: string) => {
  const target = sanitizeOAuthReturnTo(returnTo || (window.location.pathname + window.location.search));
  window.location.href = `/auth/login?returnTo=${encodeURIComponent(target)}`;
};
