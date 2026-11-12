import { getAccessToken } from "@/lib/supabaseAuthClient";

const SUPABASE_URL = "https://wleytsrflhboyevhigiu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsZXl0c3JmbGhib3lldmhpZ2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzI0OTQsImV4cCI6MjEwMDU0ODQ5NH0.mB3QDgUREz_2Knht0V8TU0TdV8QP2C6YEkaWk5LB2-U";

export type GeneratedImage = { id: string; prompt: string; model: string; mime_type: string; byte_size: number; created_at: string; preview_url: string | null };

export async function imageFunction<T>(payload: Record<string, unknown>): Promise<T> {
  let accessToken: string;
  try { accessToken = await getAccessToken(); }
  catch { throw new Error("লগইন করে তারপর ছবি তৈরি করুন।"); }
  const response = await fetch(`${SUPABASE_URL}/functions/v1/dsai-image-generate`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = typeof result.error === "string" ? result.error : "generation_failed";
    const messages: Record<string, string> = {
      daily_limit_reached: "আজ আপনার ২টি ছবির দৈনিক সীমা পূর্ণ হয়েছে। আগামীকাল আবার চেষ্টা করুন।",
      global_daily_limit: "আজকের ৫০০ জন ব্যবহারকারীর ইমেজ জেনারেশন সীমা পূর্ণ হয়েছে। আগামীকাল আবার চেষ্টা করুন।",
      quota_service_unavailable: "ইমেজ ব্যবহারের সীমা যাচাই করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।",
      all_providers_failed: "Agnes ও Cloudflare—দুই ইমেজ সেবাই এখন সাড়া দিচ্ছে না। পরে আবার চেষ্টা করুন।",
      invalid_or_expired_session: "আপনার লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।",
      user_profile_unavailable: "আপনার অ্যাকাউন্ট প্রোফাইল তৈরি করা যায়নি। আবার চেষ্টা করুন।",
    };
    throw new Error(messages[error] ?? "ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন।");
  }
  return result as T;
}
