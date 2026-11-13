const SUPABASE_URL = "https://wleytsrflhboyevhigiu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsZXl0c3JmbGhib3lldmhpZ2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzI0OTQsImV4cCI6MjEwMDU0ODQ5NH0.mB3QDgUREz_2Knht0V8TU0TdV8QP2C6YEkaWk5LB2-U";
const SESSION_KEY = "dsai.image.guest.session.v1";

type AuthSession = { access_token: string; refresh_token: string; expires_at?: number; expires_in?: number; token_type?: string };
export type GeneratedImage = { id: string; prompt: string; model: string; mime_type: string; byte_size: number; created_at: string; preview_url: string | null };

function readSession(): AuthSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as AuthSession | null; } catch { return null; }
}
function saveSession(session: AuthSession) {
  const expiresAt = session.expires_at ?? Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, expires_at: expiresAt }));
}
async function authRequest(path: string, body: unknown) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.msg || result.message || result.error_description || result.error || "Supabase sign-in failed");
  return result as AuthSession;
}
async function getAccessToken(): Promise<string> {
  let session = readSession();
  if (session?.access_token && (session.expires_at ?? 0) > Math.floor(Date.now() / 1000) + 90) return session.access_token;
  if (session?.refresh_token) {
    try {
      session = await authRequest("token?grant_type=refresh_token", { refresh_token: session.refresh_token });
      saveSession(session);
      return session.access_token;
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }
  // Supabase anonymous sign-in creates an authenticated JWT without asking for an email/password.
  session = await authRequest("signup", { data: { full_name: "DSAI Guest" } });
  if (!session.access_token || !session.refresh_token) throw new Error("Supabase anonymous sign-in is not enabled for this project.");
  saveSession(session);
  return session.access_token;
}

export async function imageFunction<T>(payload: Record<string, unknown>): Promise<T> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/dsai-image-generate`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = typeof result.error === "string" ? result.error : "generation_failed";
    const messages: Record<string, string> = {
      daily_limit_reached: "আজকের ২টি image generation limit শেষ হয়েছে। আগামীকাল আবার চেষ্টা করুন।",
      provider_balance_required: "Image provider balance প্রয়োজন। কিছুক্ষণ পর আবার চেষ্টা করুন।",
      provider_rate_limited: "Provider ব্যস্ত। এক মিনিট পর আবার চেষ্টা করুন।",
      provider_not_configured: "Image provider এখনো configure হয়নি।",
      invalid_or_expired_session: "Guest session শেষ হয়েছে। আবার চেষ্টা করুন।",
      user_profile_unavailable: "আপনার guest profile তৈরি করা যায়নি। আবার চেষ্টা করুন।",
    };
    throw new Error(messages[error] ?? "ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন।");
  }
  return result as T;
}
