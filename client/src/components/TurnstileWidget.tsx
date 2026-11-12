import { useEffect, useRef } from "react";

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

export default function TurnstileWidget({ siteKey, resetKey, onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onVerify);
  callbackRef.current = onVerify;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let disposed = false;
    const render = () => {
      if (disposed || !window.turnstile || !containerRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        callback: token => callbackRef.current(token),
        "expired-callback": () => callbackRef.current(""),
        "error-callback": () => callbackRef.current(""),
      });
    };
    if (window.turnstile) {
      render();
    } else {
      let script = document.querySelector<HTMLScriptElement>("script[data-dsai-turnstile]");
      if (!script) {
        script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.dsaiTurnstile = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      return () => {
        disposed = true;
        script?.removeEventListener("load", render);
        if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      };
    }
    return () => {
      disposed = true;
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetKey > 0 && widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
  }, [resetKey]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="min-h-[66px]" aria-label="Human verification" />;
}
