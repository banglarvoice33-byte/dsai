import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";

const applicationLabels: Record<string, string> = {
  pending: "আপনার আবেদন যাচাই করা হচ্ছে।",
  approved: "আপনার আবেদন অনুমোদিত হয়েছে।",
  rejected: "দুঃখিত, আপনার আবেদনটি অনুমোদিত হয়নি।",
  withdrawn: "আপনার আবেদন প্রত্যাহার করা হয়েছে।",
};

export default function Scholarship() {
  const { user, loading } = useAuth();
  const application = trpc.scholarship.application.useQuery(undefined, { enabled: Boolean(user) });
  const status = trpc.scholarship.status.useQuery(undefined, { enabled: Boolean(user) });
  const submit = trpc.scholarship.submit.useMutation({ onSuccess: () => { void application.refetch(); void status.refetch(); } });
  const [country, setCountry] = useState("");
  const [institution, setInstitution] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const canSubmit = useMemo(() => country.trim().length >= 2 && institution.trim().length >= 2 && ageConfirmed && !submit.isPending, [country, institution, ageConfirmed, submit.isPending]);

  if (loading) return <main className="min-h-screen bg-[#f2eee4] p-6 text-[#18241f]"><div className="mx-auto max-w-2xl py-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#963a28]" /><p className="mt-3 text-sm">তথ্য দেখা হচ্ছে…</p></div></main>;
  if (!user) return <main className="min-h-screen bg-[#f2eee4] p-5 text-[#18241f] sm:p-10"><div className="mx-auto max-w-2xl border border-[#18241f]/15 bg-white/55 p-6 shadow-sm sm:p-10"><p className="text-xs tracking-[0.12em] text-[#963a28]">শিক্ষার্থী সহায়তা</p><h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">শিক্ষার্থীদের জন্য<br /><em>বিশেষ সুযোগ।</em></h1><p className="mt-5 text-sm leading-7 text-[#18241f]/70">১৮ বছর বা তার বেশি বয়সী শিক্ষার্থীরা ৩০ দিনের বিনামূল্যের বিশেষ সুবিধার জন্য আবেদন করতে পারেন। আসন সীমিত; আবেদন যাচাই শেষে জানানো হবে।</p><Button className="mt-7 bg-[#963a28] hover:bg-[#7e3023]" onClick={() => startLogin()}>প্রবেশ করুন / অ্যাকাউন্ট খুলুন</Button><p className="mt-4 text-xs leading-5 text-[#18241f]/70">এই সুযোগ ১৮ বছরের কম বয়সীদের জন্য নয়।</p></div></main>;

  const entitlement = status.data?.entitlement;
  const applicationState = application.data?.status;
  const isApproved = applicationState === "approved";
  return <main className="min-h-screen bg-[#f2eee4] px-5 py-6 text-[#18241f] sm:px-10 lg:px-16"><div className="mx-auto max-w-5xl">
    <header className="flex flex-col gap-4 border-b border-[#18241f]/15 pb-6 sm:flex-row sm:items-center sm:justify-between"><Link href="/" className="font-display text-2xl tracking-[0.16em]">DSAI <span className="text-[#963a28]">/ শিক্ষার্থী সহায়তা</span></Link><Link href="/workspace" className="text-sm underline underline-offset-4">কাজের জায়গায় ফিরুন</Link></header>
    <section className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div><p className="text-xs tracking-[0.12em] text-[#963a28]">শিক্ষার্থীদের জন্য বিশেষ সুযোগ</p><h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.02] sm:text-7xl">শিখুন, তৈরি করুন,<br /><em className="text-[#963a28]">এগিয়ে যান।</em></h1><p className="mt-6 max-w-xl text-base leading-8 text-[#18241f]/70">যোগ্য শিক্ষার্থীরা ৩০ দিনের বিনামূল্যের বিশেষ সুবিধার জন্য আবেদন করতে পারেন। এটি স্বয়ংক্রিয়ভাবে নবায়ন হয় না।</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="border border-[#18241f]/15 bg-white/40 p-4"><p className="text-2xl font-semibold">৩০ দিন</p><p className="mt-1 text-xs text-[#18241f]/60">বিশেষ সুবিধার মেয়াদ</p></div><div className="border border-[#18241f]/15 bg-white/40 p-4"><p className="text-2xl font-semibold">১৮+</p><p className="mt-1 text-xs text-[#18241f]/60">আবেদনের ন্যূনতম বয়স</p></div></div></div>
      <div className="border border-[#18241f]/15 bg-white/55 p-5 shadow-[0_12px_35px_rgba(24,36,31,0.05)] sm:p-7"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#963a28]" /><h2 className="font-display text-2xl">আপনার আবেদন</h2></div>
        {status.isLoading || application.isLoading ? <div className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-[#963a28]" /></div> : <>
          {entitlement && status.data?.active ? <div className="mt-5 border border-emerald-700/20 bg-emerald-50 p-4"><p className="text-sm font-semibold">আপনার বিশেষ সুবিধা সক্রিয়</p><p className="mt-2 text-xs text-emerald-900/70">শেষ তারিখ: {new Date(entitlement.expiresAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</p></div>
            : entitlement ? <div className="mt-5 border border-[#d7a34b]/40 bg-[#fff7df] p-4 text-sm">আপনার বিশেষ সুবিধার মেয়াদ শেষ হয়েছে।</div>
            : applicationState ? <div className="mt-5 border border-[#d7a34b]/40 bg-[#fff7df] p-4 text-sm leading-6">{applicationLabels[applicationState] ?? "আপনার আবেদন গ্রহণ করা হয়েছে।"}</div>
            : <p className="mt-5 text-sm leading-6 text-[#18241f]/65">আবেদন জমা দিলে তার অবস্থা এখানে দেখতে পারবেন।</p>}
        </>}
      </div>
    </section>
    {!application.data && !isApproved && !entitlement && <section className="max-w-2xl border border-[#18241f]/15 bg-white/50 p-5 sm:p-7"><div className="flex items-start gap-3"><Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#d7a34b]" /><div><h2 className="font-display text-2xl">আবেদন শুরু করুন</h2><p className="mt-2 text-sm leading-6 text-[#18241f]/65">দেশ ও শিক্ষাপ্রতিষ্ঠানের নাম দিন। এই ফর্মে পাসওয়ার্ড, পরিচয়পত্র বা অন্য কোনো গোপন নথি আপলোড করবেন না।</p></div></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">দেশ<Input className="mt-2 bg-white" value={country} onChange={event => setCountry(event.target.value)} placeholder="যেমন: বাংলাদেশ" maxLength={80} /></label><label className="text-sm font-medium">শিক্ষাপ্রতিষ্ঠান<Input className="mt-2 bg-white" value={institution} onChange={event => setInstitution(event.target.value)} placeholder="প্রতিষ্ঠানের নাম" maxLength={180} /></label></div>
      <label className="mt-5 flex items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#c85a3f]" checked={ageConfirmed} onChange={event => setAgeConfirmed(event.target.checked)} />আমি নিশ্চিত করছি যে আমার বয়স ১৮ বছর বা তার বেশি এবং আমি বর্তমানে শিক্ষার্থী।</label>
      <Button className="mt-6 w-full bg-[#963a28] hover:bg-[#7e3023] sm:w-fit" disabled={!canSubmit} onClick={() => submit.mutate({ country, institution, ageAttested18Plus: true, language: "bn", verificationMethod: "manual_review" })}>{submit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}আবেদন জমা দিন</Button>
      {submit.error && <p className="mt-4 text-sm text-[#b54d35]">আবেদন জমা দেওয়া যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।</p>}
    </section>}
    <p className="mt-10 max-w-3xl border-l-2 border-[#d7a34b] pl-4 text-xs leading-6 text-[#18241f]/60">এআই-এর তৈরি তথ্য ভুল হতে পারে। গুরুত্বপূর্ণ তথ্য যাচাই করে ব্যবহার করুন। আপনার তথ্য সম্পর্কে জানতে <Link href="/privacy" className="underline underline-offset-4">গোপনীয়তা নীতি</Link> দেখুন।</p>
  </div></main>;
}
