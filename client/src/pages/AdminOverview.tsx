import { ArrowRight, CheckCircle2, ClipboardList, CreditCard, Gauge, KeyRound, LockKeyhole, RefreshCw, ShieldAlert, ShieldCheck, TimerReset, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const adminLinks = [
  ["/admin/connectors", "Connectors", "Provider status, test boundary, enable policy", KeyRound],
  ["/admin/platform", "Platform control", "Readiness and scaling policy preview", Gauge],
  ["/admin/deletion-requests", "Privacy queue", "Deletion requests and lifecycle review", LockKeyhole],
  ["/admin/scholarship", "Scholarship review", "Minimum metadata and entitlement review", ClipboardList],
  ["/admin/changelog", "Changelog", "Draft and publish verified product records", CheckCircle2],
  ["/admin/search-analytics", "Search analytics", "Public question trends without raw secrets", TimerReset],
  ["/admin/payments", "Payment control", "Card, bKash, Nagad, Rocket readiness; live charge off", CreditCard],
] as const;

function Metric({ label, value, detail, tone = "text-[#18241f]" }: { label: string; value: string; detail: string; tone?: string }) {
  return <article className="border border-[#18241f]/15 bg-white/55 p-5 shadow-[0_12px_35px_rgba(24,36,31,.05)]"><p className="text-[10px] uppercase tracking-[.2em] text-[#c85a3f]">{label}</p><strong className={`mt-3 block font-display text-4xl ${tone}`}>{value}</strong><p className="mt-2 text-xs leading-5 text-[#18241f]/60">{detail}</p></article>;
}

export default function AdminOverview() {
  const { user, loading } = useAuth();
  const enabled = user?.role === "admin";
  const connectors = trpc.admin.connectors.list.useQuery(undefined, { enabled, retry: false });
  const traces = trpc.admin.traces.list.useQuery({ limit: 100 }, { enabled, retry: false });
  const deletions = trpc.admin.deletion.list.useQuery(undefined, { enabled, retry: false });
  const performance = trpc.performance.list.useQuery({ limit: 100 }, { enabled, retry: false });
  const gates = trpc.evaluation.listGates.useQuery({ limit: 100 }, { enabled, retry: false });
  const benchmarks = trpc.evaluation.listBenchmarks.useQuery({ limit: 10 }, { enabled, retry: false });

  if (loading) return <main className="min-h-screen bg-[#f2eee4] p-8 text-[#18241f]" role="status">পরিচয় যাচাই হচ্ছে…</main>;
  if (!user) return <main className="min-h-screen bg-[#f2eee4] p-8 text-[#18241f]"><div className="mx-auto max-w-md py-24 text-center"><LockKeyhole className="mx-auto h-9 w-9 text-[#c85a3f]" /><h1 className="mt-5 font-display text-4xl">Admin console-এর আগে পরিচয় নিশ্চিত করুন।</h1><p className="mt-4 text-sm leading-7 text-[#18241f]/65">এই control center-এর প্রতিটি query server-side admin permission দিয়ে সুরক্ষিত।</p><Link href="/auth/login?returnTo=%2Fadmin" className="mt-7 inline-flex bg-[#c85a3f] px-5 py-3 font-semibold text-white">Sign in / create account <ArrowRight className="ml-2 h-4 w-4" /></Link></div></main>;
  if (user.role !== "admin") return <main className="min-h-screen bg-[#f2eee4] p-8 text-[#18241f]"><div className="mx-auto max-w-md py-24 text-center"><ShieldAlert className="mx-auto h-9 w-9 text-[#c85a3f]" /><h1 className="mt-5 font-display text-4xl">এই console সীমিত।</h1><p className="mt-4 text-sm leading-7 text-[#18241f]/65">আপনার account-এ admin permission নেই। কোনো management action পাঠানো হয়নি।</p><Link href="/" className="mt-7 inline-flex border border-[#18241f]/25 px-5 py-3 font-semibold">মূল সাইটে ফিরুন</Link></div></main>;

  const connectorItems = connectors.data ?? [];
  const traceItems = traces.data ?? [];
  const pendingGates = (gates.data ?? []).filter(item => item.status === "pending");
  const failedGates = (gates.data ?? []).filter(item => item.status === "fail");
  const openDeletions = (deletions.data ?? []).filter(item => item.status === "pending" || item.status === "in_review");
  const latestBenchmark = benchmarks.data?.[0];
  const latestPerformance = performance.data?.[0];
  const dataError = [connectors, traces, deletions, performance, gates, benchmarks].find(query => query.error);

  return <main className="min-h-screen bg-[#f2eee4] px-5 py-6 text-[#18241f] sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><header className="flex flex-col gap-5 border-b border-[#18241f]/15 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/" className="text-sm text-[#18241f]/60 hover:text-[#c85a3f]">← মূল সাইট</Link><p className="mt-7 text-xs uppercase tracking-[.25em] text-[#c85a3f]">DSAI / operator control center</p><h1 className="mt-3 max-w-4xl font-display text-5xl leading-[.95] sm:text-7xl">সিস্টেম দেখুন,<br /><em className="text-[#c85a3f]">সীমা মানুন।</em></h1><p className="mt-5 max-w-3xl text-base leading-8 text-[#18241f]/65">এটি system management-এর evidence layer। Query ও mutation server-side role gate-এর মধ্য দিয়ে যায়; provider absent, data unavailable বা gate pending হলে console তা hidden success হিসেবে দেখায় না।</p></div><Button variant="outline" className="border-[#18241f]/25" onClick={() => { void Promise.all([connectors.refetch(), traces.refetch(), deletions.refetch(), performance.refetch(), gates.refetch(), benchmarks.refetch()]); }}><RefreshCw className="mr-2 h-4 w-4" />Refresh evidence</Button></header>
      {dataError && <div className="mt-6 flex items-start gap-3 border border-[#c85a3f]/35 bg-[#f7e5dd] p-4 text-sm leading-6"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#c85a3f]" /><div><strong>এক বা একাধিক management query পাওয়া যায়নি।</strong><p className="text-[#18241f]/65">Deployment continuity বজায় আছে; সংশ্লিষ্ট module-এর error state খুলে operator retry করুন।</p></div></div>}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Connector posture" value={`${connectorItems.filter(item => item.status === "ready").length}/${connectorItems.length || 0}`} detail="ready / catalogued; configured মানেই live provider pass নয়" tone={connectorItems.some(item => item.status === "degraded") ? "text-amber-700" : "text-emerald-700"} /><Metric label="System traces" value={String(traceItems.length)} detail="latest redacted execution summaries; step payload নয়" /><Metric label="Open privacy work" value={String(openDeletions.length)} detail="pending বা in-review deletion requests" tone={openDeletions.length ? "text-amber-700" : "text-emerald-700"} /><Metric label="Release gates" value={`${failedGates.length} fail`} detail={`${pendingGates.length} pending · latest benchmark ${latestBenchmark ? `${latestBenchmark.scoreBps / 100}%` : "not run"}`} tone={failedGates.length ? "text-[#c85a3f]" : pendingGates.length ? "text-amber-700" : "text-emerald-700"} /></section>
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><article className="border border-[#18241f]/15 bg-white/45 p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#c85a3f]">Control map</p><h2 className="mt-2 font-display text-3xl">প্রতিটি management surface</h2></div><ShieldCheck className="h-6 w-6 text-[#c85a3f]" /></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{adminLinks.map(([href, title, detail, Icon]) => <Link key={href} href={href} className="group border border-[#18241f]/10 bg-white/55 p-4 transition hover:border-[#c85a3f]/50 hover:bg-white/80"><div className="flex items-start justify-between gap-3"><Icon className="h-5 w-5 text-[#c85a3f]" /><ArrowRight className="h-4 w-4 text-[#18241f]/35 transition group-hover:translate-x-1" /></div><strong className="mt-4 block">{title}</strong><p className="mt-1 text-xs leading-5 text-[#18241f]/60">{detail}</p></Link>)}</div></article><article className="border border-[#18241f]/15 bg-[#18241f] p-6 text-[#f2eee4]"><p className="text-[10px] uppercase tracking-[.2em] text-[#d7a34b]">Evidence snapshot</p><h2 className="mt-2 font-display text-3xl">শেষ মাপা signal</h2><dl className="mt-6 space-y-5 text-sm"><div className="flex justify-between gap-4 border-b border-white/15 pb-4"><dt className="text-white/60">Latest p95</dt><dd className="font-semibold">{latestPerformance ? `${latestPerformance.p95Ms}ms` : "not measured"}</dd></div><div className="flex justify-between gap-4 border-b border-white/15 pb-4"><dt className="text-white/60">Gate status</dt><dd className="font-semibold">{failedGates.length ? "attention required" : pendingGates.length ? "pending" : "clear"}</dd></div><div className="flex justify-between gap-4 border-b border-white/15 pb-4"><dt className="text-white/60">Trace posture</dt><dd className="font-semibold">{traceItems.some(item => item.status === "failed") ? "failures present" : "no recent failure"}</dd></div></dl><Link href="/quality-gates" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#d7a34b]">Quality Gates খুলুন <ArrowRight className="h-4 w-4" /></Link></article></section>
      <footer className="mt-10 border-t border-[#18241f]/15 pt-5 text-xs leading-6 text-[#18241f]/55">Admin readiness boundary: this console does not grant provider credentials, bypass OAuth consent, execute external CRM/Calendar writes, fabricate malware verdicts, or declare production readiness while evidence gates remain pending.</footer></div></main>;
}
