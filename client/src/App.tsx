/*
 * Civic Signal design reminder: public-facing editorial narrative, anchor navigation,
 * no dead-end routes, and a light parchment default theme.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import KnowledgeHelp from "./components/KnowledgeHelp";
import NetworkStatus from "./components/NetworkStatus";
import DashboardLayout from "./components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";

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
const Terms = lazy(() => import("@/pages/Terms"));
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
const ConfirmAcknowledgment = lazy(() => import("@/pages/ConfirmAcknowledgment"));\nconst Terms = lazy(() => import("@/pages/Terms"));

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
    title: "ডেভেলপার নির্দেশনা | DSAI",
    description: "DSAI-এর API, সংযোগ, নিরাপত্তা ও ডেভেলপার ব্যবহারের নির্দেশনা দেখুন।",
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
    title: "AI Hub — AI সেবা ও সংযোগ | DSAI",
    description: "AI Hub-এ নিজস্ব API সংযোগ এবং বাহ্যিক AI সেবার তালিকা, ব্যবহার ও সংযোগের অবস্থা দেখুন।",
  },
  "/scholarship": {
    title: "বৃত্তি ও শিক্ষা সহায়তা | DSAI",
    description: "শিক্ষা ও বৃত্তি-সংক্রান্ত তথ্য বুঝতে, প্রস্তুতি নিতে এবং পরবর্তী পদক্ষেপ গুছিয়ে নিতে DSAI ব্যবহার করুন।",
  },
  "/creative-studio": {
    title: "Creative Studio — AI ছবি তৈরি | DSAI",
    description: "বাংলা বা ইংরেজি নির্দেশনা দিয়ে DSAI Creative Studio-তে AI-সহায়ক ছবি তৈরি করুন।",
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
  "/lead-composer": {
    title: "Lead Composer | DSAI",
    description: "ব্যবসায়িক যোগাযোগ ও lead follow-up-এর জন্য AI-সহায়ক খসড়া তৈরি করুন।",
  },
  "/evidence": {
    title: "নিরাপত্তা ও প্রমাণ | DSAI",
    description: "DSAI-এর নিরাপত্তা, যাচাই, ডেটা সুরক্ষা এবং প্রকাশিত প্রমাণ সম্পর্কে জানুন।",
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

function ensureMeta(selector: string, property: "name" | "property", key: string) {
  let node = document.head.querySelector<HTMLMetaElement>(selector);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(property, key);
    document.head.appendChild(node);
  }
  return node;
}

function Router() {
  const [location] = useLocation();
  const pathname = location.split("?")[0] || "/";

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

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
      ensureMeta('meta[property="og:url"]', "property", "og:url").content = canonicalUrl;
    } else {
      canonical?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
    }
  }, [pathname]);

  // Keep route metadata in one place so every public route gets a unique canonical.
  return (
    <Switch>
  return (
    <DashboardLayout>
      <AdminOverview />
    </DashboardLayout>
  );
}

function AdminOnly({ children }: { children: ReactNode }) {
 const { user, loading } = useAuth();
 if (loading) return <main className="min-h-screen grid place-items-center bg-[#f4f1e9] text-[#18241f]" role="status">লোড হচ্ছে…</main>;
 if (!user) return <Redirect to="/auth/login" />;
 if (user.role !== "admin") return <Redirect to="/workspace" />;
 return <>{children}</>;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
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
      <Route path="/integration-pilot/tests"><AdminOnly><PilotOAuthTests /></AdminOnly></Route>
      <Route path="/traces"><AdminOnly><TraceStore /></AdminOnly></Route>
      <Route path="/integration-pilot"><AdminOnly><ReadOnlyPilot /></AdminOnly></Route>
      <Route path="/agents"><AdminOnly><AgentOperations /></AdminOnly></Route>
      <Route path="/agents/:id"><AdminOnly><AgentDetail /></AdminOnly></Route>
      <Route path="/creative-studio" component={CreativeStudio} />
      <Route path="/capabilities" component={CapabilityMatrix} />
      <Route path="/plans" component={Plans} />
      <Route path="/advertising" component={Advertising} />
      <Route path="/try-first" component={TryFirst} />
      <Route path="/lead-composer" component={LeadComposer} />
      <Route path="/confirm/:token" component={ConfirmAcknowledgment} />
      <Route path="/evidence" component={Evidence} />
      <Route path="/terms" component={Terms} />\n      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/governance" component={Governance} />
      <Route path="/changelog" component={Changelog} />
      <Route path="/404" component={NotFound} />
      <Route path="/admin" component={AdminShell} />
      <Route path="/admin/operations"><AdminOnly><DashboardLayout><AdminOperations /></DashboardLayout></AdminOnly></Route>
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
