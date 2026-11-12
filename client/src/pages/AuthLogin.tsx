import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { acceptImplicitAuthCallback, signInWithPassword, signUpWithPassword, verifyEmailToken } from "@/lib/supabaseAuthClient";
import { trpc } from "@/lib/trpc";
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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const returnTo = getReturnTo();

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
    const callbackError = params.get("error_description");
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
    if (!loading && user) setLocation(returnTo);
  }, [loading, returnTo, setLocation, user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signup") {
        const result = await signUpWithPassword(email, password);
        if (result.access_token) {
          await utils.auth.me.invalidate();
          setLocation(returnTo);
        } else {
          setMessage("অ্যাকাউন্টের অনুরোধ গ্রহণ করা হয়েছে। আপনার ইমেইলে verification link পাঠানো হলে সেটি খুলে অ্যাকাউন্ট সক্রিয় করুন।");
        }
      } else {
        await signInWithPassword(email, password);
        await utils.auth.me.invalidate();
        setLocation(returnTo);
      }
    } catch (cause) {
      const raw = cause instanceof Error ? cause.message : "";
      const lower = raw.toLowerCase();
      setError(lower.includes("invalid login credentials") ? "ইমেইল বা পাসওয়ার্ড সঠিক নয়।" :
        lower.includes("email not confirmed") ? "আপনার ইমেইল এখনো যাচাই হয়নি। ইনবক্সে verification link দেখুন।" :
        lower.includes("user already registered") ? "এই ইমেইল দিয়ে আগে অ্যাকাউন্ট তৈরি হয়েছে। লগইন করুন।" :
        lower.includes("password should be") ? "পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে।" :
        "লগইন সম্পন্ন হয়নি। ইমেইল যাচাই ও Supabase Auth mail configuration পরীক্ষা করে আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-login-page min-h-screen bg-[#f2eee4] px-5 py-6 text-[#18241f] sm:px-8">
      <header className="mx-auto flex max-w-5xl items-center justify-between border-b border-[#18241f]/15 pb-5">
        <Link href="/" className="font-display text-2xl tracking-[.12em]">DSAI</Link>
        <span className="text-[10px] uppercase tracking-[.2em] text-[#18241f]/80">Secure account access</span>
      </header>
      <section className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-5xl items-center gap-10 py-12 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <span className="eyebrow-pill"><ShieldCheck className="mr-2 inline h-3.5 w-3.5" /> Supabase Auth</span>
          <h1 className="mt-6 max-w-2xl font-display text-5xl leading-[.98] sm:text-7xl">আপনার কাজের<br /><em className="text-[#963a28]">নিরাপদ প্রবেশ</em>।</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#18241f]/70">ইমেইল ও পাসওয়ার্ড দিয়ে DSAI account তৈরি করুন বা লগইন করুন। একই account দিয়ে Workdesk, Creative Studio এবং আপনার সংরক্ষিত কাজ ব্যবহার করুন।</p>
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
            {error && <p role="alert" className="rounded-xl border border-[#c85a3f]/30 bg-[#f7e5dd] p-3 text-sm leading-6 text-[#7d2e20]">{error}</p>}
            {message && <p role="status" className="rounded-xl border border-[#2f6653]/25 bg-[#edf5ef] p-3 text-sm leading-6 text-[#244d3d]">{message}</p>}
            <button type="submit" disabled={busy || loading} className="flex h-12 w-full items-center justify-center rounded-xl bg-[#18241f] px-4 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> যাচাই হচ্ছে…</> : mode === "signin" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
            </button>
          </form>
          <p className="mt-5 text-xs leading-6 text-[#18241f]/60">নতুন account-এর ক্ষেত্রে Supabase email confirmation চালু থাকলে inbox থেকে verification সম্পন্ন করতে হবে। Password কখনো DSAI-এর বাইরে কোথাও প্রকাশ করবেন না।</p>
        </div>
      </section>
    </main>
  );
}
