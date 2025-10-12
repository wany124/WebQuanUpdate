import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import ResearchPage from "@/pages/research-page";
import ResearchDetailPage from "@/pages/research-detail-page";
import TeachingPage from "@/pages/teaching-page";
import StudentsPage from "@/pages/students-page";
import AuthPage from "@/pages/auth-page";
import EditorPage from "@/pages/editor-page";
import EditorPersonalPage from "@/pages/editor-personal-page";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={HomePage} />
      <Route path="/research" component={ResearchPage} />
      <Route path="/research/:id" component={ResearchDetailPage} />
      <Route path="/teaching" component={TeachingPage} />
      <Route path="/students" component={StudentsPage} />
      
      {/* Auth */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Editor Pages */}
      <ProtectedRoute path="/editor" component={EditorPage} />
      <ProtectedRoute path="/editor/personal" component={EditorPersonalPage} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
