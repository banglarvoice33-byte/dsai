import { ArrowRight, Loader2, LockKeyhole, WifiOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { sanitizeOAuthReturnTo } from "@shared/const";
import { trpc } from "@/lib/trpc";

declare global {
  interface Window {
    turnstile?: { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "error-callback": () => void; "expired-callback": () => void; }) => string; reset: (widgetId?: string) => void };
  }
}

function getReturnTo() {
  if (typeof window === "undefined") return "/workspace";
  return sanitizeOAuthReturnTo(new URLSearchParams(window.location.search).get("returnTo"));
}

export default function AuthLogin() {
  const [, setLocation] = useLocation();
  const { user, loading, error } = useAuth();
  const startedRef = useRef(false);
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [startError, setStartError] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const captchaElementRef = useRef<HTMLDivElement>(null);
  const captchaConfig = trpc.auth.captchaConfig.useQuery();
  const verifyCaptcha = trpc.auth.verifyCaptcha.useMutation({ onSuccess: () => setCaptchaVerified(true), onError: () => setStartError("CAPTCHA যাচাই করা যায়নি। আবার চেষ্টা করুন।") });
  const returnTo = useMemo(getReturnTo, []);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!captchaConfig.data?.required || !captchaConfig.data.configured || !captchaConfig.data.siteKey || !captchaElementRef.current) return;
    const siteKey = captchaConfig.data.siteKey;
    const renderWidget = () => {
      if (!window.turnstile || !captchaElementRef.current) return;
      window.turnstile.render(captchaElementRef.current, { sitekey: siteKey, callback: token => verifyCaptcha.mutate({ token }), "error-callback": () => setStartError("CAPTCHA-তে সমস্যা হয়েছে। আবার চেষ্টা করুন।"), "expired-callback": () => setCaptchaVerified(false) });
    };
    if (window.turnstile) renderWidget();
    else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    }
  }, [captchaConfig.data?.configured, captchaConfig.data?.required, captchaConfig.data?.siteKey]);

  useEffect(() => {
    if (loading || user || offline || startedRef.current || captchaConfig.isLoading || (captchaConfig.data?.required && !captchaVerified)) return;
    if (captchaConfig.data?.required && !captchaConfig.data.configured) {
      setStartError("এই deployment-এ CAPTCHA configure করা হয়নি। Operator-কে public site key ও server-only verification secret দিতে হবে।");
      return;
    }
    if (!import.meta.env.VITE_OAUTH_PORTAL_URL || !import.meta.env.VITE_APP_ID) {
      setStartError("OAuth configuration is not available on this deployment.");
      return;
    }
    startedRef.current = true;
    try {
      startLogin(returnTo);
    } catch (startFailure) {
      startedRef.current = false;
      setStartError(startFailure instanceof Error ? startFailure.message : "Login could not be started.");
    }
  }, [captchaConfig.data, captchaConfig.isLoading, captchaVerified, loading, offline, returnTo, user]);

  useEffect(() => {
    if (!loading && user) setLocation(returnTo);
  }, [loading, returnTo, setLocation, user]);

  const retryLogin = () => {
    if (offline) return;
    startedRef.current = false;
    setStartError(null);
  };

  return (
    <main className="min-h-screen bg-[#f2eee4] px-5 py-6 text-[#18241f] sm:px-8">
      <header className="mx-auto flex max-w-5xl items-center justify-between border-b border-[#18241f]/15 pb-5">
        <Link href="/" className="font-display text-2xl tracking-[.12em]">DSAI</Link>
        <span className="text-[10px] uppercase tracking-[.2em] text-[#18241f]/55">Secure access</span>
      </header>
      <section className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-5xl items-center gap-10 py-12 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <span className="eyebrow-pill"><span className="pulse-dot" /> Human-gated access</span>
          <h1 className="mt-6 max-w-2xl font-display text-5xl leading-[.98] sm:text-7xl">আপনার কাজের<br /><em className="text-[#c85a3f]">পরবর্তী ধাপ</em>।</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#18241f]/70">DSAI-তে প্রবেশের জন্য নিরাপদ OAuth ব্যবহার করুন। Draft তৈরি হতে পারে, কিন্তু উচ্চ-ঝুঁকির action human review ছাড়া submit হয় না।</p>
          <Link href="/learn" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#c85a3f]">কীভাবে কাজ করে দেখুন <ArrowRight size={16} /></Link>
        </div>
        <div className="border border-[#18241f]/15 bg-white/45 p-6 shadow-[0_18px_50px_rgba(24,36,31,.08)] sm:p-8">
          <LockKeyhole className="h-6 w-6 text-[#c85a3f]" />
          <h2 className="mt-5 font-display text-3xl">Sign in / create account</h2>
          {offline ? <div className="mt-6 border border-[#c85a3f]/35 bg-[#f7e5dd] p-4 text-sm leading-6"><WifiOff className="mb-2 h-5 w-5 text-[#c85a3f]" /><strong className="block">নেটওয়ার্ক সংযোগ নেই</strong>সংযোগ ফিরলে আবার চেষ্টা করুন। Offline অবস্থায় login বা protected action চালানো হয় না।</div> : captchaConfig.data?.required && captchaConfig.data.configured && !captchaVerified ? <div className="mt-6 border border-[#18241f]/15 bg-white p-4"><strong className="block text-sm">প্রথমে নিরাপত্তা যাচাই করুন</strong><p className="mt-2 text-xs leading-5 text-[#18241f]/60">Automated login কমাতে CAPTCHA সম্পন্ন করুন। কোনো password বা API key এখানে দেবেন না।</p><div ref={captchaElementRef} className="mt-4 min-h-16" /></div> : error || startError ? <div className="mt-6 border border-[#c85a3f]/35 bg-[#f7e5dd] p-4 text-sm leading-6"><strong className="block">Login শুরু করা যায়নি</strong>{startError || "OAuth service থেকে সাড়া পাওয়া যায়নি।"}<button type="button" onClick={retryLogin} className="mt-4 inline-flex items-center gap-2 bg-[#c85a3f] px-4 py-2 font-semibold text-white">আবার চেষ্টা করুন <ArrowRight size={15} /></button></div> : <div className="mt-6 flex items-center gap-3 text-sm text-[#18241f]/65"><Loader2 className="h-5 w-5 animate-spin text-[#c85a3f]" /> নিরাপদ login portal-এ নেওয়া হচ্ছে…</div>}
          <p className="mt-7 border-t border-[#18241f]/10 pt-5 text-xs leading-6 text-[#18241f]/55">Return destination: <code className="break-all">{returnTo}</code>. Password বা API key DSAI public form-এ দেবেন না।</p>
        </div>
      </section>
    </main>
  );
}
