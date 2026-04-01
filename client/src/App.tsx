import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSidebar from "@/components/app-sidebar";
import DashboardPage from "@/pages/dashboard";
import ProjectsPage from "@/pages/projects";
import RecordingsPage from "@/pages/recordings";
import TranscriptsPage from "@/pages/transcripts";
import AnalysisPage from "@/pages/analysis";
import GuidesPage from "@/pages/guides";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/recordings" component={RecordingsPage} />
      <Route path="/transcripts" component={TranscriptsPage} />
      <Route path="/analysis" component={AnalysisPage} />
      <Route path="/guides" component={GuidesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <div className="flex h-screen overflow-hidden">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto p-6">
              <AppRouter />
            </main>
          </div>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
