/*
 * DSAI design reminder: Bengali-first editorial layouts, a distinctive signal palette,
 * calm trust-building interactions, and no claims of crypto mining, guaranteed income,
 * unlimited generation, or professional replacement.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  Globe2,
  LockKeyhole,
  Mail,
  Menu,
  Moon,
  Sun,
  PenLine,
  Play,
  ShieldCheck,
  Search,
  Sparkles,
  X,
} from "lucide-react";

const emblem = "/icons/dsai-mark.svg";

const homepageCopy = {
  bn: {
    nav: ["কাজের ক্ষেত্র", "ছবি তৈরি", "শিক্ষার্থী সহায়তা", "শিখুন", "কাজের জায়গা", "নথি আপলোড"],
    heroEyebrow: "খুঁজুন · তৈরি করুন · এগিয়ে যান",
    heroLead: "বাংলায় প্রশ্ন করুন, প্রয়োজনীয় তথ্য বুঝুন, খসড়া তৈরি করুন এবং পরবর্তী কাজ গুছিয়ে নিন।",
    pathCta: "সেবাগুলো দেখুন",
    workflowCta: "কীভাবে শুরু করবেন",
    headerCta: "শুরু করুন",
    workspaceCta: "কাজের জায়গায় যান",
    searchPlaceholder: "কী খুঁজছেন? যেমন: ছবি তৈরি, সরকারি সেবা, নথি আপলোড",
    searchHint: "এন্টার চাপুন অথবা একটি বিষয় বেছে নিন · বাংলা, বাংলিশ বা ইংরেজিতে খুঁজুন",
  },
  en: {
    nav: ["Explore services", "Create images", "Student support", "Learn", "Workspace", "Upload documents"],
    heroEyebrow: "Explore · Create · Move forward",
    heroLead: "Ask in Bengali or English, understand useful information, create drafts, and organize your next steps.",
    pathCta: "Explore services",
    workflowCta: "How to start",
    headerCta: "Get started",
    workspaceCta: "Open workspace",
    searchPlaceholder: "What do you need? For example: create an image, government services, upload a document",
    searchHint: "Press Enter or choose a topic · Search in Bengali or English",
  },
} as const;

const navItems = [
  ["কাজের ক্ষেত্র", "#workflows"],
  ["ছবি তৈরি", "/creative-studio"],
  ["শিক্ষার্থী সহায়তা", "/scholarship"],
  ["শিখুন", "#learn"],
  ["কাজের জায়গা", "/workspace"],
  ["নথি আপলোড", "/documents"],
];

const workflowItems = [
  { step: "01", title: "শুরু করুন", body: "প্রশ্ন, ছবি বা নথি দিয়ে আপনার কাজ শুরু করুন।", icon: FileText },
  { step: "02", title: "বুঝুন", body: "জটিল তথ্য সহজ ভাষায় বুঝুন এবং করণীয় ঠিক করুন।", icon: Globe2 },
  { step: "03", title: "যাচাই করুন", body: "গুরুত্বপূর্ণ তথ্য নির্ভরযোগ্য উৎস থেকে মিলিয়ে নিন।", icon: ShieldCheck },
  { step: "04", title: "এগিয়ে যান", body: "প্রয়োজনীয় খসড়া ও করণীয় তালিকা নিয়ে কাজ এগিয়ে নিন।", icon: ArrowRight },
];

const learnItems = [
  { title: "প্রথমে কী করব?", body: "বিনামূল্যের কিছু সুবিধা আগে দেখে নিন। প্রয়োজন হলে অ্যাকাউন্ট খুলে কাজ চালিয়ে যান।", label: "শুরু করুন" },
  { title: "DSAI কীভাবে কাজে লাগে?", body: "নোটিশ, রিপোর্ট, ফর্ম বা কাজের বর্ণনা সহজ ভাষায় বুঝতে এবং পরবর্তী পদক্ষেপ গুছিয়ে নিতে ব্যবহার করুন।", label: "ব্যবহার" },
  { title: "ছবি তৈরির সীমা কী?", body: "প্রতিদিন সর্বোচ্চ ২টি ছবি বিনামূল্যে তৈরি করতে পারবেন।", label: "দৈনিক সীমা" },
];

const faqItems = [
  { q: "DSAI কী এবং কীভাবে কাজে লাগে?", a: "DSAI বাংলা ভাষায় বিভিন্ন কাজের জন্য প্রয়োজনীয় এআই সেবা খুঁজে নিতে, প্রশ্ন করতে এবং খসড়া তৈরি করতে সাহায্য করে। গুরুত্বপূর্ণ সিদ্ধান্তের আগে তথ্য যাচাই করুন।" },
  { q: "অ্যাকাউন্ট তৈরি ও লগইন কীভাবে করব?", a: "ইমেইল ও পাসওয়ার্ড দিয়ে অ্যাকাউন্ট খুলুন। ইমেইলে পাঠানো যাচাইকরণ লিংক খুলে অ্যাকাউন্ট নিশ্চিত করুন, তারপর লগইন করুন।" },
  { q: "ছবি তৈরি করতে পারব?", a: "ছবির বর্ণনা লিখে আকার বেছে নিন। প্রতিদিন সর্বোচ্চ ২টি ছবি বিনামূল্যে তৈরি করতে পারবেন।" },
  { q: "আমার তৈরি ছবি কোথায় পাব?", a: "আপনার তৈরি ছবিগুলো আপনার অ্যাকাউন্টের ব্যক্তিগত সংগ্রহে দেখতে পারবেন।" },
  { q: "এআই-এর তৈরি তথ্য কি সবসময় নির্ভুল?", a: "না। এআই ভুল বা অসম্পূর্ণ তথ্য দিতে পারে। চিকিৎসা, আইন, অর্থ বা সরকারি সিদ্ধান্তের আগে নির্ভরযোগ্য উৎস ও প্রয়োজন হলে বিশেষজ্ঞের সাহায্যে যাচাই করুন।" },
  { q: "ফাইল আপলোড করলে কী হবে?", a: "ফাইলের নিরাপত্তা যাচাই সম্পন্ন না হওয়া পর্যন্ত সেটি ব্যবহার বা ডাউনলোড করা যাবে না।" },
];

type SearchItem = {
  title: string;
  description: string;
  label: string;
  href: string;
  keywords: string;
  aliases: string[];
};

const searchItems: SearchItem[] = [
  { title: "DSAI কীভাবে কাজে লাগে?", description: "নোটিশ, রিপোর্ট, ফর্ম বা কাজের বর্ণনা সহজ ভাষায় বুঝুন এবং করণীয় গুছিয়ে নিন।", label: "শিখুন", href: "#learn", keywords: "dsai কী how use কাজ ব্যবহার শুরু", aliases: ["how to use dsai", "use dsai", "dsai ব্যবহার", "কীভাবে ব্যবহার", "কাজে লাগে"] },
  { title: "বিনামূল্যে আগে দেখে নিন", description: "অ্যাকাউন্ট ছাড়াই ছোট উদাহরণ দিয়ে শুরু করুন।", label: "আগে দেখুন", href: "/try-first", keywords: "try first guest demo test without login আগে পরীক্ষা", aliases: ["try first", "guest demo", "test dsai", "আগে পরীক্ষা", "লগইন ছাড়া"] },
  { title: "নথি আপলোড", description: "সমর্থিত নথি যোগ করুন; নিরাপত্তা যাচাই শেষ হলে ব্যবহার করুন।", label: "নথি", href: "/documents", keywords: "document upload file pdf docx xlsx zip jpg png নথি আপলোড ফাইল সংরক্ষণ", aliases: ["upload document", "upload file", "my files", "নথি আপলোড", "ফাইল রাখুন"] },
  { title: "সরকারি সেবা ও টেন্ডার খুঁজুন", description: "সরকারি চাকরি, টেন্ডার, ভূমি ও করসংক্রান্ত তথ্য খুঁজে দেখুন।", label: "সরকারি সেবা", href: "/workspace?panel=services", keywords: "government service tender portal সরকারি সেবা টেন্ডার চাকরি ভূমি কর", aliases: ["government portal", "tender", "সরকারি সেবা", "টেন্ডার খুঁজুন"] },
  { title: "সরকারি কাজের সহায়তা", description: "ফর্ম, নোটিশ ও আবেদন বুঝতে সাহায্য নিন।", label: "সহায়তা", href: "#workflows", keywords: "access document form notice report ফর্ম বুঝতে নোটিশ", aliases: ["document help", "ফর্ম বুঝতে", "নোটিশ"] },
  { title: "ছবি তৈরি", description: "বাংলা বা ইংরেজিতে ছবির বর্ণনা লিখে ছবি তৈরি করুন।", label: "ছবি", href: "/creative-studio", keywords: "create image ছবি তৈরি image generation download", aliases: ["make image", "ছবি তৈরি", "সৃজন"] },
  { title: "কীভাবে ব্যবহার করবেন?", description: "শুরু থেকে ফলাফল যাচাই পর্যন্ত সহজ ধাপগুলো দেখুন।", label: "নির্দেশিকা", href: "#workflow", keywords: "workflow steps কীভাবে কাজ করে review", aliases: ["how it works", "workflow steps", "পদ্ধতি", "কাজের ধাপ"] },
  { title: "তথ্যের সুরক্ষা", description: "আপনার তথ্য ও গোপনীয়তা সম্পর্কে জানুন।", label: "গোপনীয়তা", href: "/privacy", keywords: "privacy data deletion retention নিরাপত্তা", aliases: ["privacy policy", "delete data", "data deletion", "ডেটা মুছুন", "গোপনীয়তা নীতি"] },
  { title: "নিরাপদ ব্যবহার", description: "তথ্য সুরক্ষা ও ব্যবহারের নিয়ম জানুন।", label: "নিরাপত্তা", href: "/governance", keywords: "privacy data safety terms user rights account security", aliases: ["privacy", "safe use", "terms", "user rights", "গোপনীয়তা", "নিরাপদ ব্যবহার"] },
  { title: "পরিকল্পনা ও মূল্য", description: "বর্তমান সুবিধা ও মূল্য সম্পর্কে জানুন।", label: "মূল্য", href: "/plans", keywords: "plans pricing availability payment মূল্য পরিকল্পনা", aliases: ["pricing", "upgrade", "পেমেন্ট", "প্রো"] },
];

function SectionEyebrow({ index, children }: { index: string; children: string }) {
  return <div className="section-eyebrow"><span>{index}</span><i />{children}</div>;
}

function normalizeSearchText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[.,!?;:()[\]{}“”'"`]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreSearchItem(query: string, item: SearchItem) {
  const normalizedQuery = normalizeSearchText(query);
  const haystack = normalizeSearchText([item.title, item.description, item.label, item.keywords, ...item.aliases].join(" "));
  const tokens = normalizedQuery.split(" ").filter(Boolean);
  if (!tokens.length) return 0;
  const exactPhrase = haystack.includes(normalizedQuery) ? 20 : 0;
  const tokenScore = tokens.reduce((score, token) => score + (haystack.includes(token) ? 4 : 0), 0);
  const titleScore = normalizeSearchText(item.title).includes(normalizedQuery) ? 10 : 0;
  return exactPhrase + tokenScore + titleScore;
}

function SignalMark({ small = false }: { small?: boolean }) {
  return <img src={emblem} alt="DSAI emblem" className={small ? "h-8 w-8" : "h-11 w-11"} />;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const waitlistJoin = trpc.waitlist.join.useMutation();
  const accessCreate = trpc.access.create.useMutation();
  const searchRecord = trpc.search.record.useMutation();
  const accessCases = trpc.access.list.useQuery(undefined, { enabled: isAuthenticated });
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistInterest, setWaitlistInterest] = useState<"access" | "creative" | "both">("both");
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [accessTitle, setAccessTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const copy = homepageCopy[lang];
  const localizedNavItems = navItems.map(([fallbackLabel, href], index) => [copy.nav[index] || fallbackLabel, href] as const);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return searchItems.slice(0, 5);
    return searchItems
      .map((item, originalIndex) => ({ item, score: scoreSearchItem(query, item), originalIndex }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
      .slice(0, 6)
      .map(({ item }) => item);
  }, [searchQuery]);

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      searchInputRef.current?.focus();
      setSearchOpen(true);
    };
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, []);

  const goToSearchResult = (item?: SearchItem) => {
    const destination = item ?? searchResults[activeSearchIndex];
    if (!destination) return;
    if (searchQuery.trim().length >= 2) {
      searchRecord.mutate({ term: searchQuery, source: "homepage" });
    }
    setSearchOpen(false);
    setSearchQuery("");
    if (destination.href.startsWith("#")) {
      document.getElementById(destination.href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = destination.href;
    }
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSearchIndex((current) => searchResults.length ? (current + 1) % searchResults.length : 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSearchIndex((current) => searchResults.length ? (current - 1 + searchResults.length) % searchResults.length : 0);
    } else if (event.key === "Enter") {
      if (event.nativeEvent.isComposing) return;
      event.preventDefault();
      goToSearchResult();
    } else if (event.key === "Escape") {
      setSearchOpen(false);
    }
  };

  const submitWaitlist = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    waitlistJoin.mutate({ email: waitlistEmail, interest: waitlistInterest, language: lang }, {
      onSuccess: () => { setWaitlistEmail(""); toast("আপনার আগ্রহ সংরক্ষণ করা হয়েছে। DSAI চালু হলে জানানো হবে।"); },
      onError: (error) => toast(error.message || "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।"),
    });
  };
  const openAccessFlow = () => isAuthenticated ? setShowAccessForm(true) : window.location.assign("/auth/login?returnTo=/workspace");
  const openCreativeFlow = () => window.location.assign(isAuthenticated ? "/creative-studio" : "/auth/login?returnTo=/creative-studio");
  const submitAccess = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    accessCreate.mutate({ title: accessTitle, workflow: "document", language: lang, riskLevel: "medium" }, {
      onSuccess: () => { setAccessTitle(""); setShowAccessForm(false); toast("UAA case draft তৈরি হয়েছে।"); accessCases.refetch(); },
      onError: (error) => toast(error.message || "UAA case তৈরি করা যায়নি।"),
    });
  };

  return (
    <div className="home-page-shell min-h-screen overflow-x-hidden bg-parchment text-ink" id="top">
      <a className="skip-link" href="#main-content">মূল কনটেন্টে যান</a>
      <div className="top-ribbon" role="region" aria-label="DSAI platform announcement"><span>বাংলা প্রথম</span><span className="ribbon-dot" />বাস্তব কাজ ও সৃষ্টির জন্য AI<span className="ribbon-right">সহজ ভাষা, পরিষ্কার সীমা।</span></div>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="DSAI home"><SignalMark /><span>DSAI</span></a>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {localizedNavItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="header-actions">
            <button className="language-toggle" onClick={() => setLang(lang === "bn" ? "en" : "bn")} aria-label={lang === "bn" ? "Switch to English" : "বাংলায় ফিরুন"} aria-pressed={lang === "en"}><span className={lang === "bn" ? "active" : ""}>BN</span><span>/</span><span className={lang === "en" ? "active" : ""}>EN</span></button>
            <button className="theme-toggle" onClick={() => toggleTheme?.()} aria-label={theme === "dark" ? "দিনের আলো চালু করুন" : "Night Workdesk চালু করুন"} aria-pressed={theme === "dark"} title={theme === "dark" ? "দিনের আলো" : "Night Workdesk"}>{theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}<span className="sr-only">{theme === "dark" ? "দিনের আলো" : "Night Workdesk"}</span></button>
            <button className="header-cta" onClick={() => isAuthenticated ? window.location.assign("/workspace") : window.location.assign("/auth/login?returnTo=/workspace")}>{isAuthenticated ? copy.workspaceCta : copy.headerCta} <ArrowRight size={15} /></button>
            <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="dsai-mobile-navigation">{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menuOpen && <div className="mobile-nav" id="dsai-mobile-navigation">{localizedNavItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<button className="mobile-theme-toggle" onClick={() => toggleTheme?.()} aria-pressed={theme === "dark"}>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />} {theme === "dark" ? "দিনের আলো চালু করুন" : "Night Workdesk চালু করুন"}</button><button onClick={() => isAuthenticated ? window.location.assign("/workspace") : window.location.assign("/auth/login?returnTo=/workspace")}>{copy.workspaceCta} <ArrowRight size={15} /></button></div>}
      </header>

      <main id="main-content">
        <section className="hero-section">
          <div className="hero-image" aria-hidden="true" />
          <div className="container hero-grid">
              <div className="hero-copy">
              <div className="eyebrow-pill"><span className="pulse-dot" />{copy.heroEyebrow}</div>
              <div className="hero-kinetic-tag" aria-label="Tactile Kinetic interface">TACTILE KINETIC <span>01 / 04</span></div>
              <h1 className="kinetic-title">{lang === "bn" ? <>জটিল তথ্য থেকে<br />দায়িত্বশীল কাজের<br /><em>পরবর্তী ধাপ</em>।</> : <>From complex information<br />to the <em>next step</em><br />with human control.</>}</h1>
              <p className="hero-lead">{copy.heroLead}</p>
              <div className="hero-actions"><button className="btn-primary" onClick={() => document.getElementById("path")?.scrollIntoView({ behavior: "smooth" })}>{copy.pathCta} <ArrowRight size={17} /></button><a className="btn-quiet" href="/try-first"><Sparkles size={15} /> Try First — আগে পরীক্ষা করুন</a><button className="btn-quiet" onClick={() => document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" })}><Play size={15} fill="currentColor" /> {copy.workflowCta}</button></div>
              <div className="hero-note"><LockKeyhole size={16} /><span>আপনার কাজ আপনার নিয়ন্ত্রণে।<br /><b>সৎ সীমা দেখিয়েই সেবা তৈরি হয়।</b></span></div>
              <div id="dsai-home-search" className="home-search" role="search" aria-label="DSAI content search">
                <div className={`home-search-control ${searchOpen ? "is-open" : ""}`}>
                  <Search size={18} aria-hidden="true" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(event) => { setSearchQuery(event.target.value); setSearchOpen(true); setActiveSearchIndex(0); }}
                    onFocus={() => setSearchOpen(true)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={copy.searchPlaceholder}
                    aria-label="DSAI content search"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls="dsai-search-results"
                    aria-expanded={searchOpen}
                    aria-activedescendant={searchOpen && searchResults[activeSearchIndex] ? `dsai-search-option-${activeSearchIndex}` : undefined}
                  />
                  <kbd>⌘ K</kbd>
                </div>
                {searchOpen && <div className="home-search-results" id="dsai-search-results" role="listbox" aria-label="Search suggestions">
                  {searchResults.length ? searchResults.map((item, index) => <button
                    type="button"
                    role="option"
                    aria-selected={activeSearchIndex === index}
                    className={`home-search-result ${activeSearchIndex === index ? "active" : ""}`}
                    id={`dsai-search-option-${index}`}
                    key={`${item.href}-${item.title}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveSearchIndex(index)}
                    onClick={() => goToSearchResult(item)}
                  ><span className="home-search-result-icon"><Search size={14} /></span><span><strong>{item.title}</strong><small>{item.description}</small></span><em>{item.label}</em></button>) : <div className="home-search-empty">এই শব্দের জন্য এখনো কোনো public content পাওয়া যায়নি। <a href="/learn">শিখুন পাতাটি দেখুন</a></div>}
                </div>}
                <p className="home-search-hint">{copy.searchHint}{searchQuery.trim().length >= 2 && searchResults[0] ? ` · সম্ভাব্য পথ: ${searchResults[0].label}` : ""}</p>
              </div>
            </div>
            <div className="hero-visual" aria-label="DSAI service map">
              <div className="map-caption"><span className="map-index">DSAI / 01</span><span>একটি সিস্টেম, দুইটি পথ</span></div>
              <div className="map-orbit orbit-one" /><div className="map-orbit orbit-two" />
              <div className="map-node node-origin"><span className="node-kicker">আপনার প্রয়োজন</span><strong>এক জায়গা থেকে<br />শুরু করুন</strong><span className="node-mark">↗</span></div>
              <div className="map-branch branch-access" /><div className="map-branch branch-create" />
              <div className="map-node node-access"><span className="node-kicker">01 / ACCESS</span><strong>বুঝুন<br />ও প্রস্তুত হন</strong><FileText size={19} /></div>
              <div className="map-node node-create"><span className="node-kicker">02 / CREATE</span><strong>ভাবুন<br />ও তৈরি করুন</strong><Sparkles size={19} /></div>
              <div className="map-footer"><span className="mini-line" />Human review when it matters</div>
            </div>
          </div>
          <div className="hero-bottom-label"><span>Scroll to explore</span><span className="scroll-arrow">↓</span></div>
        </section>

        <section className="intro-section" id="path">
          <div className="container intro-layout"><div className="intro-side"><SectionEyebrow index="01">একটি প্ল্যাটফর্ম</SectionEyebrow><p>Everything you need to understand the next step.</p></div><div className="intro-main"><h2>মানুষের প্রয়োজনের পাশে <span>সৃষ্টির স্বাধীনতা।</span></h2><p>DSAI দুটো জিনিসকে একসঙ্গে আনে—যে কাজগুলো মানুষকে বাস্তব জীবনে এগোতে সাহায্য করে, আর যে সৃষ্টিগুলো মানুষকে নিজের ভাষায় নিজেকে প্রকাশ করতে দেয়।</p><div className="intro-stamp"><span>BN</span><span>EN</span><span>AI</span><b>একসঙ্গে</b></div></div></div>
        </section>

        <section className="learn-section" id="learn"><div className="container learn-layout"><div className="learn-heading"><SectionEyebrow index="02A">DSAI শিখুন</SectionEyebrow><h2>প্রশ্ন থাকলে<br /><span>পথও থাকে।</span></h2><p>Google, ChatGPT বা বন্ধুর কাছ থেকে “DSAI কী?” শুনে এলে—এই উত্তরগুলো দিয়ে শুরু করুন।</p></div><div className="learn-grid">{learnItems.map((item) => <article className="learn-card" key={item.label}><span className="learn-label">{item.label}</span><h3>{item.title}</h3><p>{item.body}</p><a href="#join">নিজের পথে যান <ArrowRight size={15} /></a></article>)}</div></div></section>

        <section className="pathways-section" id="workflows">
          <div className="container"><div className="section-header"><div><SectionEyebrow index="02">কাজের ক্ষেত্র</SectionEyebrow><h2>দুটি পথ। <span>একই যত্ন।</span></h2></div><p>আপনার কাজের ধরন বদলালেও DSAI-এর নীতি বদলায় না: স্পষ্টতা, মানব নিয়ন্ত্রণ এবং সৎ সীমা।</p></div>
            <div className="pathway-grid">
              <article className="pathway-card access-card"><div className="pathway-image" aria-hidden="true" /><div className="pathway-content"><div className="card-kicker"><span>01</span><span>UNIVERSAL ACCESS AGENT</span></div><h3>জটিল কাজকে<br /><em>সহজ পথে</em> আনুন।</h3><p>ফর্ম, নোটিশ, রিপোর্ট, আবেদন বা অন্য ভাষার তথ্য—UAA আপনাকে বুঝতে, সাজাতে এবং প্রস্তুত হতে সাহায্য করে।</p><div className="tag-row"><span>Document intake</span><span>বাংলা / English</span><span>Human review</span></div><button className="card-link" onClick={openAccessFlow}>Access-এর পথ দেখুন <ArrowRight size={16} /></button></div></article>
              <article className="pathway-card creative-card"><div className="pathway-image" aria-hidden="true" /><div className="pathway-content"><div className="card-kicker"><span>02</span><span>CREATIVE STUDIO</span></div><h3>ভাবনাকে <br /><em>দৃশ্যে</em> আনুন।</h3><p>বাংলা, Banglish বা English prompt দিয়ে ছবি তৈরি করুন, private library-তে রাখুন এবং প্রয়োজন হলে download করুন।</p><div className="tag-row"><span>ছবি তৈরি</span><span>Private library</span><span>Preview ও download</span></div><button className="card-link" onClick={openCreativeFlow}>Studio খুলুন <ArrowRight size={16} /></button></div></article>
            </div>
          </div>
        </section>
        {showAccessForm && <section className="flow-console"><div className="container flow-console-inner"><div><SectionEyebrow index="LIVE">আপনার workspace</SectionEyebrow><h2>UAA case-এর প্রথম খসড়া</h2><p>আপনার প্রয়োজনের একটি সংক্ষিপ্ত নাম দিন। এটি আপনার workspace-এ draft হিসেবে সংরক্ষিত থাকবে।</p><form className="inline-flow-form" onSubmit={submitAccess}><label htmlFor="access-title">কাজের নাম</label><input id="access-title" required value={accessTitle} onChange={(event) => setAccessTitle(event.target.value)} placeholder="যেমন: সরকারি ফর্ম বুঝতে চাই" /><div className="form-actions"><button className="btn-primary" type="submit" disabled={accessCreate.isPending}>{accessCreate.isPending ? "সংরক্ষণ হচ্ছে…" : "Draft সংরক্ষণ করুন"}</button><button className="btn-quiet" type="button" onClick={() => setShowAccessForm(false)}>বন্ধ করুন</button></div></form></div><aside className="flow-status"><span className="status-label">আপনার UAA cases</span>{!isAuthenticated ? <><strong className="status-text">প্রথমে প্রবেশ করুন</strong><small>আপনার ব্যক্তিগত case দেখতে account-এ প্রবেশ করুন।</small></> : accessCases.isLoading ? <strong className="status-text">লোড হচ্ছে…</strong> : accessCases.isError ? <><strong className="status-text">লোড হয়নি</strong><small>আবার চেষ্টা করুন।</small></> : accessCases.data?.length ? <div className="case-list">{accessCases.data.map((item) => <div className="case-list-item" key={item.id}><strong>{item.title}</strong><span>{item.status} · {new Date(item.createdAt).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })}</span></div>)}</div> : <><strong className="status-text">এখনও কোনো case নেই</strong><small>প্রথম draft তৈরি করতে একটি কাজের নাম দিন।</small></>}<small>AI draft করে; আপনি review করে এগোন।</small></aside></div></section>}

        <section className="workflow-section" id="workflow"><div className="container workflow-layout"><div className="workflow-heading"><SectionEyebrow index="03">কীভাবে কাজ করে</SectionEyebrow><h2>প্রতিটি<br /><span>পরবর্তী পদক্ষেপ</span><br />আরও পরিষ্কার।</h2><p>AI আপনার হয়ে সিদ্ধান্ত নেয় না। এটি আপনার সামনে পথটি স্পষ্ট করে—তারপর আপনি এগোন।</p></div><div className="workflow-list">{workflowItems.map(({ step, title, en, body, icon: Icon }, i) => <div className="workflow-row" key={step}><div className="workflow-number">{step}</div><div className="workflow-icon"><Icon size={18} /></div><div className="workflow-copy"><h3>{title} <small>{en}</small></h3><p>{body}</p></div><span className={`row-arrow ${i === 3 ? "last" : ""}`}><ArrowRight size={17} /></span></div>)}</div></div></section>

        <section className="economics-section" id="economics"><div className="container economics-layout"><div className="economics-main"><SectionEyebrow index="04">কাজের মূল্য</SectionEyebrow><h2>প্রয়োজনীয় কাজকে<br /><em>সহজ করে</em> শুরু করুন।</h2><p>আপনি Try First দিয়ে শুরু করতে পারেন, তারপর account খুলে নিজের draft, lead এবং তৈরি ছবি গুছিয়ে রাখতে পারেন। বর্তমান সেবাগুলো ব্যবহারের জন্য কোনো পেমেন্ট প্রয়োজন নেই।</p><div className="economics-stats"><div><strong>TRY</strong><span>আগে দেখে নিন</span></div><div><strong>WORK</strong><span>নিজের draft রাখুন</span></div><div><strong>CREATE</strong><span>ছবি তৈরি করুন</span></div></div><a className="btn-primary" href="/try-first">শুরু করুন <ArrowRight size={17} /></a></div><div className="economics-visual"><div className="economics-orbit" /><div className="economics-card card-top"><FileText size={18} /><span>Workdesk</span><strong>আপনার কাজ</strong></div><div className="economics-card card-bottom"><Sparkles size={18} /><span>Creative Studio</span><strong>আপনার সৃষ্টি</strong></div><div className="economics-line line-up" /><div className="economics-line line-down" /><div className="economics-center"><span>DSAI</span><b>+</b></div></div></div></section>

        <section className="trust-section" id="trust"><div className="container"><div className="trust-top"><div><SectionEyebrow index="05">বিশ্বাসের নীতি</SectionEyebrow><h2>সহজভাবে জানুন,<br /><span>নিরাপদে ব্যবহার করুন।</span></h2></div><p>আপনার কাজ আপনার নিয়ন্ত্রণে থাকে। DSAI সাহায্য করে, কিন্তু গুরুত্বপূর্ণ সিদ্ধান্ত আপনারই।</p></div><div className="trust-grid"><div className="trust-visual"><div className="trust-overlay"><ShieldCheck size={22} /><span>Built for<br /><b>responsible action</b></span></div></div><div className="trust-points"><div><span>01</span><div><h3>আপনার সিদ্ধান্ত</h3><p>AI draft ও ধারণা দেয়; গুরুত্বপূর্ণ কাজ পাঠানোর আগে আপনি review করেন।</p></div></div><div><span>02</span><div><h3>Private image library</h3><p>আপনার তৈরি ছবি account-এর সঙ্গে রাখা হয় এবং আপনার জন্যই preview ও download link তৈরি হয়।</p></div></div><div><span>03</span><div><h3>পরিষ্কার সীমা</h3><p>এক account-এ দিনে সর্বোচ্চ ২টি ছবি এবং প্রতিদিন সর্বোচ্চ ৫০০টি account-এর সুযোগ থাকে।</p></div></div><div><span>04</span><div><h3>সহজ ভাষা</h3><p>বাংলা, Banglish ও English-এ কাজ শুরু করুন; প্রয়োজন হলে output নিজে যাচাই করুন।</p></div></div></div></div></div></section>

        <section className="faq-section"><div className="container faq-layout"><div className="faq-heading"><SectionEyebrow index="06">সাধারণ প্রশ্ন</SectionEyebrow><h2>স্বচ্ছ থাকা<br /><span>জটিল নয়।</span></h2><p>প্রতিশ্রুতির আগে সীমাগুলো জানুন। এটাই DSAI-এর শুরু।</p></div><div className="faq-list">{faqItems.map((item, i) => <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={item.q}><button onClick={() => setOpenFaq(openFaq === i ? null : i)}><span>{item.q}</span><ChevronDown size={18} /></button>{openFaq === i && <p>{item.a}</p>}</div>)}</div></div></section>

         <section className="final-cta" id="join"><div className="container final-cta-inner"><div className="final-mark"><SignalMark /></div><SectionEyebrow index="07">এখন শুরু করুন</SectionEyebrow><h2>আপনার বাস্তব কাজের<br /><em>প্রথম পদক্ষেপ</em> আজই।</h2><p>আপনার ভাষায় প্রয়োজনটি লিখুন, সহজ draft তৈরি করুন এবং গুরুত্বপূর্ণ সিদ্ধান্তের আগে নিজে review করুন। নিচের email formটি আপডেট পাওয়ার তালিকা; নিজের কাজের জন্য <b>প্রবেশ করুন / অ্যাকাউন্ট তৈরি করুন</b> ব্যবহার করুন।</p><div className="contact-note"><a href="mailto:info@banglarvoice24news.com"><Mail size={16} /> info@banglarvoice24news.com</a><span>যোগাযোগ: dsai@banglarvoice24news.com</span></div><div className="launch-proof-grid" aria-label="DSAI-এর মূল সুবিধা"><div><strong>বাংলা-first</strong><span>বাংলা, Banglish ও English workflow</span></div><div><strong>আপনার review</strong><span>AI সাহায্য করে, সিদ্ধান্ত আপনার</span></div><div><strong>সৎ সীমা</strong><span>যা চালু আছে, তা পরিষ্কারভাবে জানুন</span></div></div><form className="waitlist-form" onSubmit={submitWaitlist}><label htmlFor="waitlist-email">ইমেইল · আপডেটের তালিকা</label><div className="waitlist-fields"><input id="waitlist-email" type="email" required value={waitlistEmail} onChange={(event) => setWaitlistEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /><select value={waitlistInterest} onChange={(event) => setWaitlistInterest(event.target.value as typeof waitlistInterest)} aria-label="আপনার আগ্রহ"><option value="both">Access + Creative</option><option value="access">Universal Access</option><option value="creative">Creative Studio</option></select><button className="btn-light" type="submit" disabled={waitlistJoin.isPending}>{waitlistJoin.isPending ? "সংরক্ষণ হচ্ছে…" : "আপডেট পেতে যুক্ত থাকুন"} <ArrowRight size={17} /></button></div></form><div className="launch-actions"><span>নতুন বা আগের ব্যবহারকারী?</span><button className="btn-quiet light-quiet" type="button" onClick={() => isAuthenticated ? toast("আপনি ইতিমধ্যে প্রবেশ করেছেন।") : window.location.assign("/auth/login?returnTo=/workspace")}>প্রবেশ করুন / অ্যাকাউন্ট তৈরি করুন <ArrowRight size={15} /></button></div></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><div className="brand footer-brand"><SignalMark small /><span>DSAI</span></div><p>বাংলা-first AI Workdesk for real-world clarity.<br />বাস্তব কাজের জন্য মানুষের পাশে দায়িত্বশীল AI.</p><p className="social-note"><a href="mailto:info@banglarvoice24news.com">যোগাযোগ: info@banglarvoice24news.com</a></p><div className="footer-links"><a href="#path">প্ল্যাটফর্ম</a><a href="#trust">বিশ্বাস ও নিরাপত্তা</a><a href="#economics">কাজ শুরু করুন</a><a href="/privacy">গোপনীয়তা</a><a href="/evidence">সেবার অবস্থা</a><a href="mailto:info@banglarvoice24news.com"><Mail size={14} /> যোগাযোগ</a></div><div className="footer-bottom"><span>© 2026 DSAI Platform</span><span>বাংলা-first · আপনার নিয়ন্ত্রণে</span></div></div></footer>
    </div>
  );
}
