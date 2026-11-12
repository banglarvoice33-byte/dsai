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
  Facebook,
  Instagram,
  Linkedin,
  CircleHelp,
  FileText,
  Globe2,
  Headphones,
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
  Twitter,
  WalletCards,
  X,
  Youtube,
} from "lucide-react";

const emblem = "/icons/dsai-mark.svg";

const socialItems = [
  { label: "Facebook", Icon: Facebook },
  { label: "Instagram", Icon: Instagram },
  { label: "LinkedIn", Icon: Linkedin },
  { label: "YouTube", Icon: Youtube },
  { label: "X", Icon: Twitter },
];

const homepageCopy = {
  bn: {
    nav: ["পথচিত্র", "কাজের ক্ষেত্র", "শিখুন", "ডেভেলপার", "ওয়ার্কস্পেস", "স্কলারশিপ", "প্ল্যাটফর্ম", "পদ্ধতি", "প্রমাণ", "গোপনীয়তা", "চেঞ্জলগ", "বিশ্বাস", "অধিকার ও নীতি", "Client response agent"],
    heroEyebrow: "Access · Create · Trust",
    heroLead: "বাংলা, Banglish এবং English-এ জটিল তথ্যকে checklist, draft এবং human-reviewed action pack-এ রূপান্তর করার Workdesk।",
    pathCta: "পথচিত্র দেখুন",
    workflowCta: "কীভাবে কাজ করে",
    headerCta: "শুরু করুন",
    workspaceCta: "ওয়ার্কস্পেসে যান",
    searchPlaceholder: "DSAI-তে কী খুঁজছেন? যেমন: API key, deploy, privacy",
    searchHint: "Enter চাপুন বা একটি suggestion বেছে নিন · বাংলা, Banglish ও English—তিনভাবেই খুঁজুন",
  },
  en: {
    nav: ["Path", "Workflows", "Learn", "Developer", "Workspace", "Scholarship", "Platform", "Method", "Evidence", "Privacy", "Changelog", "Trust", "Governance & rights", "Client response agent"],
    heroEyebrow: "Access · Create · Trust",
    heroLead: "A Bengali-first Workdesk that turns complex information into checklists, drafts, and human-reviewed action packs in Bengali, Banglish, and English.",
    pathCta: "Explore the path",
    workflowCta: "How it works",
    headerCta: "Get started",
    workspaceCta: "Open workspace",
    searchPlaceholder: "Search DSAI, for example: API key, deploy, privacy",
    searchHint: "Press Enter or choose a suggestion · Search in Bengali, Banglish, or English",
  },
} as const;

const navItems = [
  ["কাজের ক্ষেত্র", "#workflows"],
  ["Creative Studio", "/creative-studio"],
  ["Student Pro", "/scholarship"],
  ["শিখুন", "#learn"],
  ["ওয়ার্কস্পেস", "/workspace"],
  ["ডেভেলপার", "/developer"],
  ["প্রমাণ", "/evidence"],
  ["গোপনীয়তা", "/privacy"],
];

const workflowItems = [
  { step: "01", title: "আনুন", en: "Bring it in", body: "কথা, ছবি, স্ক্যান বা ফর্ম—যে ভাষায় স্বচ্ছন্দ, সেই ভাষাতেই শুরু করুন।", icon: FileText },
  { step: "02", title: "বুঝুন", en: "Make it clear", body: "জটিল তথ্যকে সহজ ভাষা, checklist এবং পরবর্তী পদক্ষেপে ভেঙে দিন।", icon: Globe2 },
  { step: "03", title: "যাচাই করুন", en: "Review together", body: "উচ্চ-ঝুঁকির কাজ মানব পর্যালোচনায় যায়। AI draft করে, মানুষ সিদ্ধান্ত নেয়।", icon: ShieldCheck },
  { step: "04", title: "এগিয়ে যান", en: "Move forward", body: "প্রয়োজনীয় script, draft বা action plan হাতে নিয়ে বাস্তব কাজে ফিরুন।", icon: ArrowRight },
];

const learnItems = [
  { title: "প্রথমে কী করব?", body: "পথচিত্র দেখুন, আপনার প্রয়োজনের পথ বেছে নিন, তারপর sign in করে UAA case draft বা Creative brief queue-তে দিন।", label: "START HERE" },
  { title: "DSAI কীভাবে কাজে লাগে?", body: "নোটিশ, রিপোর্ট, form বা brief-কে সহজ ভাষা, checklist এবং human-reviewed next step-এ সাজাতে ব্যবহার করুন।", label: "USE DSAI" },
  { title: "কোন কাজ এখনো নেই?", body: "Live image/video generation, external messaging, calendar booking, billing, OCR upload এবং automatic high-risk submission এখনো launch gate বা roadmap।", label: "KNOW THE LIMITS" },
];

const faqItems = [
  { q: "DSAI কি Bitcoin mining করে?", a: "না। DSAI-এর MVP কোনো device-based cryptocurrency mining, crypto wallet বা earnings promise দেয় না। আমাদের ফোকাস মানুষের জন্য দরকারি access workflow এবং fair-use Creative Studio।" },
  { q: "UAA কি ডাক্তার বা আইনজীবীকে বদলে দেয়?", a: "না। UAA তথ্য বোঝা, checklist, draft ও প্রস্তুতিতে সাহায্য করে। চিকিৎসা, আইন, অভিবাসন বা সরকারি submission-এর মতো উচ্চ-ঝুঁকির কাজে মানব যাচাই বাধ্যতামূলক।" },
  { q: "Creative Studio কি ছবি তৈরি করে?", a: "Creative Studio-তে account দিয়ে লগইন করে ছবি তৈরির অনুরোধ করা যায়। Agnes AI প্রথমে এবং Cloudflare Workers AI fallback হিসেবে ব্যবহৃত হয়। প্রতিদিন প্রতি account-এ সর্বোচ্চ ২টি সফল ছবি এবং মোট ৫০০টি account-এর সীমা রয়েছে। Login ও provider readiness সম্পূর্ণ যাচাই না হওয়া পর্যন্ত availability নিশ্চিত বলে ধরা হবে না। Video generation এখনো চালু নয়।" },
  { q: "DSAI API key কীভাবে ব্যবহার করব?", a: "সাধারণ user-এর API key প্রয়োজন নেই। কোনো provider connector চালু হলে operator key-টি server-side secret manager বা .env.production-এ রাখবেন। API key কখনো browser, chat, Git repository বা public form-এ paste করবেন না; প্রয়োজনে revoke/rotate করবেন।" },
  { q: "এক কমান্ডে DSAI deploy করা যায়?", a: "হ্যাঁ, প্রথমবার environment, database, DNS/TLS এবং OAuth প্রস্তুত করার পর `bash deploy-genesis.sh` dependency install, build, port selection, restart এবং health check করে। Script নিজে domain, mailbox, OAuth credential বা provider account তৈরি করে না।" },
  { q: "Super Agent বা 24/7 automation কি চালু?", a: "না। Architecture ও connector registry প্রস্তুত, কিন্তু external messaging, CRM, calendar, publishing বা always-on agent চালু নয়। Consent, opt-out, provider credential, webhook verification, audit log, rate limit এবং human approval ছাড়া এগুলো live করা যাবে না।" },
  { q: "Text-to-video কীভাবে তৈরি করব?", a: "বর্তমান DSAI preview text-to-video তৈরি করে না; এটি Creative brief queue করে। Live text-to-video-এর জন্য media provider ও worker, storage, quota, billing, moderation, provenance এবং large-file processing pipeline আলাদা করে যুক্ত ও পরীক্ষা করতে হবে।" },
  { q: "বাংলা কি সত্যিই first-class language?", a: "বর্তমান preview-তে Bengali-first UI, bilingual copy এবং BN/EN toggle আছে। Voice input, transliteration, glossary lock এবং পূর্ণ ভাষা-QA pipeline এখনও roadmap-এর অংশ—এগুলোকে সম্পূর্ণ চালু বলে দাবি করা হচ্ছে না।" },
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
  { title: "DSAI কীভাবে কাজে লাগে?", description: "নোটিশ, রিপোর্ট, form বা brief-কে checklist ও human-reviewed next step-এ সাজান।", label: "DSAI শিখুন / Learn DSAI", href: "#learn", keywords: "dsai কী how use কাজ ব্যবহার শুরু", aliases: ["how to use dsai", "use dsai", "dsai ব্যবহার", "কীভাবে ব্যবহার", "কাজে লাগে"] },
  { title: "Try First — আগে অনুভব করুন", description: "কোনো document বা account ছাড়াই local preview-তে একটি ছোট work plan তৈরি করুন।", label: "Try First / Guest demo", href: "/try-first", keywords: "try first guest demo test without login no document আগে পরীক্ষা", aliases: ["try first", "guest demo", "test dsai", "আগে পরীক্ষা", "লগইন ছাড়া"] },
  { title: "UAA — জটিল কাজকে সহজ পথে আনুন", description: "ফর্ম, নোটিশ, রিপোর্ট বা অন্য ভাষার তথ্য বুঝতে ও প্রস্তুত হতে সাহায্য নিন।", label: "কাজের ক্ষেত্র / Workflows", href: "#workflows", keywords: "uaa access document form notice report", aliases: ["universal access agent", "access agent", "document help", "ফর্ম বুঝতে", "নোটিশ"] },
  { title: "Creative Studio — ভাবনাকে দৃশ্যে আনুন", description: "বাংলা বা ইংরেজিতে creative brief দিয়ে fair-use queue-তে শুরু করুন।", label: "কাজের ক্ষেত্র / Workflows", href: "#workflows", keywords: "creative studio create brief image video", aliases: ["creative", "make image", "make video", "ছবি তৈরি", "ভিডিও তৈরি", "সৃজন"] },
  { title: "কীভাবে কাজ করে", description: "আনুন, বুঝুন, যাচাই করুন এবং পরবর্তী পদক্ষেপে এগিয়ে যান।", label: "পথচিত্র / Workflow", href: "#workflow", keywords: "workflow steps কীভাবে কাজ করে review", aliases: ["how it works", "workflow steps", "পদ্ধতি", "কাজের ধাপ"] },
  { title: "API key নিরাপদে কোথায় দেব?", description: "Provider key শুধু server-side secret manager বা .env.production-এ রাখুন।", label: "Developer / API Safety", href: "/developer", keywords: "api key secret নিরাপত্তা provider", aliases: ["api key", "secret key", "where to put api key", "এপিআই কী", "গোপন key"] },
  { title: "এক কমান্ডে DSAI deploy", description: "Environment প্রস্তুত হলে deploy-genesis.sh dependency, build, port ও health check চালায়।", label: "Developer / Deploy", href: "/developer", keywords: "deploy deployment one command server port", aliases: ["one command deploy", "how to deploy", "ডেপ্লয়", "এক কমান্ড", "server setup"] },
  { title: "Lead agent, hosting ও partner program", description: "৩ সেকেন্ডের first-response target, ৭টি hosting adapter, scaling control এবং influencer attribution-এর সত্যিকারের readiness দেখুন।", label: "প্ল্যাটফর্ম / Platform", href: "/platform", keywords: "lead agent three seconds hosting vps cloud scale affiliate influencer commission partner", aliases: ["3 second agent", "lead response", "hosting options", "vps hosting", "affiliate program", "influencer link", "হোস্টিং", "এজেন্ট", "কমিশন"] },
  { title: "যেকোনো ভাষায় business lead তৈরি করুন", description: "৪০টি priority market-এর context নিয়ে target language, industry, audience, tone ও channel বেছে reviewable localized draft তৈরি করুন।", label: "Multilingual Leads / বহু ভাষার lead", href: "/lead-composer", keywords: "multilingual lead business country language locale market audience industry tone channel localized draft", aliases: ["40 market lead", "business lead form", "any language lead", "localized lead", "যেকোনো ভাষা", "ব্যবসায়িক লিড", "দেশভিত্তিক লিড", "বহুভাষিক লিড"] },
  { title: "DSAI-এর গোপনীয়তা নীতি", description: "ডেটা, retention, deletion request এবং connector safety সম্পর্কে জানুন।", label: "গোপনীয়তা / Privacy", href: "/privacy", keywords: "privacy data deletion retention নিরাপত্তা", aliases: ["privacy policy", "delete data", "data deletion", "ডেটা মুছুন", "গোপনীয়তা নীতি"] },
  { title: "DSAI-এর পদ্ধতি ও পার্থক্য", description: "Source-first clarity, human review, editable work এবং privacy boundary কীভাবে একসঙ্গে কাজ করে দেখুন।", label: "পদ্ধতি / Method", href: "/method", keywords: "method edge competitor difference evidence review control", aliases: ["why dsai", "what makes dsai different", "source first", "human review", "কেন dsai"] },
  { title: "৩ সেকেন্ডের client-response agent", description: "Lead intake, first acknowledgement, qualification এবং approved next-step draft-এর জন্য deployment inquiry পাঠান।", label: "Service inquiry / Client response", href: "#client-response", keywords: "three second client response lead agent contact meeting deploy service", aliases: ["3 second agent", "client response service", "lead agent service", "ক্লাইন্ট ধরার এজেন্ট"] },
  { title: "DSAI-এর প্রমাণ ও সীমা", description: "কোন capability live, preview, roadmap বা provider-gated—স্বচ্ছ ledger দেখুন।", label: "প্রমাণ / Evidence", href: "/evidence", keywords: "evidence proof limits capability", aliases: ["what is live", "feature limits", "প্রমাণ", "সীমা", "কোন feature আছে"] },
  { title: "সাম্প্রতিক পরিবর্তন", description: "DSAI-এর প্রকাশিত product update ও release notes পড়ুন।", label: "চেঞ্জলগ / Changelog", href: "/changelog", keywords: "changelog update release পরিবর্তন", aliases: ["latest update", "new features", "নতুন ফিচার", "আপডেট"] },
  { title: "অধিকার, নীতি ও ব্যবহারের সীমা", description: "Brand, code, architecture, user content, AI output, open-source notices ও policy boundary দেখুন।", label: "Governance / Ownership", href: "/governance", keywords: "ownership authority code architecture terms policy license copyright open source", aliases: ["who owns dsai", "code ownership", "system authority", "terms", "license", "copyright", "মালিকানা", "অধিকার", "শর্তাবলি"] },
  { title: "Pro ও Enterprise plans", description: "Capability boundary, provider-gated upgrade inquiry এবং payment safety দেখুন।", label: "Plans / Upgrade", href: "/plans", keywords: "plans pricing pro enterprise upgrade payment bKash Nagad Rocket card", aliases: ["pro plan", "enterprise plan", "upgrade", "pricing", "পেমেন্ট", "প্রো", "এন্টারপ্রাইজ"] },
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
  const creativeRequest = trpc.creative.request.useMutation();
  const searchRecord = trpc.search.record.useMutation();
  const accessCases = trpc.access.list.useQuery(undefined, { enabled: isAuthenticated });
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistInterest, setWaitlistInterest] = useState<"access" | "creative" | "both">("both");
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [showCreativeForm, setShowCreativeForm] = useState(false);
  const [accessTitle, setAccessTitle] = useState("");
  const [creativePrompt, setCreativePrompt] = useState("");
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

  const showComingSoon = () => toast("এই অংশটি পরবর্তী ধাপে আসছে — এখনই পরিকল্পনাটি দেখুন।");
  const submitWaitlist = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    waitlistJoin.mutate({ email: waitlistEmail, interest: waitlistInterest, language: lang }, {
      onSuccess: () => { setWaitlistEmail(""); toast("আপনার আগ্রহ সংরক্ষণ করা হয়েছে। DSAI চালু হলে জানানো হবে।"); },
      onError: (error) => toast(error.message || "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।"),
    });
  };
  const openAccessFlow = () => isAuthenticated ? setShowAccessForm(true) : window.location.assign("/auth/login?returnTo=/workspace");
  const openCreativeFlow = () => isAuthenticated ? setShowCreativeForm(true) : window.location.assign("/auth/login?returnTo=/workspace");
  const submitAccess = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    accessCreate.mutate({ title: accessTitle, workflow: "document", language: lang, riskLevel: "medium" }, {
      onSuccess: () => { setAccessTitle(""); setShowAccessForm(false); toast("UAA case draft তৈরি হয়েছে।"); accessCases.refetch(); },
      onError: (error) => toast(error.message || "UAA case তৈরি করা যায়নি।"),
    });
  };
  const submitCreative = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    creativeRequest.mutate({ prompt: creativePrompt, tier: "free" }, {
      onSuccess: () => { setCreativePrompt(""); setShowCreativeForm(false); toast("Creative request queue-তে যোগ হয়েছে।"); },
      onError: (error) => toast(error.message || "Creative request সংরক্ষণ করা যায়নি।"),
    });
  };

  return (
    <div className="home-page-shell min-h-screen overflow-x-hidden bg-parchment text-ink" id="top">
      <a className="skip-link" href="#main-content">মূল কনটেন্টে যান</a>
      <div className="top-ribbon" role="region" aria-label="DSAI platform announcement"><span>বাংলা প্রথম</span><span className="ribbon-dot" />Human-centred AI access for the real world<span className="ribbon-right">Open, fair-use, and explicit about limits.</span></div>
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
            <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menuOpen && <div className="mobile-nav">{localizedNavItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<button className="mobile-theme-toggle" onClick={() => toggleTheme?.()} aria-pressed={theme === "dark"}>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />} {theme === "dark" ? "দিনের আলো চালু করুন" : "Night Workdesk চালু করুন"}</button><button onClick={() => isAuthenticated ? window.location.assign("/workspace") : window.location.assign("/auth/login?returnTo=/workspace")}>{copy.workspaceCta} <ArrowRight size={15} /></button></div>}
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
              <div className="hero-note"><LockKeyhole size={16} /><span>কোনো device mining নয়। কোনো guaranteed income নয়।<br /><b>সৎ সীমা দেখিয়েই সেবা তৈরি হয়।</b></span></div>
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
              <article className="pathway-card creative-card"><div className="pathway-image" aria-hidden="true" /><div className="pathway-content"><div className="card-kicker"><span>02</span><span>CREATIVE STUDIO</span></div><h3>ভাবনাকে <br /><em>দৃশ্যে</em> আনুন।</h3><p>বাংলা বা ইংরেজিতে creative brief দিয়ে শুরু করুন। বর্তমান preview request queue, fair-use policy ও provider boundary স্পষ্ট করে; live image generation এখনো আলাদা integration gate।</p><div className="tag-row"><span>Creative brief</span><span>Provider-ready</span><span>Fair-use policy</span></div><button className="card-link" onClick={openCreativeFlow}>Studio-এর পথ দেখুন <ArrowRight size={16} /></button></div></article>
            </div>
          </div>
        </section>
        {(showAccessForm || showCreativeForm) && <section className="flow-console"><div className="container flow-console-inner"><div><SectionEyebrow index="LIVE">আপনার workspace</SectionEyebrow><h2>{showAccessForm ? "UAA case-এর প্রথম খসড়া" : "Creative request-এর শুরু"}</h2><p>{showAccessForm ? "আপনার প্রয়োজনের একটি সংক্ষিপ্ত নাম দিন। এটি draft হিসেবে সংরক্ষিত থাকবে—কোনো external submission হবে না।" : "একটি ছোট prompt লিখুন। এটি fair-use queue-তে request হিসেবে সংরক্ষিত হবে; output generation এখনো আলাদা ধাপ।"}</p>{showAccessForm ? <form className="inline-flow-form" onSubmit={submitAccess}><label htmlFor="access-title">Case title</label><input id="access-title" required value={accessTitle} onChange={(event) => setAccessTitle(event.target.value)} placeholder="যেমন: সরকারি ফর্ম বুঝতে চাই" /><div className="form-actions"><button className="btn-primary" type="submit" disabled={accessCreate.isPending}>{accessCreate.isPending ? "সংরক্ষণ হচ্ছে…" : "Draft সংরক্ষণ করুন"}</button><button className="btn-quiet" type="button" onClick={() => setShowAccessForm(false)}>বন্ধ করুন</button></div></form> : <form className="inline-flow-form" onSubmit={submitCreative}><label htmlFor="creative-prompt">Creative prompt</label><textarea id="creative-prompt" required value={creativePrompt} onChange={(event) => setCreativePrompt(event.target.value)} placeholder="বাংলায় একটি editorial poster-এর ভাবনা লিখুন" rows={4} /><div className="form-actions"><button className="btn-primary" type="submit" disabled={creativeRequest.isPending}>{creativeRequest.isPending ? "Queue হচ্ছে…" : "Queue-তে দিন"}</button><button className="btn-quiet" type="button" onClick={() => setShowCreativeForm(false)}>বন্ধ করুন</button></div></form>}</div><aside className="flow-status"><span className="status-label">আপনার UAA cases</span>{!isAuthenticated ? <><strong className="status-text">Sign in required</strong><small>আপনার ব্যক্তিগত case দেখতে sign in করুন।</small></> : accessCases.isLoading ? <strong className="status-text">লোড হচ্ছে…</strong> : accessCases.isError ? <><strong className="status-text">লোড হয়নি</strong><small>আবার চেষ্টা করুন।</small></> : accessCases.data?.length ? <div className="case-list">{accessCases.data.map((item) => <div className="case-list-item" key={item.id}><strong>{item.title}</strong><span>{item.status} · {new Date(item.createdAt).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })}</span></div>)}</div> : <><strong className="status-text">এখনও কোনো case নেই</strong><small>প্রথম draft তৈরি করতে Access-এর পথ বেছে নিন।</small></>}<small>human-gated · no auto-submit</small></aside></div></section>}

        <section className="workflow-section" id="workflow"><div className="container workflow-layout"><div className="workflow-heading"><SectionEyebrow index="03">কীভাবে কাজ করে</SectionEyebrow><h2>প্রতিটি<br /><span>পরবর্তী পদক্ষেপ</span><br />আরও পরিষ্কার।</h2><p>AI আপনার হয়ে সিদ্ধান্ত নেয় না। এটি আপনার সামনে পথটি স্পষ্ট করে—তারপর আপনি এগোন।</p></div><div className="workflow-list">{workflowItems.map(({ step, title, en, body, icon: Icon }, i) => <div className="workflow-row" key={step}><div className="workflow-number">{step}</div><div className="workflow-icon"><Icon size={18} /></div><div className="workflow-copy"><h3>{title} <small>{en}</small></h3><p>{body}</p></div><span className={`row-arrow ${i === 3 ? "last" : ""}`}><ArrowRight size={17} /></span></div>)}</div></div></section>

        <section className="container" id="client-response" aria-labelledby="client-response-title"><div className="my-8 grid gap-6 overflow-hidden border border-[#d7a34b]/45 bg-[#18241f] p-6 text-[#f2eee4] shadow-[0_24px_60px_rgba(24,36,31,.16)] sm:my-12 sm:grid-cols-[1.15fr_.85fr] sm:p-10"><div><div className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-[.22em] text-[#d7a34b]"><span className="h-2 w-2 rounded-full bg-[#d7a34b]" /> DSAI / Service inquiry</div><h2 id="client-response-title" className="max-w-2xl font-display text-4xl leading-[.98] sm:text-6xl">প্রথম প্রতিক্রিয়া দ্রুত।<br /><em className="text-[#d7a34b]">পরবর্তী কাজ পরিষ্কার।</em></h2><p className="mt-5 max-w-2xl text-sm leading-7 text-[#f2eee4]/70 sm:text-base">৩ সেকেন্ডের first-response target-ভিত্তিক client-response agent-এর জন্য inquiry পাঠান। Lead intake, Bengali/Banglish intent routing, qualification, response draft এবং approved next-step Work Packet—এই service-এর scope-এর অংশ হতে পারে।</p><div className="mt-6 flex flex-wrap gap-2 text-[11px] text-[#f2eee4]/70"><span className="border border-white/15 px-3 py-2">Preview-first</span><span className="border border-white/15 px-3 py-2">Human approval</span><span className="border border-white/15 px-3 py-2">Deployable workflow</span></div></div><div className="flex flex-col justify-between border-t border-white/15 pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0"><div><p className="text-xs leading-6 text-[#f2eee4]/60">Live outreach, CRM write, SMS/email sending এবং calendar booking provider consent ও verification ছাড়া চালু হয় না। এই email-এ আপনার use case, channel, target response time এবং deployment preference লিখুন।</p><a href="/lead-composer" className="mt-6 inline-flex items-center gap-2 border border-[#d7a34b]/60 px-5 py-3 text-sm font-semibold text-[#f2eee4] transition hover:border-[#d7a34b] hover:text-[#d7a34b] focus:outline-none focus:ring-2 focus:ring-[#d7a34b] focus:ring-offset-2 focus:ring-offset-[#18241f]">নিজের ভাষায় lead draft তৈরি করুন <ArrowRight className="h-4 w-4" /></a><a href="mailto:eventai@banglarvoice24news.com?subject=DSAI%20client-response%20agent%20inquiry" className="mt-6 inline-flex items-center gap-2 bg-[#963a28] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d96b4f] focus:outline-none focus:ring-2 focus:ring-[#d7a34b] focus:ring-offset-2 focus:ring-offset-[#18241f]"><Mail className="h-4 w-4" /> eventai@banglarvoice24news.com <ArrowRight className="h-4 w-4" /></a></div><p className="mt-6 text-[10px] uppercase tracking-[.16em] text-[#d7a34b]/75">Service inquiry · no guaranteed conversion claim</p></div></div></section>

        <section className="economics-section" id="economics"><div className="container economics-layout"><div className="economics-main"><SectionEyebrow index="04">অর্থনীতি</SectionEyebrow><h2>সৃষ্টির মাধ্যমে<br /><em>অ্যাক্সেসকে</em> টিকিয়ে রাখি।</h2><p>Creative Studio-এর পরিকল্পিত fair-use subscriptions, institutional packs এবং sponsored access—এই সম্ভাব্য পথগুলো UAA-কে আরও মানুষের কাছে পৌঁছাতে সাহায্য করতে পারে। বর্তমান preview-তে billing বা sponsored access চালু নেই; মূল্য আসে দরকারি সেবা থেকে।</p><div className="economics-stats"><div><strong>FREE</strong><span>planned access tier</span></div><div><strong>PRO</strong><span>planned creative tier</span></div><div><strong>B2B</strong><span>planned institution tier</span></div></div><button className="btn-primary" onClick={showComingSoon}>মূল্য পরিকল্পনা বুঝুন <ArrowRight size={17} /></button></div><div className="economics-visual"><div className="economics-orbit" /><div className="economics-card card-top"><WalletCards size={18} /><span>Revenue</span><strong>Creative Studio</strong></div><div className="economics-card card-bottom"><Headphones size={18} /><span>Reinvested in</span><strong>Human access</strong></div><div className="economics-line line-up" /><div className="economics-line line-down" /><div className="economics-center"><span>DSAI</span><b>+</b></div></div></div></section>

        <section className="trust-section" id="trust"><div className="container"><div className="trust-top"><div><SectionEyebrow index="05">বিশ্বাসের স্থাপত্য</SectionEyebrow><h2>শুধু যা পারি,<br /><span>তাই বলি।</span></h2></div><p>সিস্টেমটি যেখানে অনিশ্চিত, সেখানে সেটি অনিশ্চয়তাই দেখায়। যেখানে মানুষের সিদ্ধান্ত দরকার, সেখানে মানুষই থাকে।</p></div><div className="trust-grid"><div className="trust-visual"><div className="trust-overlay"><ShieldCheck size={22} /><span>Designed for<br /><b>responsible action</b></span></div></div><div className="trust-points"><div><span>01</span><div><h3>Human-in-the-loop</h3><p>উচ্চ-ঝুঁকির draft কখনো নিজে নিজে send বা submit হয় না।</p></div></div><div><span>02</span><div><h3>Memory with consent</h3><p>Retention, export এবং forget-me policy নকশার অংশ; বর্তমান preview-তে full document storage বা self-service deletion flow এখনো চালু হয়নি।</p></div></div><div><span>03</span><div><h3>Cost governor</h3><p>Quota, queue এবং resource cost-এর policy নকশা করা হয়েছে; live billing ও provider-backed quota এখনো চালু হয়নি।</p></div></div><div><span>04</span><div><h3>Proof, not performance</h3><p>Creative output provenance-এর নীতি নির্ধারিত; বর্তমান preview-তে output generation/provider সংযুক্ত না থাকায় live provenance record তৈরি হচ্ছে না।</p></div></div></div></div></div></section>

        <section className="faq-section"><div className="container faq-layout"><div className="faq-heading"><SectionEyebrow index="06">সাধারণ প্রশ্ন</SectionEyebrow><h2>স্বচ্ছ থাকা<br /><span>জটিল নয়।</span></h2><p>প্রতিশ্রুতির আগে সীমাগুলো জানুন। এটাই DSAI-এর শুরু।</p></div><div className="faq-list">{faqItems.map((item, i) => <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={item.q}><button onClick={() => setOpenFaq(openFaq === i ? null : i)}><span>{item.q}</span><ChevronDown size={18} /></button>{openFaq === i && <p>{item.a}</p>}</div>)}</div></div></section>

        <section className="final-cta" id="join"><div className="container final-cta-inner"><div className="final-mark"><SignalMark /></div><SectionEyebrow index="07">এখন শুরু করুন</SectionEyebrow><h2>আপনার বাস্তব কাজের<br /><em>প্রথম পদক্ষেপ</em> আজই।</h2><p>DSAI-এর controlled-alpha launch-এ স্বাগতম। আপনার ভাষায় প্রয়োজনটি লিখুন, reviewable draft তৈরি করুন এবং high-risk সিদ্ধান্তে মানুষের নিয়ন্ত্রণ বজায় রাখুন। নিচের email formটি লঞ্চ আপডেটের তালিকা; ব্যক্তিগত workflow-এর জন্য <b>প্রবেশ করুন / অ্যাকাউন্ট তৈরি করুন</b> ব্যবহার করুন।</p><div className="contact-note"><a href="mailto:info@banglarvoice24news.com"><Mail size={16} /> info@banglarvoice24news.com</a><span>পরীক্ষামূলক যোগাযোগ: dsai@banglarvoice24news.com</span></div><div className="launch-proof-grid" aria-label="DSAI-এর উদ্বোধনী নীতি"><div><strong>বাংলা-first</strong><span>বাংলা, Banglish ও English workflow</span></div><div><strong>Human-gated</strong><span>AI draft করে, মানুষ সিদ্ধান্ত নেয়</span></div><div><strong>সৎ সীমা</strong><span>Live নয় এমন capability live বলা হয় না</span></div></div><form className="waitlist-form" onSubmit={submitWaitlist}><label htmlFor="waitlist-email">ইমেইল · লঞ্চ আপডেটের তালিকা</label><div className="waitlist-fields"><input id="waitlist-email" type="email" required value={waitlistEmail} onChange={(event) => setWaitlistEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /><select value={waitlistInterest} onChange={(event) => setWaitlistInterest(event.target.value as typeof waitlistInterest)} aria-label="আপনার আগ্রহ"><option value="both">Access + Creative</option><option value="access">Universal Access</option><option value="creative">Creative Studio</option></select><button className="btn-light" type="submit" disabled={waitlistJoin.isPending}>{waitlistJoin.isPending ? "সংরক্ষণ হচ্ছে…" : "আপডেট পেতে যুক্ত থাকুন"} <ArrowRight size={17} /></button></div></form><div className="launch-actions"><span>নতুন বা আগের ব্যবহারকারী?</span><button className="btn-quiet light-quiet" type="button" onClick={() => isAuthenticated ? toast("আপনি ইতিমধ্যে প্রবেশ করেছেন।") : window.location.assign("/auth/login?returnTo=/workspace")}>প্রবেশ করুন / অ্যাকাউন্ট তৈরি করুন <ArrowRight size={15} /></button></div></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><div className="brand footer-brand"><SignalMark small /><span>DSAI</span></div><p>বাংলা-first AI Workdesk for real-world clarity.<br />বাস্তব কাজের জন্য মানুষের পাশে দায়িত্বশীল AI.</p><p className="social-note">Official social channels are not published yet.<br /><a href="mailto:info@banglarvoice24news.com">যোগাযোগ: info@banglarvoice24news.com</a></p><div className="social-placeholders" aria-label="DSAI social channels">{socialItems.map(({ label, Icon }) => <span className="social-placeholder" key={label}><button type="button" onClick={() => toast(`${label}: Coming soon — official account এখনও প্রকাশিত হয়নি।`)} aria-label={`${label} official account coming soon`}><Icon size={15} aria-hidden="true" /></button><span role="tooltip">Coming soon</span></span>)}</div><div className="footer-links"><a href="#path">প্ল্যাটফর্ম</a><a href="#trust">বিশ্বাস ও নিরাপত্তা</a><a href="#economics">ন্যায্য ব্যবহার</a><a href="/privacy">গোপনীয়তা</a><a href="/changelog">পরিবর্তনের ইতিহাস</a><a href="mailto:info@banglarvoice24news.com"><Mail size={14} /> যোগাযোগ</a></div><div className="footer-bottom"><span>© 2026 DSAI Platform</span><span>Open · Bengali-first · Human-gated · DSAI</span></div></div></footer>
    </div>
  );
}
