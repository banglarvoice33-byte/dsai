import { ShieldCheck } from "lucide-react";

const PUBLIC_AD_ROUTES = new Set(["/", "/learn", "/method", "/changelog"]);
const PROTECTED_ROUTE_PREFIXES = ["/auth", "/workspace", "/creative-studio", "/admin", "/traces", "/integration-pilot", "/plans", "/payment", "/billing"];

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isAdsAllowedOnRoute(pathname: string) {
  return PUBLIC_AD_ROUTES.has(pathname) && !isProtectedRoute(pathname);
}

export function AdReadinessNotice({ pathname = typeof window === "undefined" ? "/" : window.location.pathname }: { pathname?: string }) {
  const adsEnabled = false;
  if (!adsEnabled || !isAdsAllowedOnRoute(pathname)) return null;
  return <aside aria-label="Advertisement" className="mx-auto my-8 max-w-3xl border border-[#18241f]/10 bg-white/45 p-4 text-xs text-[#18241f]/55"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#c85a3f]" /><span>Advertisement</span></div><p className="mt-2">Ads are currently disabled while DSAI completes publisher, consent, privacy and placement review.</p></aside>;
}

export const advertisingPolicy = {
  enabled: false,
  protectedZones: ["authentication", "workspace", "private communication", "creative production", "payment", "admin", "high-risk actions"],
  plannedPublicRoutes: ["/", "/learn", "/method", "/changelog"],
};
