/*
 * Civic Signal design reminder: public-facing editorial narrative, anchor navigation,
 * no dead-end routes, and a light parchment default theme.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense, type ReactNode } from "react";
import { Redirect, Route, Switch } from "wouter";
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

function AdminShell() {
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
      <Route path="/privacy" component={Privacy} />
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
