import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CalendarDays, CircleDot, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const categoryLabels: Record<string, string> = {
  feature: "নতুন সুবিধা",
  improvement: "উন্নতি",
  security: "নিরাপত্তা",
  guide: "নির্দেশিকা",
};

export default function Changelog() {
  const entries = trpc.changelog.published.useQuery();
  return <main className="changelog-page">
    <header className="changelog-header">
      <Link href="/" className="changelog-back"><ArrowLeft size={16} /> হোমে ফিরুন</Link>
      <span>DSAI / নতুন পরিবর্তন</span>
      <Link href="/privacy">গোপনীয়তা</Link>
    </header>
    <section className="changelog-hero">
      <div><p className="learn-label">সাম্প্রতিক খবর</p><h1>নতুন কী এসেছে,<br /><em>জেনে নিন।</em></h1><p>DSAI-তে নতুন সুবিধা, উন্নতি বা গুরুত্বপূর্ণ পরিবর্তন হলে এখানে জানানো হবে।</p></div>
      <div className="changelog-hero-note"><CircleDot size={20} /><strong>আপডেট দেখুন</strong><span>নতুন তথ্য প্রকাশ হলে এই পাতায় পাওয়া যাবে।</span></div>
    </section>
    <section className="changelog-body">
      <div className="changelog-intro">
        <span className="learn-label">DSAI / আপডেট</span>
        <h2>আপনার ব্যবহারে<br /><span>যা নতুন যোগ হলো।</span></h2>
        <p>ব্যবহারকারীর কাজে প্রভাব ফেলে এমন পরিবর্তনগুলো সহজ ভাষায় এখানে জানানো হবে।</p>
      </div>
      {entries.isLoading ? <div className="changelog-loading"><Loader2 className="animate-spin" />আপডেট দেখা হচ্ছে…</div>
        : entries.error ? <div className="changelog-empty">এই মুহূর্তে আপডেট দেখা যাচ্ছে না। পরে আবার চেষ্টা করুন।</div>
        : entries.data?.length ? <div className="changelog-list">{entries.data.map(entry => <article key={entry.id} className="changelog-entry">
          <div className="changelog-entry-meta"><span className="changelog-version">{entry.version}</span><span className="changelog-category">{categoryLabels[entry.category] ?? "আপডেট"}</span><span className="changelog-date"><CalendarDays size={13} />{entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" }) : "তারিখ জানানো হবে"}</span></div>
          <h2>{entry.title}</h2><p className="changelog-summary">{entry.summary}</p>
          <div className="changelog-content">{entry.content.split("\n").map((paragraph, index) => paragraph.trim() ? <p key={`${entry.id}-${index}`}>{paragraph}</p> : null)}</div>
        </article>)}</div>
        : <div className="changelog-empty"><CircleDot size={20} /><h2>এখনো নতুন কোনো আপডেট নেই।</h2><p>নতুন সুবিধা বা গুরুত্বপূর্ণ পরিবর্তন প্রকাশ হলে এখানে জানানো হবে।</p><Link href="/learn">ব্যবহার নির্দেশিকা দেখুন <ArrowRight size={15} /></Link></div>}
    </section>
    <footer className="changelog-footer"><span>DSAI / সাম্প্রতিক পরিবর্তন</span><a href="mailto:info@banglarvoice24news.com">যোগাযোগ</a></footer>
  </main>;
}
