import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { acceptImplicitAuthCallback, resendSignupConfirmation, signInAnonymously, signInWithPassword, signUpWithPassword, verifyEmailToken } from "@/lib/supabaseAuthClient";
import { trpc } from "@/lib/trpc";
import TurnstileWidget from "@/components/TurnstileWidget";
import { useAuth } from "@/_core/hooks/useAuth";
import { sanitizeOAuthReturnTo } from "@shared/const";

function getReturnTo() {
  if (typeof window === "undefined") return "/workspace";
  return sanitizeOAuthReturnTo(new URLSearchParams(window.location.search).get("returnTo"));
}

export default function AuthLogin() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "signup" || window.location.pathname === "/auth/signup" ? "signup" : "signin";
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [guestTermsAccepted, setGuestTermsAccepted] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resendAvailable, setResendAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const returnTo = getReturnTo();
  const captchaSiteKey = import.meta.env.VITE_CAPTCHA_SITE_KEY ?? "";
  const handleCaptchaVerify = useCallback((token: string) => setCaptchaToken(token), []);

  useEffect(() => {
    let active = true;
    const implicitSession = acceptImplicitAuthCallback();
    if (implicitSession) {
      setBusy(true);
      utils.auth.me.invalidate().then(() => { if (active) setLocation(returnTo); }).finally(() => { if (active) setBusy(false); });
      return () => { active = false; };
    }
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    const callbackError = params.get("error_description") || new URLSearchParams(window.location.hash.slice(1)).get("error_description");
    if (callbackError) setError("ইমেইল যাচাই হয়নি। লিংকটি মেয়াদোত্তীর্ণ বা ভুল redirect configuration-এর কারণে ব্যর্থ হয়েছে।");
    if (!tokenHash || !type) return () => { active = false; };
    setBusy(true);
    verifyEmailToken(tokenHash, type)
      .then(async session => {
        if (!active) return;
        if (session.access_token) {
          await utils.auth.me.invalidate();
          setLocation(returnTo);
        } else {
          setMessage("ইমেইল যাচাই হয়েছে। এখন আপনার ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।");
        }
      })
      .catch(() => { if (active) setError("ইমেইল যাচাইয়ের লিংকটি মেয়াদোত্তীর্ণ বা ইতোমধ্যে ব্যবহার করা হয়েছে। নতুন verification email নিন।"); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loading && user) setLocation(user.loginMethod === "supabase-anonymous" || guestMode ? "/creative-studio" : returnTo);
  }, [guestMode, loading, returnTo, setLocation, user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "signup" && !termsAccepted) {
      setError("অ্যাকাউন্ট তৈরির আগে ব্যবহারের শর্ত ও AI output-এর সীমা স্বীকার করুন।");
      return;
    }
    // Human verification is required for secure sign-in. Never send a login,
    // signup, or resend request without the matching site key and fresh token.
    if (!captchaSiteKey) {
      setError("নিরাপত্তা যাচাই এখন পাওয়া যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
      return;
    }
    if (!captchaToken) {
      setError("অনুগ্রহ করে মানব-যাচাই সম্পন্ন করুন।");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signup") {
        const result = await signUpWithPassword(email, password, captchaToken || undefined);
        if (result.access_token) {
          await utils.auth.me.invalidate();
          setLocation(returnTo);
        } else {
          setMessage("অ্যাকাউন্টের অনুরোধ গ্রহণ করা হয়েছে। আপনার ইমেইলে verification link পাঠানো হলে সেটি খুলে অ্যাকাউন্ট সক্রিয় করুন।");
          setResendAvailable(true);
        }
      } else {
        await signInWithPassword(email, password, captchaToken || undefined);
        await utils.auth.me.invalidate();
        setLocation(returnTo);
      }
    } catch (cause) {
      const raw = cause instanceof Error ? cause.message : "";
      const lower = raw.toLowerCase();
      setError(lower.includes("anonymous_provider_disabled") || lower.includes("anonymous sign-ins are disabled") ? "অ্যাকাউন্ট ছাড়া ব্যবহার এখন পাওয়া যাচ্ছে না। ইমেইল দিয়ে অ্যাকাউন্ট তৈরি বা লগইন করুন।" :
        lower.includes("email address not authorized") ? "নতুন account তৈরি করা যাচ্ছে না। পরে আবার চেষ্টা করুন বা সহায়তায় যোগাযোগ করুন।" :
        lower.includes("email rate limit exceeded") || lower.includes("over_email_send_rate_limit") ? "ইমেইল পাঠানোর সীমা শেষ হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" :
        lower.includes("captcha") ? "মানব-যাচাই ব্যর্থ হয়েছে। মানব-যাচাই আবার সম্পন্ন করুন।" :
        lower.includes("invalid login credentials") ? "ইমেইল বা পাসওয়ার্ড সঠিক নয়।" :
        lower.includes("email not confirmed") ? "আপনার ইমেইল এখনো যাচাই হয়নি। ইনবক্সে verification link দেখুন।" :
        lower.includes("user already registered") ? "এই ইমেইল দিয়ে আগে অ্যাকাউন্ট তৈরি হয়েছে। লগইন করুন।" :
        lower.includes("password should be") ? "পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে।" :
        "লগইন সম্পন্ন হয়নি। ইমেইল ঠিকানা ও পাসওয়ার্ড যাচাই করে আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
      setCaptchaToken("");
      setCaptchaResetKey(value => value + 1);
    }
  };

  return (
    <main className="auth-login-page min-h-screen bg-[#f2eee4] px-5 py-6 text-[#18241f] sm:px-8">
      <header className="mx-auto flex max-w-5xl items-center justify-between border-b border-[#18241f]/15 pb-5">
        <Link href="/" className="font-display text-2xl tracking-[.12em]">DSAI</Link>
        <span className="text-[10px] uppercase tracking-[.2em] text-[#18241f]/80">নিরাপদ প্রবেশ</span>
      </header>
      <section className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-5xl items-center gap-10 py-12 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <span className="eyebrow-pill"><ShieldCheck className="mr-2 inline h-3.5 w-3.5" /> নিরাপদ লগইন</span>
          <h1 className="mt-6 max-w-2xl font-display text-5xl leading-[.98] sm:text-7xl">আপনার কাজের<br /><em className="text-[#963a28]">নিরাপদ প্রবেশ</em>।</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#18241f]/70">ইমেইল ও পাসওয়ার্ড দিয়ে DSAI অ্যাকাউন্ট তৈরি করুন বা লগইন করুন। একই account দিয়ে আপনার কাজের জায়গা, সৃজনশীল স্টুডিও এবং সংরক্ষিত কাজ ব্যবহার করুন।</p>
          <Link href="/learn" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#963a28]">DSAI কীভাবে কাজ করে দেখুন <ArrowRight size={16} /></Link>
        </div>
        <div className="border border-[#18241f]/15 bg-white/55 p-6 shadow-[0_18px_50px_rgba(24,36,31,.08)] sm:p-8">
          <LockKeyhole className="h-6 w-6 text-[#963a28]" />
          <h2 className="mt-5 font-display text-3xl">{mode === "signin" ? "আপনার অ্যাকাউন্টে লগইন" : "নতুন অ্যাকাউন্ট তৈরি"}</h2>
          <div className="mt-4 flex gap-2 border-b border-[#18241f]/15 pb-3 text-sm">
            <button type="button" onClick={() => { setMode("signin"); setError(null); setMessage(null); }} className={mode === "signin" ? "border-b-2 border-[#963a28] pb-2 font-semibold" : "pb-2 text-[#18241f]/60"}>লগইন</button>
            <button type="button" onClick={() => { setMode("signup"); setError(null); setMessage(null); }} className={mode === "signup" ? "border-b-2 border-[#963a28] pb-2 font-semibold" : "pb-2 text-[#18241f]/60"}>অ্যাকাউন্ট তৈরি</button>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium" htmlFor="auth-email">ইমেইল ঠিকানা</label>
            <div className="flex items-center gap-2 rounded-xl border border-[#18241f]/15 bg-white px-3"><Mail className="h-4 w-4 text-[#18241f]/45" /><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="h-12 w-full bg-transparent text-sm outline-none" /></div>
            <label className="block text-sm font-medium" htmlFor="auth-password">পাসওয়ার্ড</label>
            <input id="auth-password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} placeholder="কমপক্ষে ৮ অক্ষর" className="h-12 w-full rounded-xl border border-[#18241f]/15 bg-white px-3 text-sm outline-none focus:border-[#963a28]" />
            {mode === "signup" && <label className="flex items-start gap-3 rounded-xl border border-[#18241f]/15 bg-white/70 p-3 text-xs leading-6 text-[#18241f]/75">
              <input type="checkbox" checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 accent-[#963a28]" />
              <span>আমি DSAI-এর <Link href="/terms" className="underline">ব্যবহারের শর্তাবলি</Link>, <Link href="/governance" className="underline">নিরাপদ ব্যবহারের নির্দেশনা</Link> ও <Link href="/privacy" className="underline">গোপনীয়তা নীতি</Link> পড়েছি। এটি একটি এআই-চালিত সেবা; গুরুত্বপূর্ণ তথ্য ও AI output নিজ দায়িত্বে যাচাই করে নেব।</span>
            </label>}
            {captchaSiteKey
              ? <TurnstileWidget siteKey={captchaSiteKey} resetKey={captchaResetKey} onVerify={handleCaptchaVerify} />
              : <p role="status" className="rounded-xl border border-amber-700/25 bg-amber-50 p-3 text-sm leading-6 text-amber-900">নিরাপত্তা যাচাই এখন পাওয়া যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।</p>}
            {error && <p role="alert" className="rounded-xl border border-[#c85a3f]/30 bg-[#f7e5dd] p-3 text-sm leading-6 text-[#7d2e20]">{error}</p>}
            {message && <p role="status" className="rounded-xl border border-[#2f6653]/25 bg-[#edf5ef] p-3 text-sm leading-6 text-[#244d3d]">{message}</p>}
            {mode === "signup" && resendAvailable && <button type="button" disabled={busy || !captchaToken || !email.trim()} onClick={async () => {
              setBusy(true); setError(null);
              try {
                await resendSignupConfirmation(email, captchaToken);
                setMessage("নতুন যাচাইকরণ লিংক পাঠানোর অনুরোধ গ্রহণ করা হয়েছে। ইনবক্স ও স্প্যাম ফোল্ডার পরীক্ষা করুন।");
              } catch {
                setError("Verification link আবার পাঠানো যায়নি। CAPTCHA সম্পন্ন করে কিছুক্ষণ পর চেষ্টা করুন।");
              } finally {
                setBusy(false); setCaptchaToken(""); setCaptchaResetKey(value => value + 1);
              }
            }} className="w-full rounded-xl border border-[#963a28]/30 px-4 py-3 text-sm font-semibold text-[#963a28] disabled:opacity-50">নতুন verification link পাঠান</button>}
            <button type="submit" disabled={busy || loading || !captchaSiteKey || !captchaToken || (mode === "signup" && !termsAccepted)} className="flex h-12 w-full items-center justify-center rounded-xl bg-[#18241f] px-4 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> যাচাই হচ্ছে…</> : mode === "signin" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
            </button>
          </form>
          {mode === "signin" && <div className="mt-5 border-t border-[#18241f]/15 pt-5">
            <label className="flex items-start gap-3 text-xs leading-6 text-[#18241f]/65">
              <input type="checkbox" checked={guestTermsAccepted} onChange={event => setGuestTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 accent-[#963a28]" />
              <span>আমি অ্যাকাউন্ট ছাড়া ব্যবহারের <Link href="/terms" className="underline">শর্তাবলি</Link> ও <Link href="/privacy" className="underline">গোপনীয়তা নীতি</Link> মেনে নিচ্ছি। অ্যাকাউন্ট ছাড়া ব্যবহার করলে তৈরি হওয়া অস্থায়ী অ্যাকাউন্টটি ব্রাউজারের তথ্য মুছে গেলে বা অন্য যন্ত্রে গেলে ফিরে পাওয়া যাবে না।</span>
            </label>
            <button type="button" onClick={async () => {
              if (!captchaSiteKey || !captchaToken) { setError("মানব-যাচাই সম্পন্ন করুন।"); return; }
              setBusy(true); setGuestMode(true); setError(null); setMessage(null);
              try { await signInAnonymously(captchaToken); await utils.auth.me.invalidate(); setLocation("/creative-studio"); }
              catch (cause) { setGuestMode(false); const raw = cause instanceof Error ? cause.message.toLowerCase() : ""; setError(raw.includes("anonymous_provider_disabled") || raw.includes("anonymous sign-ins are disabled") ? "অ্যাকাউন্ট ছাড়া ব্যবহার এখন পাওয়া যাচ্ছে না। ইমেইল দিয়ে অ্যাকাউন্ট তৈরি বা লগইন করুন।" : "অ্যাকাউন্ট তৈরি হয়নি। পরে আবার চেষ্টা করুন।"); }
              finally { setBusy(false); setCaptchaToken(""); setCaptchaResetKey(value => value + 1); }
            }} className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border border-[#18241f]/25 bg-white px-4 text-sm font-semibold text-[#18241f] disabled:opacity-50" disabled={busy || loading || !guestTermsAccepted || !captchaSiteKey || !captchaToken}>অ্যাকাউন্ট ছাড়া চেষ্টা করুন</button>
            {!captchaSiteKey && <p className="mt-2 text-xs leading-5 text-amber-800">অ্যাকাউন্ট ছাড়া ব্যবহার এখন সাময়িকভাবে পাওয়া যাচ্ছে না। ইমেইল দিয়ে অ্যাকাউন্ট তৈরি বা লগইন করুন।</p>}
          </div>}
          <p className="mt-5 text-xs leading-6 text-[#18241f]/60">নতুন অ্যাকাউন্টের ক্ষেত্রে ইমেইলে পাঠানো যাচাইকরণ লিংক খুলে অ্যাকাউন্ট নিশ্চিত করুন। পাসওয়ার্ড কখনো DSAI-এর বাইরে প্রকাশ করবেন না।</p>
        </div>
      </section>
    </main>
  );
}
