/*
 * Civic Signal design reminder: public-facing editorial narrative, anchor navigation,
 * no dead-end routes, and a light parchment default theme.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import KnowledgeHelp from "./components/KnowledgeHelp";
import NetworkStatus from "./components/NetworkStatus";

const AdminConnectors = lazy(() => import("@/pages/AdminConnectors"));
const Learn = lazy(() => import("@/pages/Learn"));
const Developer = lazy(() => import("@/pages/Developer"));
const Method = lazy(() => import("@/pages/Method"));
const Workspace = lazy(() => import("@/pages/Workspace"));
const AlphaDashboard = lazy(() => import("@/pages/AlphaDashboard"));
const ProfileSettings = lazy(() => import("@/pages/ProfileSettings"));
const Evidence = lazy(() => import("@/pages/Evidence"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Changelog = lazy(() => import("@/pages/Changelog"));
const AdminChangelog = lazy(() => import("@/pages/AdminChangelog"));
const AdminDeletionRequests = lazy(() => import("@/pages/AdminDeletionRequests"));
const AdminSearchAnalytics = lazy(() => import("@/pages/AdminSearchAnalytics"));
const Platform = lazy(() => import("@/pages/Platform"));
const AdminPlatformControl = lazy(() => import("@/pages/AdminPlatformControl"));
const AdminScholarship = lazy(() => import("@/pages/AdminScholarship"));
const AuthLogin = lazy(() => import("@/pages/AuthLogin"));
const Scholarship = lazy(() => import("@/pages/Scholarship"));
const MobileApp = lazy(() => import("@/pages/MobileApp"));
const IntegrationApprovalPrototype = lazy(() => import("@/pages/IntegrationApprovalPrototype"));
const DepartmentCompliance = lazy(() => import("@/pages/DepartmentCompliance"));

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
      <Route path="/alpha" component={AlphaDashboard} />
      <Route path="/profile" component={ProfileSettings} />
      <Route path="/scholarship" component={Scholarship} />
      <Route path="/app" component={MobileApp} />
      <Route path="/integration-prototype" component={IntegrationApprovalPrototype} />
      <Route path="/compliance" component={DepartmentCompliance} />
      <Route path="/auth/login" component={AuthLogin} />
      <Route path="/evidence" component={Evidence} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/changelog" component={Changelog} />
      <Route path="/404" component={NotFound} />
      <Route path="/admin/connectors" component={AdminConnectors} />
      <Route path="/admin/platform" component={AdminPlatformControl} />
      <Route path="/admin/scholarship" component={AdminScholarship} />
      <Route path="/admin/changelog" component={AdminChangelog} />
      <Route path="/admin/deletion-requests" component={AdminDeletionRequests} />
      <Route path="/admin/search-analytics" component={AdminSearchAnalytics} />
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
