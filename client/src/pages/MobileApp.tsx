import { useMemo, useState } from "react";
import { ArrowRight, Check, Compass, Moon, ShieldCheck, Sparkles, Sun, Zap } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";

const quickStarts = [
  { icon: Compass, title: "বিষয়টি বুঝে নিন", body: "নোটিশ, রিপোর্ট বা কঠিন লেখাকে সহজ ভাষা ও checklist-এ ভাঙুন.", prompt: "এই বিষয়টি সহজ ভাষায় বুঝিয়ে একটি checklist তৈরি করুন" },
  { icon: Sparkles, title: "একটি খসড়া শুরু করুন", body: "আপনার উদ্দেশ্য লিখুন; পরের কাজের একটি editable draft তৈরি করুন.", prompt: "আমার জন্য একটি পরিষ্কার কাজের খসড়া তৈরি করুন" },
  { icon: ShieldCheck, title: "মানব যাচাই রাখুন", body: "উচ্চ-ঝুঁকির সিদ্ধান্তে AI draft করে, মানুষ review করে.", prompt: "এই কাজের ঝুঁকি ও মানব যাচাইয়ের জায়গাগুলো দেখান" },
];

export default function MobileApp() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [draft, setDraft] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [started, setStarted] = useState(false);

  const activePrompt = useMemo(() => draft.trim() || selectedPrompt, [draft, selectedPrompt]);

  const startWorkspace = () => {
    setStarted(true);
    const destination = isAuthenticated ? "/workspace" : "/auth/login?returnTo=/workspace";
    window.setTimeout(() => window.location.assign(destination), 260);
  };

  return (
    <main className="mobile-app-shell">
      <div className="mobile-app-glow mobile-app-glow-one" aria-hidden="true" />
      <div className="mobile-app-glow mobile-app-glow-two" aria-hidden="true" />
      <header className="mobile-app-header">
        <a className="mobile-app-brand" href="/" aria-label="DSAI হোমে ফিরুন"><span className="mobile-app-mark">D</span><span>DSAI</span></a>
        <div className="mobile-app-header-actions">
          <button className="mobile-app-theme" type="button" onClick={() => toggleTheme?.()} aria-label={theme === "dark" ? "দিনের আলো চালু করুন" : "Night Workdesk চালু করুন"}>
            {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
          <a className="mobile-app-close" href="/" aria-label="হোমে ফিরুন">×</a>
        </div>
      </header>

      <section className="mobile-app-hero" aria-labelledby="mobile-app-title">
        <div className="mobile-app-eyebrow"><Zap size={14} aria-hidden="true" /> সহজে শুরু করুন · DSAI</div>
        <h1 id="mobile-app-title">এআই সহজ না হলেও,<br /><em>আমরা সহজ করার জন্য কাজ করছি।</em></h1>
        <p>আপনার জটিল কথা, নোটিশ বা কাজকে ধীরে ধীরে পরিষ্কার পরবর্তী ধাপে নিন—বাংলা, Banglish বা English-এ.</p>
      </section>

      <section className="mobile-app-compose" aria-labelledby="compose-title">
        <div className="mobile-app-section-label"><span>০১</span><h2 id="compose-title">আজ কী নিয়ে শুরু করবেন?</h2></div>
        <textarea value={draft} onChange={(event) => { setDraft(event.target.value); setSelectedPrompt(""); }} placeholder="যেমন: এই নোটিশটি সহজ করে বুঝিয়ে দিন…" aria-label="আপনার কাজের বর্ণনা" rows={4} />
        <div className="mobile-app-compose-footer"><span>{activePrompt ? "খসড়া প্রস্তুত" : "আপনার ভাষায় লিখুন"}</span><span>{draft.length}/500</span></div>
        <button className="mobile-app-primary" type="button" onClick={startWorkspace} disabled={!activePrompt || started}>
          {started ? <Check size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
          {started ? "ওয়ার্কস্পেস খুলছে…" : "ওয়ার্কস্পেসে শুরু করুন"}
        </button>
        <p className="mobile-app-safety"><ShieldCheck size={15} aria-hidden="true" /> AI draft করে, গুরুত্বপূর্ণ সিদ্ধান্তে মানুষ review করে.</p>
      </section>

      <section className="mobile-app-quick" aria-labelledby="quick-title">
        <div className="mobile-app-section-label"><span>০২</span><h2 id="quick-title">অথবা একটি পথ বেছে নিন</h2></div>
        <div className="mobile-app-quick-grid">
          {quickStarts.map(({ icon: Icon, title, body, prompt }) => {
            const selected = selectedPrompt === prompt;
            return <button className={`mobile-app-quick-card${selected ? " is-selected" : ""}`} type="button" key={title} onClick={() => { setSelectedPrompt(prompt); setDraft(""); }} aria-pressed={selected}>
              <span className="mobile-app-quick-icon"><Icon size={19} aria-hidden="true" /></span>
              <strong>{title}</strong>
              <span>{body}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>;
          })}
        </div>
      </section>

      <footer className="mobile-app-footer"><span>DSAI · বাংলা প্রথম</span><span>সৎ সীমা · মানব নিয়ন্ত্রণ · ধাপে ধাপে</span></footer>
    </main>
  );
}

export { quickStarts };
