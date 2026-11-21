import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: {
    sitekey: string;
    callback: (token: string) => void;
    "expired-callback"?: () => void;
    "error-callback"?: () => void;
    theme?: "light" | "dark" | "auto";
  }) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type Props = {
  siteKey: string;
  resetKey: number;
  onVerify: (token: string) => void;
};

type LoadState = "loading" | "ready" | "error";

const SCRIPT_SELECTOR = "script[data-dsai-turnstile]";
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const LOAD_TIMEOUT_MS = 12_000;

/**
 * Loads Turnstile once, including the cached/already-loaded-script case.
 * A failed third-party script never leaves the form silently disabled:
 * the user gets a visible retry action while verification remains fail-closed.
 */
export default function TurnstileWidget({ siteKey, resetKey, onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onVerify);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [retryCount, setRetryCount] = useState(0);

  callbackRef.current = onVerify;

  const retry = useCallback(() => {
    callbackRef.current("");
    setLoadState("loading");
    setRetryCount(value => value + 1);
  }, []);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let disposed = false;
    let pollId: number | undefined;
    let timeoutId: number | undefined;
    let activeScript: HTMLScriptElement | null = null;
    let renderedWidgetId: string | null = null;

    const cleanupWidget = () => {
      if (renderedWidgetId && window.turnstile) {
        try { window.turnstile.remove(renderedWidgetId); } catch { /* best-effort widget cleanup */ }
      }
      if (widgetIdRef.current === renderedWidgetId) widgetIdRef.current = null;
      renderedWidgetId = null;
    };

    const fail = () => {
      if (disposed) return;
      window.clearInterval(pollId);
      window.clearTimeout(timeoutId);
      setLoadState("error");
      callbackRef.current("");
    };

    const renderWidget = () => {
      if (disposed || !window.turnstile || !containerRef.current || renderedWidgetId) return false;
      try {
        renderedWidgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback: token => {
            if (disposed) return;
            setLoadState("ready");
            callbackRef.current(token);
          },
          "expired-callback": () => {
            if (disposed) return;
            callbackRef.current("");
            setLoadState("ready");
          },
          "error-callback": () => {
            if (disposed) return;
            callbackRef.current("");
            setLoadState("error");
          },
        });
        widgetIdRef.current = renderedWidgetId;
        setLoadState("ready");
        window.clearInterval(pollId);
        window.clearTimeout(timeoutId);
        return true;
      } catch {
        fail();
        return false;
      }
    };

    // The script may have been loaded by an earlier mount or another route.
    if (renderWidget()) {
      return () => {
        disposed = true;
        cleanupWidget();
      };
    }

    // A user-requested retry must re-fetch a failed/stalled script instead of
    // attaching new listeners to the same permanently failed element.
    if (retryCount > 0 && !window.turnstile) {
      document.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR)?.remove();
    }

    activeScript = document.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR);
    if (!activeScript) {
      activeScript = document.createElement("script");
      activeScript.src = SCRIPT_URL;
      activeScript.async = true;
      activeScript.defer = true;
      activeScript.dataset.dsaiTurnstile = "true";
      activeScript.addEventListener("error", fail, { once: true });
      // Attach listeners before insertion to avoid a fast-cache load race.
      activeScript.addEventListener("load", renderWidget, { once: true });
      document.head.appendChild(activeScript);
    } else {
      activeScript.addEventListener("error", fail);
      activeScript.addEventListener("load", renderWidget);
    }

    // Handles the case where an existing script's load event already fired
    // before this component mounted and the global became available slightly later.
    pollId = window.setInterval(() => {
      if (renderWidget()) window.clearInterval(pollId);
    }, 100);
    timeoutId = window.setTimeout(fail, LOAD_TIMEOUT_MS);

    return () => {
      disposed = true;
      window.clearInterval(pollId);
      window.clearTimeout(timeoutId);
      activeScript?.removeEventListener("error", fail);
      activeScript?.removeEventListener("load", renderWidget);
      cleanupWidget();
    };
  }, [siteKey, retryCount]);

  useEffect(() => {
    if (resetKey > 0 && widgetIdRef.current && window.turnstile) {
      callbackRef.current("");
      try { window.turnstile.reset(widgetIdRef.current); } catch { setLoadState("error"); }
    }
  }, [resetKey]);

  if (!siteKey) {
    return <p role="alert" className="rounded-xl border border-amber-700/25 bg-amber-50 p-3 text-sm text-amber-900">নিরাপত্তা যাচাইয়ের কনফিগারেশন পাওয়া যায়নি। সহায়তায় যোগাযোগ করুন।</p>;
  }

  return (
    <div className="space-y-2" aria-label="Human verification">
      <div ref={containerRef} className="min-h-[66px]" />
      {loadState === "loading" && <p role="status" className="text-xs text-[#18241f]/65">নিরাপত্তা যাচাই লোড হচ্ছে…</p>}
      {loadState === "error" && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-700/25 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          <span>নিরাপত্তা যাচাই লোড হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</span>
          <button type="button" onClick={retry} className="shrink-0 rounded-md border border-amber-800/30 px-3 py-1.5 font-semibold">আবার চেষ্টা করুন</button>
        </div>
      )}
    </div>
  );
}
