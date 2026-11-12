const SUPABASE_URL = "https://wleytsrflhboyevhigiu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsZXl0c3JmbGhib3lldmhpZ2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzI0OTQsImV4cCI6MjEwMDU0ODQ5NH0.mB3QDgUREz_2Knht0V8TU0TdV8QP2C6YEkaWk5LB2-U"; 
const SESSION_KEY = "dsai.auth.session.v1";

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user?: { id: string; email?: string; email_confirmed_at?: string | null; is_anonymous?: boolean; user_metadata?: Record<string, unknown> };
};

function readSession(): SupabaseSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as SupabaseSession | null; } catch { return null; }
}
function saveSession(session: SupabaseSession) {
  const expiresAt = session.expires_at ?? Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, expires_at: expiresAt }));
}
export function acceptImplicitAuthCallback(): SupabaseSession | null {
  if (typeof window === "undefined" || !window.location.hash) return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return null;
  const session: SupabaseSession = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: Number(params.get("expires_in") || 3600),
    token_type: params.get("token_type") || "bearer",
  };
  saveSession(session);
  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  return session;
}
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const session = readSession();
  return session?.access_token ?? null;
}
async function authRequest(path: string, body: unknown): Promise<any> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result.msg || result.message || result.error_description || result.error || "Authentication request failed";
    throw new Error(message);
  }
  return result;
}
export async function signInWithPassword(email: string, password: string) {
  const session = await authRequest("token?grant_type=password", { email: email.trim().toLowerCase(), password });
  if (!session.access_token || !session.refresh_token) throw new Error("Supabase did not return a login session.");
  if (session.user?.is_anonymous || !session.user?.email_confirmed_at) {
    clearSupabaseSession();
    throw new Error("Email not confirmed");
  }
  saveSession(session);
  return session;
}
export async function signUpWithPassword(email: string, password: string) {
  const redirect = encodeURIComponent(`${window.location.origin}/auth/login`);
  const session = await authRequest(`signup?redirect_to=${redirect}`, {
    email: email.trim().toLowerCase(),
    password,
    data: { full_name: email.trim().split("@")[0] },
  });
  if (session.access_token && session.refresh_token && session.user?.email_confirmed_at) saveSession(session);
  else clearSupabaseSession();
  return session.access_token && !session.user?.email_confirmed_at ? { ...session, access_token: null } : session;
}
export async function verifyEmailToken(tokenHash: string, type: string) {
  const session = await authRequest("verify", { token_hash: tokenHash, type });
  if (session.access_token && session.refresh_token) saveSession(session);
  return session;
}
export async function refreshSession(): Promise<string | null> {
  const session = readSession();
  if (!session) return null;
  if (session.access_token && (session.expires_at ?? 0) > Math.floor(Date.now() / 1000) + 90) return session.access_token;
  if (!session.refresh_token) { localStorage.removeItem(SESSION_KEY); return null; }
  try {
    const next = await authRequest("token?grant_type=refresh_token", { refresh_token: session.refresh_token });
    if (!next.access_token || !next.refresh_token) throw new Error("Session refresh returned no tokens.");
    saveSession(next);
    return next.access_token;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}
export async function getAccessToken(): Promise<string> {
  const token = await refreshSession();
  if (!token) throw new Error("login_required");
  return token;
}
export async function signOutSupabase() {
  const token = getStoredAccessToken();
  try {
    if (token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
      });
    }
  } finally {
    localStorage.removeItem(SESSION_KEY);
  }
}
export function clearSupabaseSession() {
  localStorage.removeItem(SESSION_KEY);
}
