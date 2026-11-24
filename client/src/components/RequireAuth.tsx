import type { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { sanitizeOAuthReturnTo } from "@shared/const";
import { gateDecision, type Access } from "@/lib/routeAccess";

export default function RequireAuth({ access, children }: { access: Access; children: ReactNode }) {
  const { user, loading, error, refresh } = useAuth();
  const decision = gateDecision(access, { loading, hasError: Boolean(error), user });

  if (decision === "allow") return <>{children}</>;
  if (decision === "loading") {
    return <main className="grid min-h-screen place-items-center" role="status" aria-live="polite">লোড হচ্ছে…</main>;
  }
  if (decision === "retry") {
    return (
      <main className="grid min-h-screen place-items-center px-4 text-center" role="alert">
        <div>
          <p>সংযোগ পাওয়া যায়নি।</p>
          <button type="button" onClick={() => void refresh()} className="mt-4 inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold">
            আবার চেষ্টা করুন
          </button>
        </div>
      </main>
    );
  }
  if (decision === "forbidden") return <Redirect to="/workspace" />;
  const returnTo = sanitizeOAuthReturnTo(window.location.pathname + window.location.search);
  return <Redirect to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`} />;
}
