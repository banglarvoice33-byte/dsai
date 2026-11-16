import { ArrowLeft, Ban, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { advertisingPolicy } from "@/components/AdReadiness";
export default function Advertising() {
 return <main className="min-h-screen bg-[#f2eee4] px-5 py-8 text-[#18241f] sm:px-10 lg:px-16"><div className="mx-auto max-w-5xl">
  <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#18241f]/65"><ArrowLeft className="h-4 w-4"/> মূল সাইটে ফিরুন</Link>
  <header className="border-b border-[#18241f]/15 pb-10 pt-16"><p className="text-xs uppercase tracking-[.25em] text-[#963a28]">DSAI / বিজ্ঞাপন নীতি</p><h1 className="mt-4 max-w-3xl font-display text-5xl leading-[.95] sm:text-7xl">বিজ্ঞাপনও যেন<br/><em className="text-[#963a28]">বিশ্বাস নষ্ট না করে।</em></h1><p className="mt-6 max-w-2xl text-base leading-8 text-[#18241f]/65">DSAI-তে বিজ্ঞাপন থাকলে তা স্পষ্টভাবে চিহ্নিত থাকবে। আপনার ব্যক্তিগত কাজ, কথোপকথন বা গুরুত্বপূর্ণ পদক্ষেপের মাঝখানে বিভ্রান্তিকর বিজ্ঞাপন দেখানো হবে না।</p></header>
  <section className="grid gap-5 py-10 md:grid-cols-3">
   <article className="border border-[#18241f]/15 bg-white/45 p-5"><Ban className="h-6 w-6 text-[#963a28]"/><h2 className="mt-5 font-display text-2xl">বর্তমান অবস্থা</h2><p className="mt-3 text-sm leading-7 text-[#18241f]/65">{advertisingPolicy.enabled ? "বিজ্ঞাপন চালু আছে; প্রতিটি বিজ্ঞাপন আলাদাভাবে চিহ্নিত থাকবে।" : "বর্তমানে DSAI-তে বিজ্ঞাপন চালু নেই।"}</p></article>
   <article className="border border-[#18241f]/15 bg-white/45 p-5"><ShieldCheck className="h-6 w-6 text-[#963a28]"/><h2 className="mt-5 font-display text-2xl">আপনার কাজ আগে</h2><p className="mt-3 text-sm leading-7 text-[#18241f]/65">ব্যক্তিগত কাজ, chat, নথি ও account ব্যবহারের সময় বিজ্ঞাপন দিয়ে বাধা দেওয়া হবে না।</p></article>
   <article className="border border-[#18241f]/15 bg-white/45 p-5"><CheckCircle2 className="h-6 w-6 text-[#963a28]"/><h2 className="mt-5 font-display text-2xl">স্পষ্ট পরিচয়</h2><p className="mt-3 text-sm leading-7 text-[#18241f]/65">কোনো বিজ্ঞাপন থাকলে সেটি বিজ্ঞাপন হিসেবেই চিহ্নিত থাকবে; সাধারণ সেবা বা বোতামের মতো দেখানো হবে না।</p></article>
  </section>
 </div></main>;
}
