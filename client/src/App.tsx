import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import CoursePage from "@/pages/CoursePage";
import TopicPage from "@/pages/TopicPage";
import SearchPage from "@/pages/SearchPage";
import ProfilePage from "@/pages/ProfilePage";
import AuthPage from "@/pages/AuthPage";
import AiExplainPage from "@/pages/AiExplainPage";
import AchievementsPage from "@/pages/AchievementsPage";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/lib/auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/course/:id" component={CoursePage} />
      <Route path="/topic/:id" component={TopicPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/ai-explain/:topicId" component={AiExplainPage} />
      <Route path="/achievements" component={AchievementsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch by rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Router />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
