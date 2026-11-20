import { useEffect, useRef, useState } from "react";

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

const SCRIPT_SELECTOR = "script[data-dsai-turnstile]";
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const LOAD_TIMEOUT_MS = 12_000;

export default function TurnstileWidget({ siteKey, resetKey, onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onVerify);
  const [retryCount, setRetryCount] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  callbackRef.current = onVerify;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let disposed = false;
    let timeoutId: number | undefined;
    let script = document.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR);

    const fail = () => {
      if (disposed) return;
      setStatus("error");
      callbackRef.current("");
    };

    const render = () => {
      if (disposed || !window.turnstile || !containerRef.current || widgetIdRef.current) return;
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback: token => {
            if (!disposed) {
              setStatus("ready");
              callbackRef.current(token);
            }
          },
          "expired-callback": () => callbackRef.current(""),
          "error-callback": fail,
        });
        setStatus("ready");
      } catch {
        fail();
      }
    };

    // Recover from a previously failed script element instead of waiting forever.
    if (script && !window.turnstile && script.dataset.dsaiTurnstileFailed === "true") {
      script.remove();
      script = null;
    }

    if (window.turnstile) {
      render();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.dataset.dsaiTurnstile = "true";
        document.head.appendChild(script);
      }
      const activeScript = script;
      const onLoad = () => {
        if (disposed) return;
        if (window.turnstile) render();
        else fail();
      };
      const onError = () => {
        activeScript.dataset.dsaiTurnstileFailed = "true";
        fail();
      };
      activeScript.addEventListener("load", onLoad);
      activeScript.addEventListener("error", onError);
      timeoutId = window.setTimeout(() => {
        if (!window.turnstile) {
          activeScript.dataset.dsaiTurnstileFailed = "true";
          fail();
        }
      }, LOAD_TIMEOUT_MS);

      return () => {
        disposed = true;
        activeScript.removeEventListener("load", onLoad);
        activeScript.removeEventListener("error", onError);
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
        if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      };
    }

    return () => {
      disposed = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [siteKey, retryCount]);

  useEffect(() => {
    if (resetKey > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setStatus("ready");
    }
  }, [resetKey]);

  if (!siteKey) return null;

  return (
    <div className="space-y-2" aria-live="polite">
      <div ref={containerRef} className="min-h-[66px]" aria-label="Human verification" />
      {status === "loading" && (
        <p role="status" className="text-xs text-[#18241f]/65">নিরাপত্তা যাচাই লোড হচ্ছে…</p>
      )}
      {status === "error" && (
        <div role="alert" className="rounded-xl border border-amber-700/25 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          নিরাপত্তা যাচাই লোড হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।
          <button
            type="button"
            onClick={() => {
              callbackRef.current("");
              setStatus("loading");
              setRetryCount(value => value + 1);
            }}
            className="ml-2 font-semibold underline underline-offset-2"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}
    </div>
  );
}
