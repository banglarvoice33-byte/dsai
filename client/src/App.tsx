/*
 * Civic Signal design reminder: public-facing editorial narrative, anchor navigation,
 * no dead-end routes, and a light parchment default theme.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminConnectors from "@/pages/AdminConnectors";
import Learn from "@/pages/Learn";
import Evidence from "@/pages/Evidence";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/learn" component={Learn} />
      <Route path="/evidence" component={Evidence} />
      <Route path="/404" component={NotFound} />
      <Route path="/admin/connectors" component={AdminConnectors} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
