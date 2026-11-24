import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import WorkDeskTextPanel from "@/components/WorkDeskTextPanel";
import WorkDeskMarketplace from "@/components/WorkDeskMarketplace";
import ContractAcknowledgmentPanel from "@/components/ContractAcknowledgmentPanel";
import { buildGovernmentServiceGuidance, type GovernmentService } from "@/data/governmentServices";

export default function Workspace() {
  const { user, loading } = useAuth();
  const [skillPrompt, setSkillPrompt] = useState<{ id: string; prompt: string } | null>(null);
  const saveGovernmentService = trpc.access.create.useMutation({
    onSuccess: () => toast.success("সরকারি সেবাটি কাজের তালিকায় সংরক্ষিত হয়েছে।"),
    onError: () => toast.error("সেবাটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।"),
  });

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f7f8f6] text-[#1d3028]" role="status">
    <span className="inline-flex items-center gap-3 text-sm"><Loader2 className="h-5 w-5 animate-spin" /> Work Desk প্রস্তুত হচ্ছে…</span>
  </main>;

  if (!user || user.loginMethod === "supabase-anonymous") {
    const returnTo = window.location.pathname + window.location.search;
    return <main className="grid min-h-screen place-items-center bg-[#f7f8f6] px-4 text-[#1d3028]">
      <section className="w-full max-w-md rounded-3xl border border-[#e2e8e2] bg-white p-8 text-center shadow-sm">
        <LockKeyhole className="mx-auto h-8 w-8 text-[#23684d]" />
        <h1 className="mt-5 text-2xl font-semibold">Work Desk-এ প্রবেশ করুন</h1>
        <p className="mt-2 text-sm leading-6 text-[#68766d]">আপনার কাজ, নথি ও সংরক্ষিত ফলাফল ব্যক্তিগত রাখতে অ্যাকাউন্টে প্রবেশ করুন।</p>
        <Button onClick={() => { window.location.href = "/auth/login?returnTo=" + encodeURIComponent(returnTo); }} className="mt-6 min-h-11 w-full bg-[#176b4b] text-white hover:bg-[#10563b]">প্রবেশ করুন / অ্যাকাউন্ট তৈরি করুন</Button>
        <Link href="/" className="mt-4 inline-flex text-sm text-[#64746a] hover:text-[#176b4b]">মূল পাতায় ফিরুন</Link>
      </section>
    </main>;
  }

  const useSkill = (prompt: string) => {
    setSkillPrompt({ id: crypto.randomUUID(), prompt });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const useGovernmentService = (service: GovernmentService) => useSkill([
    buildGovernmentServiceGuidance(service),
    "আমার দেওয়া তথ্য ও নথির ভিত্তিতে এই সেবার প্রস্তুতি, প্রয়োজনীয় কাগজপত্র এবং পরবর্তী ধাপ সাজিয়ে দিন।",
    "কোনো সরকারি ফর্ম জমা, OTP, payment, tender bid বা approval সম্পন্ন হয়েছে বলে দাবি করবেন না।",
  ].join("\n\n"));

  return <main className="min-h-screen bg-[#f7f8f6] text-[#1d3028]">
    <header className="sticky top-0 z-40 border-b border-[#e2e8e2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/workspace" className="inline-flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#176b4b] text-sm font-bold text-white">D</span>
          <span>DSAI <span className="font-normal text-[#728078]">/ Work Desk</span></span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="DSAI navigation">
          <span aria-current="page" className="rounded-full bg-[#eaf4ee] px-3 py-2 text-xs font-semibold text-[#176b4b]">Work Desk</span>
          <Link href="/ai-hub" className="rounded-full px-3 py-2 text-xs font-medium text-[#66756b] transition hover:bg-[#f1f5f1] hover:text-[#176b4b]">AI Hub</Link>
          <Link href="/privacy#deletion-request" className="hidden rounded-full px-3 py-2 text-xs text-[#66756b] hover:bg-[#f1f5f1] sm:inline-flex">ডেটা অধিকার</Link>
        </nav>
      </div>
    </header>

    <section aria-label="Work Desk quick start" className="relative isolate overflow-hidden border-b border-[#dce8df] bg-[#eaf3ec]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full border border-[#b7d0bd]/60" />
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#397657]">DSAI / WORK DESK</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1d392b] sm:text-3xl">এক ডেস্কে AI কাজ খুঁজুন, তৈরি করুন ও গুছিয়ে রাখুন।</h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[#536b5b]">আপনার নির্দেশনা লিখুন, প্রয়োজন হলে নথি যোগ করুন, তারপর ফলাফল সম্পাদনা ও সংরক্ষণ করুন। গুরুত্বপূর্ণ কাজের আগে AI-এর উত্তর যাচাই করুন।</p>
        </div>
        <nav aria-label="Work Desk shortcuts" className="flex flex-wrap gap-2">
          <a href="#workdesk-text-prompt" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#176b4b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10563b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b4b] focus-visible:ring-offset-2">কাজ শুরু করুন</a>
          <Link href="/ai-hub" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#c8d9cc] bg-white px-5 py-2.5 text-sm font-semibold text-[#315640] transition hover:border-[#8fb49b] hover:bg-[#f8fbf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b4b] focus-visible:ring-offset-2">AI Hub দেখুন</Link>
          <Link href="/workspace?panel=marketplace" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#c8d9cc] bg-white px-5 py-2.5 text-sm font-semibold text-[#315640] transition hover:border-[#8fb49b] hover:bg-[#f8fbf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b4b] focus-visible:ring-offset-2">Connections</Link>
        </nav>
      </div>
    </section>

    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <WorkDeskTextPanel skillPrompt={skillPrompt} initialShowFiles={window.location.pathname === "/documents" || new URLSearchParams(window.location.search).get("panel") === "files"} />
      <section aria-label="Work Desk tools and services" className="scroll-mt-20 border-t border-[#e0e7e0] pt-7">
        <WorkDeskMarketplace
          isAdmin={user.role === "admin"}
          onUseSkill={useSkill}
          onUseGovernmentService={useGovernmentService}
          onSaveGovernmentService={(service: GovernmentService) => saveGovernmentService.mutate({
            title: service.title,
            workflow: service.workflow,
            language: "bn",
            riskLevel: "medium",
            notes: [
              "সরকারি পোর্টাল: " + service.officialUrl,
              "দপ্তর: " + service.agency,
              "প্রয়োজনীয় প্রস্তুতি:",
              ...service.preparation.map((item, index) => (index + 1) + ". " + item),
              "গুরুত্বপূর্ণ সীমা: " + service.boundary,
            ].join("\n"),
          })}
        />
      </section>
      <details className="rounded-2xl border border-[#e1e8e1] bg-white px-5 py-4">
        <summary className="cursor-pointer text-sm font-semibold text-[#42594b]">নথি গ্রহণের প্রমাণ</summary>
        <div className="pt-4"><ContractAcknowledgmentPanel /></div>
      </details>
    </div>
  </main>;
}
