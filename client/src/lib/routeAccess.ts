export type Access = "public" | "member" | "admin";

/** Set to true only if the owner wants anonymous guest sign-in back. */
export const ALLOW_GUEST_CREATIVE_STUDIO = false;

/** Exact paths. Everything that is a service is "member". */
export const ROUTE_ACCESS: Record<string, Access> = {
  "/": "public",
  "/learn": "public",
  "/developer": "public",
  "/method": "public",
  "/platform": "public",
  "/capabilities": "public",
  "/plans": "public",
  "/advertising": "public",
  "/evidence": "public",
  "/governance": "public",
  "/changelog": "public",
  "/privacy": "public",
  "/terms": "public",
  "/about": "public",
  "/contact": "public",
  "/scholarship": "public",
  "/try-first": "public",
  "/quality-gates": "public",
  "/auth/login": "public",
  "/auth/signup": "public",
  "/404": "public",
  "/workspace": "member",
  "/documents": "member",
  "/ai-hub": "member",
  "/creative-studio": "member",
  "/lead-composer": "member",
};

/** Prefix rules (path itself and everything below it). Longest prefix wins. */
export const PREFIX_RULES: Array<[string, Access]> = [
  ["/admin", "admin"],
  ["/agents", "admin"],
  ["/traces", "admin"],
  ["/integration-pilot", "admin"],
  ["/confirm", "public"],
];

export function isExplicit(path: string): boolean {
  if (path in ROUTE_ACCESS) return true;
  return PREFIX_RULES.some(([prefix]) => path === prefix || path.startsWith(prefix + "/"));
}

/** Unlisted paths are public: they render the 404 page and expose nothing. */
export function accessOf(pathname: string): Access {
  const exact = ROUTE_ACCESS[pathname];
  if (exact) return exact;
  let best: [string, Access] | null = null;
  for (const rule of PREFIX_RULES) {
    const [prefix] = rule;
    if ((pathname === prefix || pathname.startsWith(prefix + "/")) && (!best || prefix.length > best[0].length)) best = rule;
  }
  return best ? best[1] : "public";
}

export type GateState = { loading: boolean; hasError: boolean; user: { role?: string; loginMethod?: string } | null };
export type GateDecision = "loading" | "retry" | "login" | "forbidden" | "allow";

/** Pure decision, unit-tested. A network error is NOT "logged out". */
export function gateDecision(access: Access, s: GateState): GateDecision {
  if (access === "public") return "allow";
  if (s.loading) return "loading";
  if (!s.user) return s.hasError ? "retry" : "login";
  if (s.user.loginMethod === "supabase-anonymous") return "login";
  if (access === "admin" && s.user.role !== "admin") return "forbidden";
  return "allow";
}
