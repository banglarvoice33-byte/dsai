import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
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

  return <DashboardLayout>
    <div className="min-h-screen bg-[#f7f8f6] text-[#1d3028]">
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
  </DashboardLayout>;
}
