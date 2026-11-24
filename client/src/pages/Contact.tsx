import { Link } from "wouter";
import { ArrowLeft, Clock3, Info } from "lucide-react";

export default function Contact() {
  return (
    <main className="policy-page">
      <header className="policy-header">
        <Link href="/" className="policy-back"><ArrowLeft size={16} /> হোমে ফিরুন</Link>
        <span>DSAI / যোগাযোগ</span>
        <Link href="/about">DSAI সম্পর্কে</Link>
      </header>
      <section className="policy-hero">
        <Info size={28} />
        <p className="learn-label">যোগাযোগের তথ্য</p>
        <h1>যোগাযোগের<br /><em>মাধ্যম আসছে।</em></h1>
        <p className="policy-lead">DSAI-এর যাচাইকৃত যোগাযোগের চ্যানেল এখনো এই পৃষ্ঠায় প্রকাশ করা হয়নি। ভুল বা অননুমোদিত ঠিকানা দেওয়ার পরিবর্তে, সঠিক চ্যানেল নিশ্চিত হলে এখানে হালনাগাদ করা হবে।</p>
      </section>
      <section className="policy-body">
        <aside className="policy-side-card">
          <p className="learn-label">বর্তমান অবস্থা</p>
          <p>এই মুহূর্তে এই পৃষ্ঠায় কোনো ইমেইল, ফোন নম্বর বা যোগাযোগ ফর্ম দেওয়া নেই।</p>
        </aside>
        <div className="policy-sections">
          <section className="policy-contact">
            <Clock3 size={22} aria-hidden="true" />
            <div>
              <h2>যোগাযোগের চ্যানেল শীঘ্রই প্রকাশ করা হবে</h2>
              <p>এটি কোনো জমা দেওয়া অনুরোধ নয়। এই পৃষ্ঠায় বর্তমানে বার্তা পাঠানোর ব্যবস্থা নেই। DSAI সম্পর্কে জানতে <Link href="/about">পরিচিতি পৃষ্ঠা</Link> এবং সেবার নির্দেশনার জন্য <Link href="/learn">শিখুন পৃষ্ঠা</Link> দেখুন।</p>
            </div>
          </section>
        </div>
      </section>
      <footer className="policy-footer"><Link href="/">DSAI</Link><Link href="/about">পরিচিতি</Link><Link href="/privacy">গোপনীয়তা</Link></footer>
    </main>
  );
}
