import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import WorkDeskTextPanel from "@/components/WorkDeskTextPanel";
import WorkDeskMarketplace from "@/components/WorkDeskMarketplace";
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
  if (!user || user.loginMethod === "supabase-anonymous") return null;

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
        <nav className="flex items-center gap-1" aria-label="DSAI">
          <span aria-current="page" className="rounded-full bg-[#eaf4ee] px-3 py-2 text-xs font-semibold text-[#176b4b]">Work Desk</span>
          <Link href="/ai-hub" className="rounded-full px-3 py-2 text-xs font-semibold text-[#52675a] hover:bg-[#f1f5f1] hover:text-[#176b4b]">AI Hub</Link>
        </nav>
      </div>
    </header>

    <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-7">
      <WorkDeskTextPanel skillPrompt={skillPrompt} initialShowFiles={window.location.pathname === "/documents" || new URLSearchParams(window.location.search).get("panel") === "files"} />
      <section aria-label="কাজের সেবা ও টুল" className="border-t border-[#e0e7e0] pt-5">
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
    </div>
  </main>;
}
