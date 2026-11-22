import { Activity, AlertTriangle, ArrowUpRight, Bot, CheckCircle2, ClipboardCheck, FileSearch, Files, RefreshCw, ShieldCheck, Users, Workflow } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

type Stat = { label: string; value: number | string; note?: string };
type Panel = {
  number: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Activity;
  stats: Stat[];
  status?: { label: string; tone: "good" | "warn" | "bad" | "neutral" };
};

function StatGrid({ stats }: { stats: Stat[] }) {
  return <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
    {stats.map(stat => <div key={stat.label} className="min-w-0 border-t border-[#18241f]/10 pt-3">
      <dt className="text-[11px] text-[#18241f]/55">{stat.label}</dt>
      <dd className="mt-1 break-words text-2xl font-semibold tabular-nums text-[#18241f]">{stat.value}</dd>
      {stat.note && <dd className="mt-1 text-[10px] leading-4 text-[#18241f]/45">{stat.note}</dd>}
    </div>)}
  </dl>;
}

export default function AdminOperations() {
  const { user } = useAuth();
  const enabled = user?.role === "admin";
  const snapshot = trpc.admin.operations.snapshot.useQuery(undefined, {
    enabled,
    retry: 1,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const data = snapshot.data;
  const panels: Panel[] = data ? [
    { number: "01", title: "অ্যাকাউন্ট ও পরিচয়", description: "ব্যবহারকারী ও প্রশাসক অ্যাকাউন্টের aggregate অবস্থা।", href: "/admin", icon: Users, stats: [
      { label: "মোট অ্যাকাউন্ট", value: data.accounts.total }, { label: "Admin", value: data.accounts.admins },
    ] },
    { number: "02", title: "ফাইল নিরাপত্তা ও quarantine", description: "ফাইলের scan-state এবং private storage configuration।", href: "/documents", icon: ShieldCheck, status: { label: data.fileSecurity.scannerCredentialsConfigured ? "Scanner credentials configured" : "Scanner credentials missing", tone: data.fileSecurity.scannerCredentialsConfigured ? "good" : "warn" }, stats: [
      { label: "মোট ফাইল", value: data.fileSecurity.total }, { label: "Quarantine", value: data.fileSecurity.quarantined }, { label: "Clean verdict", value: data.fileSecurity.clean }, { label: "Infected", value: data.fileSecurity.infected }, { label: "Unavailable", value: data.fileSecurity.unavailable }, { label: "Storage", value: data.fileSecurity.storageProvider ?? "Not configured" },
    ] },
    { number: "03", title: "Document processing queue", description: "প্রতিটি extraction task-এর প্রকৃত database state।", href: "/documents", icon: Files, stats: [
      { label: "মোট task", value: data.documentPipeline.total }, { label: "Queued", value: data.documentPipeline.queued }, { label: "Running", value: data.documentPipeline.running }, { label: "Retry wait", value: data.documentPipeline.retryWait }, { label: "Completed", value: data.documentPipeline.completed }, { label: "Failed", value: data.documentPipeline.failed },
    ] },
    { number: "04", title: "Knowledge Hub index", description: "Document index ও তৈরি হওয়া searchable chunks-এর সংখ্যা।", href: "/workspace", icon: FileSearch, stats: [
      { label: "Documents", value: data.knowledgeHub.documents }, { label: "Ready", value: data.knowledgeHub.ready }, { label: "Processing", value: data.knowledgeHub.processing }, { label: "Failed", value: data.knowledgeHub.failed }, { label: "Chunks", value: data.knowledgeHub.chunks },
    ] },
    { number: "05", title: "AI WorkDesk tasks", description: "AI text task-এর queue, completion ও failure count।", href: "/workspace", icon: Bot, stats: [
      { label: "মোট task", value: data.aiWorkdesk.total }, { label: "Queued", value: data.aiWorkdesk.queued }, { label: "Running", value: data.aiWorkdesk.running }, { label: "Completed", value: data.aiWorkdesk.completed }, { label: "Failed", value: data.aiWorkdesk.failed },
    ] },
    { number: "06", title: "CRM pipeline", description: "Lead lifecycle-এর বর্তমান database distribution।", href: "/lead-composer", icon: Workflow, stats: [
      { label: "Active leads", value: data.crmPipeline.total }, { label: "New", value: data.crmPipeline.new }, { label: "Qualified", value: data.crmPipeline.qualified }, { label: "Contacted", value: data.crmPipeline.contacted }, { label: "Interested", value: data.crmPipeline.interested }, { label: "Converted", value: data.crmPipeline.converted }, { label: "Lost", value: data.crmPipeline.lost }, { label: "Activities", value: data.crmPipeline.activities },
    ] },
    { number: "07", title: "Follow-up control", description: "Overdue ও ভবিষ্যৎ follow-up—দুটিই আলাদা করে দেখানো হয়।", href: "/lead-composer", icon: AlertTriangle, status: data.crmFollowups.overdue > 0 ? { label: "Overdue follow-up exists", tone: "warn" } : { label: "No overdue follow-up", tone: "good" }, stats: [
      { label: "Overdue", value: data.crmFollowups.overdue }, { label: "Scheduled", value: data.crmFollowups.scheduled },
    ] },
    { number: "08", title: "Document acknowledgment", description: "Receipt/acknowledgment evidence; এটি identity-verified legal e-signature নয়।", href: "/workspace", icon: ClipboardCheck, stats: [
      { label: "মোট", value: data.acknowledgments.total }, { label: "Pending", value: data.acknowledgments.pending }, { label: "Confirmed", value: data.acknowledgments.confirmed }, { label: "Expired", value: data.acknowledgments.expired }, { label: "Audit events", value: data.acknowledgments.events },
    ] },
    { number: "09", title: "AI agent operations", description: "Agent trace, approval pause ও execution outcome।", href: "/agents", icon: Activity, stats: [
      { label: "মোট trace", value: data.agentOperations.total }, { label: "Queued", value: data.agentOperations.queued }, { label: "Running", value: data.agentOperations.running }, { label: "Approval", value: data.agentOperations.approval }, { label: "Completed", value: data.agentOperations.completed }, { label: "Failed", value: data.agentOperations.failed },
    ] },
    { number: "10", title: "Benchmark ও release gates", description: "বাংলা benchmark এবং quality/security/operations gate-এর recorded ফল।", href: "/admin/gate-evidence", icon: CheckCircle2, status: data.qualityRelease.gateFailed > 0 ? { label: "Release gate failure recorded", tone: "bad" } : data.qualityRelease.gatePending > 0 ? { label: "Pending release gates", tone: "warn" } : { label: "No recorded failed/pending gate", tone: "neutral" }, stats: [
      { label: "Benchmark runs", value: data.qualityRelease.benchmarks }, { label: "Benchmark passed", value: data.qualityRelease.benchmarkPassed }, { label: "Benchmark failed", value: data.qualityRelease.benchmarkFailed }, { label: "Release gates", value: data.qualityRelease.gates }, { label: "Gate passed", value: data.qualityRelease.gatePassed }, { label: "Gate failed", value: data.qualityRelease.gateFailed }, { label: "Gate pending", value: data.qualityRelease.gatePending },
    ] },
  ] : [];

  const toneClass = (tone: NonNullable<Panel["status"]>["tone"]) => ({
    good: "border-emerald-700/20 bg-emerald-50 text-emerald-800",
    warn: "border-amber-700/20 bg-amber-50 text-amber-800",
    bad: "border-rose-700/20 bg-rose-50 text-rose-800",
    neutral: "border-slate-700/15 bg-slate-50 text-slate-700",
  })[tone];

  return <main className="min-h-screen bg-[#f2eee4] px-4 py-6 text-[#18241f] sm:px-7 lg:px-10">
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-5 border-b border-[#18241f]/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div><Link href="/admin" className="text-sm text-[#18241f]/60 hover:text-[#c85a3f]">← Admin overview</Link>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[.25em] text-[#c85a3f]">DSAI / Live operations</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">Operations Center</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#18241f]/65">দশটি subsystem-এর aggregate state সরাসরি PostgreSQL থেকে পড়া হচ্ছে। এটি telemetry history বা external service-এর live health probe দাবি করে না।</p>
        </div>
        <Button variant="outline" onClick={() => void snapshot.refetch()} disabled={snapshot.isFetching} className="border-[#18241f]/25">
          <RefreshCw className={`mr-2 h-4 w-4 ${snapshot.isFetching ? "animate-spin" : ""}`} /> Refresh data
        </Button>
      </header>

      {snapshot.isLoading && <div className="mt-8 rounded-xl border border-[#18241f]/15 bg-white/60 p-8 text-sm" role="status">PostgreSQL থেকে live aggregate পড়া হচ্ছে…</div>}
      {snapshot.isError && <div className="mt-8 rounded-xl border border-rose-700/25 bg-rose-50 p-5 text-sm text-rose-900" role="alert">
        <strong>Operations snapshot পাওয়া যায়নি।</strong><p className="mt-2">Database query ব্যর্থ হয়েছে; কোনো metric-কে শূন্য বা healthy ধরে দেখানো হয়নি।</p>
        <Button variant="outline" className="mt-4" onClick={() => void snapshot.refetch()}>আবার চেষ্টা করুন</Button>
      </div>}
      {data && <>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#18241f]/55">
          <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-600" /> PostgreSQL snapshot</span>
          <span>শেষ পর্যবেক্ষণ: {new Date(data.observedAt).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}</span>
          <span>Auto refresh: 30s</span>
        </div>
        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {panels.map(panel => <article key={panel.number} className="flex min-w-0 flex-col border border-[#18241f]/15 bg-white/65 p-5 shadow-[0_12px_35px_rgba(24,36,31,.04)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center border border-[#c85a3f]/25 bg-[#c85a3f]/8 text-[#c85a3f]"><panel.icon className="h-5 w-5" /></span>
                <div><p className="text-[10px] font-semibold tracking-[.18em] text-[#c85a3f]">MODULE {panel.number}</p><h2 className="mt-1 text-base font-semibold">{panel.title}</h2></div>
              </div>
              <Link href={panel.href} aria-label={`${panel.title} খুলুন`} className="rounded-full p-2 text-[#18241f]/55 hover:bg-[#18241f]/5 hover:text-[#c85a3f]"><ArrowUpRight className="h-4 w-4" /></Link>
            </div>
            <p className="mt-3 min-h-10 text-xs leading-5 text-[#18241f]/55">{panel.description}</p>
            {panel.status && <span className={`mt-3 w-fit border px-2.5 py-1 text-[10px] font-medium ${toneClass(panel.status.tone)}`}>{panel.status.label}</span>}
            <StatGrid stats={panel.stats} />
          </article>)}
        </section>
        <aside className="mt-5 border border-amber-800/20 bg-amber-50/80 p-4 text-xs leading-6 text-amber-950">
          **নিরাপত্তা ব্যাখ্যা:** Scanner credentials configured মানে scanner service live/healthy প্রমাণিত নয়। File scan clean verdict-ই আলাদা security gate। এখানে কোনো user content বা recipient ব্যক্তিগত তথ্য দেখানো হয় না।
        </aside>
      </>}
    </div>
  </main>;
}
