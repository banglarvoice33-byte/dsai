import { Link } from "wouter";
import { ArrowLeft, BookOpen, FileText, Image, Layers3, ShieldCheck } from "lucide-react";

const services = [
  { title: "AI Hub", description: "বিভিন্ন AI সেবা ও সংযোগের তথ্য এক জায়গায় খুঁজে দেখুন।", href: "/ai-hub", icon: Layers3 },
  { title: "Work Desk", description: "প্রশ্ন, লেখা ও নথির কাজ গুছিয়ে পরবর্তী পদক্ষেপ তৈরি করুন।", href: "/workspace", icon: FileText },
  { title: "Creative Studio", description: "AI-সহায়তায় ছবি তৈরির সুবিধা ব্যবহার করুন।", href: "/creative-studio", icon: Image },
  { title: "শেখা ও সহায়তা", description: "DSAI ব্যবহারের নির্দেশনা ও শিক্ষা-সহায়তার তথ্য দেখুন।", href: "/learn", icon: BookOpen },
];

export default function About() {
  return (
    <main className="policy-page">
      <header className="policy-header">
        <Link href="/" className="policy-back"><ArrowLeft size={16} /> হোমে ফিরুন</Link>
        <span>DSAI / পরিচিতি</span>
        <Link href="/contact">যোগাযোগ</Link>
      </header>
      <section className="policy-hero">
        <ShieldCheck size={28} />
        <p className="learn-label">বাংলা-প্রথম · মানুষের নিয়ন্ত্রণে</p>
        <h1>তথ্য বুঝে<br /><em>কাজ এগিয়ে নিন।</em></h1>
        <p className="policy-lead">DSAI একটি বাংলা-প্রথম AI Workdesk। তথ্য বোঝা, গবেষণা, নথির কাজ, খসড়া তৈরি এবং পরবর্তী পদক্ষেপ গুছিয়ে নিতে AI-সহায়তা দেয়—গুরুত্বপূর্ণ সিদ্ধান্ত মানুষের নিয়ন্ত্রণেই থাকে।</p>
      </section>
      <section className="policy-body">
        <aside className="policy-side-card">
          <p className="learn-label">আমাদের পদ্ধতি</p>
          <p>AI-এর ফলকে চূড়ান্ত সিদ্ধান্ত নয়, যাচাই ও সম্পাদনার উপযোগী সহায়তা হিসেবে দেখুন।</p>
          <Link href="/method">কাজের পদ্ধতি দেখুন →</Link>
        </aside>
        <div className="policy-sections">
          <section>
            <h2>DSAI কী করতে সাহায্য করে</h2>
            <p>বাংলা বা ইংরেজিতে প্রশ্ন করা, তথ্য সহজভাবে বোঝা, নথি-সংক্রান্ত কাজ গুছানো, AI সেবা খুঁজে দেখা, ছবি তৈরি এবং কাজের খসড়া সংরক্ষণ—এসবের জন্য DSAI-তে আলাদা সুবিধা রয়েছে। সুবিধার প্রাপ্যতা ও ব্যবহারসীমা সংশ্লিষ্ট পৃষ্ঠায় দেখানো হয়।</p>
          </section>
          <section>
            <h2>দায়িত্বশীল ব্যবহারের নীতি</h2>
            <p>AI-এর উত্তর ভুল, অসম্পূর্ণ বা পুরোনো হতে পারে। তাই আইন, চিকিৎসা, অর্থ, শিক্ষা বা সরকারি বিষয়ে গুরুত্বপূর্ণ সিদ্ধান্তের আগে নির্ভরযোগ্য উৎস থেকে তথ্য যাচাই করুন। DSAI কোনো সরকারি কর্তৃপক্ষের প্রতিনিধি নয় এবং কোনো আবেদন বা অনুমোদন সম্পন্ন হয়েছে বলে দাবি করে না।</p>
          </section>
          <section>
            <h2>প্রযুক্তিগত ভিত্তি</h2>
            <p>প্রকাশিত অ্যাপ্লিকেশন কোডে React 19 ও Wouter-ভিত্তিক ক্লায়েন্ট, Vite 7 build tooling এবং Express ও tRPC backend ব্যবহৃত হয়েছে। এই তথ্য বর্তমান repository source-এর বর্ণনা; এটি কোনো স্বাধীন নিরাপত্তা বা মান-সনদের দাবি নয়।</p>
          </section>
          <section>
            <h2>সেবার সীমা ও স্বচ্ছতা</h2>
            <p>তৃতীয় পক্ষের AI সেবা, মডেল ও API-এর নিজস্ব শর্ত ও গোপনীয়তা নীতি থাকতে পারে। কোনো সেবা তালিকাভুক্ত থাকা মানেই অংশীদারত্ব বা অনুমোদন নয়। ব্যক্তিগত বা গোপন তথ্য জমা দেওয়ার আগে <Link href="/privacy">গোপনীয়তা নীতি</Link> পড়ুন।</p>
          </section>
          <section>
            <h2>সুবিধাগুলো দেখুন</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map(({ title, description, href, icon: Icon }) => (
                <Link key={href} href={href} className="border border-[#18241f]/15 bg-white/45 p-5 no-underline transition-colors hover:border-[#963a28] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                  <Icon className="h-5 w-5 text-[#963a28]" aria-hidden="true" />
                  <h3 className="mt-3 font-semibold text-[#18241f]">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#526058]">{description}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
      <footer className="policy-footer"><Link href="/">DSAI</Link><Link href="/contact">যোগাযোগ</Link><Link href="/privacy">গোপনীয়তা</Link></footer>
    </main>
  );
}
