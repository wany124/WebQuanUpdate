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
import EditorCarouselPage from "@/pages/editor-carousel-page";
import EditorResearchPage from "@/pages/editor-research-page";
import EditorTeachingPage from "@/pages/editor-teaching-page";
import EditorStudentsPage from "@/pages/editor-students-page";
import EditorEventsPage from "@/pages/editor-events-page";
import EditorExperiencePage from "@/pages/editor-experience-page";

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
      <Route path="/login" component={AuthPage} />
      
      {/* Protected Editor Pages */}
      <ProtectedRoute path="/editor" component={EditorPage} />
      <ProtectedRoute path="/editor/personal" component={EditorPersonalPage} />
      <ProtectedRoute path="/editor/carousel" component={EditorCarouselPage} />
      <ProtectedRoute path="/editor/events" component={EditorEventsPage} />
      <ProtectedRoute path="/editor/experience" component={EditorExperiencePage} />
      <ProtectedRoute path="/editor/research" component={EditorResearchPage} />
      <ProtectedRoute path="/editor/teaching" component={EditorTeachingPage} />
      <ProtectedRoute path="/editor/students" component={EditorStudentsPage} />
      
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
