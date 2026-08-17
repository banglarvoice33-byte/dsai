import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, KeyRound, Loader2, Power, RefreshCw, ShieldCheck, WifiOff } from "lucide-react";
import { useLocation } from "wouter";

const emblem = "/manus-storage/genesis-emblem_10c5431a.png";

function statusCopy(status: string) {
  if (status === "ready") return "Configured / ready for staging";
  if (status === "degraded") return "Safe fallback / credentials missing";
  if (status === "error") return "Provider error / actions paused";
  return "Disabled / no external calls";
}

export default function AdminConnectors() {
  const [, setLocation] = useLocation();
  const { user, loading, error: authError, refresh: refreshAuth } = useAuth();
  const [authWaitExpired, setAuthWaitExpired] = useState(false);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!loading) {
      setAuthWaitExpired(false);
      return;
    }
    const timer = window.setTimeout(() => setAuthWaitExpired(true), 8000);
    return () => window.clearTimeout(timer);
  }, [loading]);
  const connectors = trpc.admin.connectors.list.useQuery(undefined, {
    enabled: user?.role === "admin",
    retry: false,
  });
  const setEnabled = trpc.admin.connectors.setEnabled.useMutation({
    onSuccess: () => {
      toast.success("Connector policy updated; live provider actions remain gated by configuration.");
      void utils.admin.connectors.list.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const test = trpc.admin.connectors.test.useMutation({
    onSuccess: result => toast.message(result.configured ? "Environment values are present" : "Safe fallback remains active", { description: result.message }),
    onError: error => toast.error(error.message),
  });

  if (loading && !authWaitExpired) {
    return <div className="min-h-screen bg-[#f2eee4] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#c85a3f]" /></div>;
  }

  if (loading && authWaitExpired && !authError) {
    return <main className="min-h-screen bg-[#f2eee4] text-[#18241f] flex items-center justify-center p-6"><div className="max-w-lg text-center"><p className="text-xs uppercase tracking-[0.25em] text-[#c85a3f] mb-4">DSAI / Connection Check</p><h1 className="font-display text-4xl">সংযোগের উত্তর আসতে দেরি হচ্ছে।</h1><p className="mt-4 text-[#18241f]/65 leading-7">Session request নির্ধারিত সময়ের মধ্যে উত্তর দেয়নি। এটি provider credentials বা deployment বন্ধ হওয়ার প্রমাণ নয়—আবার চেষ্টা করুন অথবা sign in / create account শুরু করুন।</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button onClick={() => void refreshAuth()} variant="outline" className="border-[#18241f]/25">আবার পরীক্ষা করুন</Button><Button onClick={() => startLogin()} className="bg-[#c85a3f] hover:bg-[#b54d35]">Sign in / create account</Button></div></div></main>;
  }

  if (!user && authError) {
    return <main className="min-h-screen bg-[#f2eee4] text-[#18241f] flex items-center justify-center p-6"><div className="max-w-lg text-center"><p className="text-xs uppercase tracking-[0.25em] text-[#c85a3f] mb-4">DSAI / Connection Check</p><h1 className="font-display text-4xl">সংযোগটি এখনো নিশ্চিত হয়নি।</h1><p className="mt-4 text-[#18241f]/65 leading-7">এটি login failure নাও হতে পারে—API session, browser cookie বা development preview সংযোগ সাময়িকভাবে অনুপস্থিত হতে পারে। Provider credentials বা deployment বন্ধ করা হয়নি।</p><p className="mt-4 border-l-2 border-[#d7a34b] pl-4 text-left text-xs leading-6 text-[#18241f]/55">Diagnostic: {authError.message}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button onClick={() => void refreshAuth()} variant="outline" className="border-[#18241f]/25">আবার পরীক্ষা করুন</Button><Button onClick={() => startLogin()} className="bg-[#c85a3f] hover:bg-[#b54d35]">Sign in / create account</Button></div></div></main>;
  }

  if (!user) {
    return <main className="min-h-screen bg-[#f2eee4] text-[#18241f] flex items-center justify-center p-6"><div className="max-w-md text-center"><p className="text-xs uppercase tracking-[0.25em] text-[#c85a3f] mb-4">DSAI / Admin Gate</p><h1 className="font-display text-4xl">প্রথমে পরিচয় নিশ্চিত করুন।</h1><p className="mt-4 text-[#18241f]/65 leading-7">Connector console-এ প্রবেশের জন্য নিরাপদ OAuth authentication প্রয়োজন। প্রথমবার হলে অনুমোদিত provider portal-এ account তৈরি হতে পারে।</p><Button onClick={() => startLogin()} className="mt-8 bg-[#c85a3f] hover:bg-[#b54d35]">Sign in / create account</Button></div></main>;
  }

  if (user.role !== "admin") {
    return <main className="min-h-screen bg-[#f2eee4] text-[#18241f] flex items-center justify-center p-6"><div className="max-w-md text-center"><ShieldCheck className="mx-auto h-10 w-10 text-[#c85a3f]" /><h1 className="font-display text-4xl mt-5">এই console সীমিত।</h1><p className="mt-4 text-[#18241f]/65 leading-7">আপনার account-এ admin permission নেই। Provider credential বা connector policy পরিবর্তন করা হয়নি।</p><Button onClick={() => setLocation("/")} variant="outline" className="mt-8 border-[#18241f]/25">মূল সাইটে ফিরুন</Button></div></main>;
  }

  const items = connectors.data ?? [];
  const configuredCount = items.filter(item => item.configured).length;

  return (
    <main className="min-h-screen bg-[#f2eee4] text-[#18241f] px-5 py-6 sm:px-10 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col gap-5 border-b border-[#18241f]/15 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => setLocation("/")} className="flex items-center gap-3 text-left" aria-label="Return to DSAI home">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18241f] p-2"><img src={emblem} alt="DSAI emblem" className="h-full w-full object-contain" /></span>
            <span><span className="block font-display text-xl tracking-[0.18em]">DSAI</span><span className="text-[10px] uppercase tracking-[0.22em] text-[#18241f]/55">Connector console</span></span>
          </button>
          <Button onClick={() => setLocation("/")} variant="outline" className="w-fit border-[#18241f]/25">Back to public site</Button>
        </header>

        <section className="py-12 lg:flex lg:items-end lg:justify-between">
          <div className="max-w-2xl"><p className="text-xs uppercase tracking-[0.25em] text-[#c85a3f]">Runtime API layer / ০১</p><h1 className="font-display text-5xl leading-[0.98] mt-4 sm:text-7xl">সংযোগ থাকবে,<br /><em className="text-[#c85a3f]">deployment থামবে না।</em></h1><p className="mt-6 max-w-xl text-base leading-8 text-[#18241f]/70">এই console provider-এর secret দেখায় না। এটি connector policy, environment readiness এবং safe fallback পরিচালনা করে। Credential যোগ হলে এখানে test করা যাবে; provider না থাকলে DSAI স্বাভাবিকভাবে চালু থাকবে।</p></div>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:mt-0 lg:w-[260px]"><div className="border border-[#18241f]/15 bg-white/35 p-4"><KeyRound className="h-4 w-4 text-[#d7a34b]" /><p className="mt-5 text-2xl font-semibold">{configuredCount}/{items.length}</p><p className="text-xs text-[#18241f]/55">env-ready</p></div><div className="border border-[#18241f]/15 bg-white/35 p-4"><ShieldCheck className="h-4 w-4 text-[#c85a3f]" /><p className="mt-5 text-2xl font-semibold">Admin</p><p className="text-xs text-[#18241f]/55">role verified</p></div></div>
        </section>

        <section className="mb-8 border border-[#18241f]/15 bg-white/50 p-4 shadow-[0_10px_30px_rgba(24,36,31,0.04)] sm:p-6" aria-labelledby="mobile-setup-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c85a3f]">Mobile operator path</p><h2 id="mobile-setup-title" className="mt-2 font-display text-2xl sm:text-3xl">মোবাইল থেকে ৩ ধাপে পরীক্ষা</h2><p className="mt-2 text-sm leading-6 text-[#18241f]/65">এখানে secret paste করতে হবে না। আগে Management UI-তে server secret যোগ করুন, তারপর এই পেজে ফিরে environment test করুন।</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#18241f]/8 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#18241f]/65"><ShieldCheck className="h-3.5 w-3.5" /> safe flow</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3" role="list" aria-label="Mobile setup steps"><div className="border border-[#18241f]/10 bg-[#f2eee4]/70 p-3" role="listitem"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c85a3f]">০১</p><p className="mt-2 text-sm font-semibold">Secrets সেট করুন</p><p className="mt-1 text-xs leading-5 text-[#18241f]/60">Settings → Secrets-এ server-only values দিন।</p></div><div className="border border-[#18241f]/10 bg-[#f2eee4]/70 p-3" role="listitem"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c85a3f]">০২</p><p className="mt-2 text-sm font-semibold">Deploy / restart</p><p className="mt-1 text-xs leading-5 text-[#18241f]/60">VPS-এ `bash deploy-genesis.sh` চালান।</p></div><div className="border border-[#18241f]/10 bg-[#f2eee4]/70 p-3" role="listitem"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c85a3f]">০৩</p><p className="mt-2 text-sm font-semibold">Test environment</p><p className="mt-1 text-xs leading-5 text-[#18241f]/60">নিচের connector card থেকে test করুন।</p></div></div>
            <p className="mt-4 border-l-2 border-[#d7a34b] pl-3 text-xs leading-5 text-[#18241f]/60">Test সফল হলেও live provider action চালু হবে না যতক্ষণ adapter, permission, staging ও rollback gate সম্পূর্ণ না হয়।</p>
          </section>

        <div className="mb-6 flex flex-col gap-3 border-y border-[#18241f]/15 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">Connector registry</p><p className="text-xs text-[#18241f]/55">No secret value is rendered or stored here.</p></div><Button onClick={() => void connectors.refetch()} variant="outline" size="sm" className="w-full border-[#18241f]/25 sm:w-fit" disabled={connectors.isFetching}><RefreshCw className={`mr-2 h-3.5 w-3.5 ${connectors.isFetching ? "animate-spin" : ""}`} />Refresh</Button></div>

        {connectors.isLoading ? <div className="py-16 text-center text-[#18241f]/60"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#c85a3f]" /><p className="mt-3 text-sm">Connector state পড়া হচ্ছে…</p></div> : connectors.error ? <div className="border border-[#c85a3f]/35 bg-[#c85a3f]/8 p-6"><AlertTriangle className="h-5 w-5 text-[#c85a3f]" /><p className="mt-3 font-semibold">Registry এখন পাওয়া যাচ্ছে না।</p><p className="mt-2 text-sm text-[#18241f]/65">Deployment বন্ধ হয়নি; provider actions safe fallback-এ আছে।</p></div> : <div className="grid gap-4 md:grid-cols-2">{items.map(item => { const isEnabled = Boolean(item.enabled); const busy = setEnabled.isPending && setEnabled.variables?.slug === item.slug; return <article key={item.slug} className="border border-[#18241f]/15 bg-white/45 p-5 shadow-[0_12px_35px_rgba(24,36,31,0.05)]"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[#c85a3f]">{item.category}</p><h2 className="font-display text-2xl mt-2">{item.label}</h2></div><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${item.status === "ready" ? "bg-emerald-100 text-emerald-800" : item.status === "degraded" ? "bg-amber-100 text-amber-800" : "bg-[#18241f]/8 text-[#18241f]/65"}`}>{item.status === "ready" ? <CheckCircle2 className="h-3 w-3" /> : item.status === "degraded" ? <WifiOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}{item.status}</span></div><p className="mt-4 text-sm leading-6 text-[#18241f]/65">{statusCopy(item.status)}</p><div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="outline" className="border-[#18241f]/25" onClick={() => test.mutate({ slug: item.slug })} disabled={test.isPending}><RefreshCw className={`mr-2 h-3.5 w-3.5 ${test.isPending && test.variables?.slug === item.slug ? "animate-spin" : ""}`} />Test environment</Button><Button size="sm" className={isEnabled ? "bg-[#18241f] hover:bg-[#263a32]" : "bg-[#c85a3f] hover:bg-[#b54d35]"} onClick={() => setEnabled.mutate({ slug: item.slug, enabled: !isEnabled })} disabled={busy}>{busy && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}{isEnabled ? "Disable policy" : "Enable policy"}</Button></div><p className="mt-4 border-l-2 border-[#d7a34b] pl-3 text-xs leading-5 text-[#18241f]/55">{item.configured ? "Required environment values detected; provider-specific OAuth/health checks still required." : "No provider secret detected. Enabling only records policy; live actions remain unavailable."}</p></article>; })}</div>}

        <footer className="mt-12 border-t border-[#18241f]/15 pt-5 text-xs leading-6 text-[#18241f]/55">DSAI safety contract: no secret values in UI, no automatic provider activation, no outbound action when a connector is absent or degraded.</footer>
      </div>
    </main>
  );
}
