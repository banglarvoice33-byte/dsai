/*
 * Civic Signal design reminder: public-facing editorial narrative, anchor navigation,
 * no dead-end routes, and a light parchment default theme.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import KnowledgeHelp from "./components/KnowledgeHelp";
import NetworkStatus from "./components/NetworkStatus";
import DashboardLayout from "./components/DashboardLayout";
import RequireAuth from "./components/RequireAuth";
import { useSessionSync } from "@/_core/hooks/useSessionSync";
import { accessOf } from "@/lib/routeAccess";

const Home = lazy(() => import("@/pages/Home"));
const AdminOverview = lazy(() => import("@/pages/AdminOverview"));
const AdminOperations = lazy(() => import("@/pages/AdminOperations"));
const AdminConnectors = lazy(() => import("@/pages/AdminConnectors"));
const Learn = lazy(() => import("@/pages/Learn"));
const Developer = lazy(() => import("@/pages/Developer"));
const Method = lazy(() => import("@/pages/Method"));
const Workspace = lazy(() => import("@/pages/Workspace"));
const AIHub = lazy(() => import("@/pages/AIHub"));
const Evidence = lazy(() => import("@/pages/Evidence"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Governance = lazy(() => import("@/pages/Governance"));
const Changelog = lazy(() => import("@/pages/Changelog"));
const AdminChangelog = lazy(() => import("@/pages/AdminChangelog"));
const AdminDeletionRequests = lazy(() => import("@/pages/AdminDeletionRequests"));
const AdminSearchAnalytics = lazy(() => import("@/pages/AdminSearchAnalytics"));
const Platform = lazy(() => import("@/pages/Platform"));
const AdminPlatformControl = lazy(() => import("@/pages/AdminPlatformControl"));
const AdminScholarship = lazy(() => import("@/pages/AdminScholarship"));
const AuthLogin = lazy(() => import("@/pages/AuthLogin"));
const Scholarship = lazy(() => import("@/pages/Scholarship"));
const QualityGates = lazy(() => import("@/pages/QualityGates"));
const PilotOAuthTests = lazy(() => import("@/pages/PilotOAuthTests"));
const TraceStore = lazy(() => import("@/pages/TraceStore"));
const ReadOnlyPilot = lazy(() => import("@/pages/ReadOnlyPilot"));
const AgentOperations = lazy(() => import("@/pages/AgentOperations"));
const AgentDetail = lazy(() => import("@/pages/AgentDetail"));
const CreativeStudio = lazy(() => import("@/pages/CreativeStudio"));
const CapabilityMatrix = lazy(() => import("@/pages/CapabilityMatrix"));
const Plans = lazy(() => import("@/pages/Plans"));
const AdminPayments = lazy(() => import("@/pages/AdminPayments"));
const AdminGateEvidence = lazy(() => import("@/pages/AdminGateEvidence"));
const Advertising = lazy(() => import("@/pages/Advertising"));
const TryFirst = lazy(() => import("@/pages/TryFirst"));
const LeadComposer = lazy(() => import("@/pages/LeadComposer"));
const ConfirmAcknowledgment = lazy(() => import("@/pages/ConfirmAcknowledgment"));
const Terms = lazy(() => import("@/pages/Terms"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));

const PUBLIC_PAGE_METADATA: Record<string, { title: string; description: string }> = {
  "/": {
    title: "DSAI — বাংলা-প্রথম AI Workdesk",
    description: "বাংলায় তথ্য বুঝুন, গবেষণা করুন, নথির কাজ গুছিয়ে নিন এবং AI-এর সহায়তায় পরবর্তী পদক্ষেপ তৈরি করুন—মানুষের নিয়ন্ত্রণে।",
  },
  "/learn": {
    title: "শিখুন ও ব্যবহার করুন | DSAI",
    description: "DSAI Work Desk, AI Hub এবং AI-সহায়ক কাজের ধাপগুলো সহজ বাংলায় শিখুন।",
  },
  "/developer": {
    title: "সহজ ব্যবহার নির্দেশিকা | DSAI",
    description: "DSAI-তে কাজ শুরু, AI Hub থেকে সেবা খোঁজা এবং Work Desk-এ ফলাফল ব্যবহারের সহজ নির্দেশনা দেখুন।",
  },
  "/method": {
    title: "কাজের পদ্ধতি | DSAI",
    description: "DSAI কীভাবে AI সহায়তা, যাচাইযোগ্য ফল এবং ব্যবহারকারীর নিয়ন্ত্রণ একসঙ্গে কাজে লাগায় জানুন।",
  },
  "/platform": {
    title: "প্ল্যাটফর্ম পরিচিতি | DSAI",
    description: "DSAI-এর Work Desk, AI Hub, Creative Studio এবং সহায়ক সেবাগুলোর পরিচিতি দেখুন।",
  },
  "/ai-hub": {
    title: "AI Hub | DSAI — AI সেবা খুঁজুন",
    description: "কাজ অনুযায়ী AI সেবা খুঁজুন, বাংলা ও English-এ বিভাগ ও সেবা ফিল্টার করুন এবং কোন connector DSAI-তে চালু তা দেখুন।",
  },
  "/scholarship": {
    title: "বৃত্তি ও শিক্ষা সহায়তা | DSAI",
    description: "শিক্ষা ও বৃত্তি-সংক্রান্ত তথ্য বুঝতে, প্রস্তুতি নিতে এবং পরবর্তী পদক্ষেপ গুছিয়ে নিতে DSAI ব্যবহার করুন।",
  },
  "/capabilities": {
    title: "DSAI সক্ষমতা | কী করা যায়",
    description: "DSAI-তে বর্তমানে কী কাজ করা যায়, কোন সুবিধা কীভাবে ব্যবহার করবেন এবং কোথায় সীমা রয়েছে দেখুন।",
  },
  "/plans": {
    title: "পরিকল্পনা ও ব্যবহারসীমা | DSAI",
    description: "DSAI-এর উপলভ্য সুবিধা, বিনামূল্যের সীমা এবং ব্যবহারের শর্ত সম্পর্কে জানুন।",
  },
  "/advertising": {
    title: "বিজ্ঞাপন ও অংশীদারিত্ব | DSAI",
    description: "DSAI-তে বিজ্ঞাপন, সহযোগিতা ও অংশীদারিত্বের বিষয়ে যোগাযোগের তথ্য দেখুন।",
  },
  "/try-first": {
    title: "প্রথমে চেষ্টা করুন | DSAI",
    description: "DSAI-এর মূল সুবিধাগুলো নিরাপদে পরীক্ষা করে আপনার কাজের উপযোগিতা বুঝে নিন।",
  },
  "/evidence": {
    title: "নিরাপত্তা ও প্রমাণ | DSAI",
    description: "DSAI-এর নিরাপত্তা, যাচাই, ডেটা সুরক্ষা এবং প্রকাশিত প্রমাণ সম্পর্কে জানুন।",
  },
  "/about": {
    title: "DSAI সম্পর্কে | বাংলা-প্রথম AI প্ল্যাটফর্ম",
    description: "DSAI-এর উদ্দেশ্য, ব্যবহারযোগ্য AI সুবিধা, কাজের পদ্ধতি এবং প্রযুক্তিগত ভিত্তি সম্পর্কে জানুন।",
  },
  "/contact": {
    title: "যোগাযোগ | DSAI",
    description: "DSAI-তে যোগাযোগের জন্য info@banglarvoice24news.com ঠিকানায় লিখুন।",
  },
  "/privacy": {
    title: "গোপনীয়তা নীতি | DSAI",
    description: "DSAI কী তথ্য প্রক্রিয়া করে, কেন করে এবং আপনার তথ্যের ওপর কী নিয়ন্ত্রণ রয়েছে জানুন।",
  },
  "/governance": {
    title: "নীতিমালা ও পরিচালনা | DSAI",
    description: "DSAI-এর দায়িত্বশীল AI ব্যবহার, পরিচালনা, নিরাপত্তা এবং সেবার সীমা সম্পর্কে জানুন।",
  },
  "/changelog": {
    title: "পরিবর্তনের ইতিহাস | DSAI",
    description: "DSAI প্ল্যাটফর্মে প্রকাশিত পরিবর্তন, উন্নয়ন ও সংশোধনের ইতিহাস দেখুন।",
  },
  "/terms": {
    title: "ব্যবহারের শর্তাবলি | DSAI",
    description: "DSAI ওয়েবসাইট, Work Desk, AI Hub এবং সংশ্লিষ্ট AI সেবা ব্যবহারের নিয়ম, সীমা ও দায়িত্ব সম্পর্কে জানুন।",
  },
};

function ensureMeta(selector: string, attribute: "name" | "property", key: string) {
  let node = document.head.querySelector<HTMLMetaElement>(selector);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  return node;
}

function AdminShell() {
  return (
    <DashboardLayout>
      <AdminOverview />
    </DashboardLayout>
  );
}

function Router() {
  const [location] = useLocation();
  const rawPath = location.split("?")[0] || "/";
  const pathname = rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : "/";

  useEffect(() => {
    const metadata = PUBLIC_PAGE_METADATA[pathname];
    const isIndexable = Boolean(metadata);
    const title = metadata?.title ?? (pathname === "/404" ? "পৃষ্ঠা পাওয়া যায়নি | DSAI" : "DSAI — বাংলা-প্রথম AI Workdesk");
    const description = metadata?.description ?? "এই পৃষ্ঠাটি ব্যক্তিগত, অনুপলভ্য অথবা আর প্রকাশ্যে উপলভ্য নয়।";
    const canonicalUrl = isIndexable ? `https://dsai-hub.vercel.app${pathname === "/" ? "/" : pathname}` : null;

    document.title = title;
    ensureMeta('meta[name="description"]', "name", "description").content = description;
    ensureMeta('meta[name="robots"]', "name", "robots").content = isIndexable ? "index,follow" : "noindex,nofollow";
    ensureMeta('meta[property="og:title"]', "property", "og:title").content = title;
    ensureMeta('meta[property="og:description"]', "property", "og:description").content = description;
    ensureMeta('meta[property="og:type"]', "property", "og:type").content = "website";
    ensureMeta('meta[name="twitter:title"]', "name", "twitter:title").content = title;
    ensureMeta('meta[name="twitter:description"]', "name", "twitter:description").content = description;

    // Google site-name structured data belongs on the homepage, not every SPA route.
    const websiteSchemaId = "dsai-website-schema";
    const existingWebsiteSchema = document.getElementById(websiteSchemaId) as HTMLScriptElement | null;
    if (pathname === "/") {
      const websiteSchema = existingWebsiteSchema ?? document.createElement("script");
      websiteSchema.id = websiteSchemaId;
      websiteSchema.type = "application/ld+json";
      websiteSchema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "DSAI",
        alternateName: ["DSAI Hub", "DSAI বাংলা AI Workdesk"],
        url: "https://dsai-hub.vercel.app/",
        inLanguage: "bn-BD",
        description: "বাংলা-প্রথম AI Workdesk—তথ্য বোঝা, নথির কাজ, গবেষণা ও খসড়া তৈরিতে সহায়তা; গুরুত্বপূর্ণ সিদ্ধান্তে মানুষের নিয়ন্ত্রণ বজায় থাকে।",
      });
      if (!existingWebsiteSchema) document.head.appendChild(websiteSchema);
    } else {
      existingWebsiteSchema?.remove();
    }

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalUrl) {
      const canonicalNode = canonical ?? document.createElement("link");
      canonicalNode.rel = "canonical";
      canonicalNode.href = canonicalUrl;
      if (!canonical) document.head.appendChild(canonicalNode);
      ensureMeta('meta[property="og:url"]', "property", "og:url").content = canonicalUrl;
    } else {
      canonical?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
    }
  }, [pathname]);

  useSessionSync();
  const access = accessOf(pathname);
  const routes = (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/learn" component={Learn} />
      <Route path="/developer" component={Developer} />
      <Route path="/method" component={Method} />
      <Route path="/platform" component={Platform} />
      <Route path="/workspace" component={Workspace} />
      <Route path="/ai-hub" component={AIHub} />
      <Route path="/documents" component={Workspace} />
      <Route path="/scholarship" component={Scholarship} />
      <Route path="/auth/login" component={AuthLogin} />
      <Route path="/auth/signup" component={AuthLogin} />
      <Route path="/quality-gates" component={QualityGates} />
      <Route path="/integration-pilot/tests" component={PilotOAuthTests} />
      <Route path="/traces" component={TraceStore} />
      <Route path="/integration-pilot" component={ReadOnlyPilot} />
      <Route path="/agents" component={AgentOperations} />
      <Route path="/agents/:id" component={AgentDetail} />
      <Route path="/creative-studio" component={CreativeStudio} />
      <Route path="/capabilities" component={CapabilityMatrix} />
      <Route path="/plans" component={Plans} />
      <Route path="/advertising" component={Advertising} />
      <Route path="/try-first" component={TryFirst} />
      <Route path="/lead-composer" component={LeadComposer} />
      <Route path="/confirm/:token" component={ConfirmAcknowledgment} />
      <Route path="/evidence" component={Evidence} />
      <Route path="/terms" component={Terms} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/governance" component={Governance} />
      <Route path="/changelog" component={Changelog} />
      <Route path="/404" component={NotFound} />
      <Route path="/admin" component={AdminShell} />
      <Route path="/admin/operations"><DashboardLayout><AdminOperations /></DashboardLayout></Route>
      <Route path="/admin/connectors" component={AdminConnectors} />
      <Route path="/admin/platform" component={AdminPlatformControl} />
      <Route path="/admin/scholarship" component={AdminScholarship} />
      <Route path="/admin/changelog" component={AdminChangelog} />
      <Route path="/admin/deletion-requests" component={AdminDeletionRequests} />
      <Route path="/admin/search-analytics" component={AdminSearchAnalytics} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/gate-evidence" component={AdminGateEvidence} />
      <Route component={NotFound} />
    </Switch>
  );
  return access === "public" ? routes : <RequireAuth access={access}>{routes}</RequireAuth>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <Suspense fallback={<div className="route-loading" role="status" aria-live="polite">লোড হচ্ছে…</div>}><Router /></Suspense>
          <KnowledgeHelp />
          <NetworkStatus />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
