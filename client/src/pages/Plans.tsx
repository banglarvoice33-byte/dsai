import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const features = [
  "বাংলা ভাষায় এআই সহায়তা",
  "১৪০টি এআই সেবা ও টুল খুঁজে দেখার তালিকা",
  "প্রতিদিন সর্বোচ্চ ২টি ছবি বিনামূল্যে তৈরি",
  "সহজ নির্দেশিকা ও ব্যবহার সহায়তা",
];

export default function Plans() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="container flex min-h-16 items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl tracking-[0.18em] text-foreground">DSAI</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/governance" className="text-muted-foreground transition-colors hover:text-foreground">নিরাপদ ব্যবহার</Link>
            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">হোম</Link>
          </div>
        </div>
      </header>

      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 border border-[#c9a34c]/50 px-3 py-1 text-xs tracking-[0.08em] text-[#9b7b2e]"><Sparkles className="h-3.5 w-3.5" /> বিনামূল্যে ব্যবহার</div>
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">সহজভাবে শুরু করুন।</h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">DSAI-এর নিজস্ব সুবিধাগুলো বর্তমানে বিনামূল্যে ব্যবহার করতে পারবেন। বাইরের কোনো ওয়েবসাইট বা সেবা ব্যবহার করলে তাদের নিজস্ব মূল্য ও নিয়ম প্রযোজ্য হতে পারে।</p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl border border-border/70 bg-card/80 p-7 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs tracking-[0.12em] text-muted-foreground">বর্তমানে চালু</p><h2 className="mt-2 font-serif text-3xl md:text-4xl">বিনামূল্যে</h2><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">কোনো পেইড প্ল্যান বা স্বয়ংক্রিয় চার্জ নেই। সুবিধার ব্যবহারসীমা সেবাভেদে আলাদা হতে পারে।</p></div>
            <ShieldCheck className="h-8 w-8 shrink-0 text-[#b48732]" />
          </div>
          <div className="my-7 space-y-4 border-y border-border/70 py-6 text-sm">
            {features.map(feature => <div key={feature} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b48732]" /><span>{feature}</span></div>)}
          </div>
          <Link href="/workspace" className="block">
            <Button className="w-full rounded-none">শুরু করুন <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">বাইরের সেবায় যাওয়ার আগে তাদের নিজস্ব মূল্য, ব্যবহারসীমা ও শর্ত দেখে নিন।</p>
        </div>
      </section>
    </main>
  );
}
