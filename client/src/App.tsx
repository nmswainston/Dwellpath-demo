import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/hooks/useSidebar";
import { PreferencesProvider } from "@/features/preferences/providers/PreferencesProvider";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import { OnboardingTour } from "@/features/onboarding/components/OnboardingTour";
import { UserProfileSetup } from "@/features/onboarding/components/UserProfileSetup";
import { FloatingActions } from "@/components/layout/FloatingActions";
import DemoBanner from "@/components/shared/DemoBanner";
import { useEffect, type ReactNode } from "react";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import LogDays from "@/pages/log-days";
import Expenses from "@/pages/expenses";
import Journal from "@/pages/journal";
import AIAssistant from "@/pages/ai-assistant";
import Export from "@/pages/export";
import AuditPrep from "@/pages/audit-prep";
import Scorecard from "@/pages/scorecard";
import Properties from "@/pages/properties";
import Premium from "@/pages/premium";
import Settings from "@/pages/settings";
import BrandStyle from "@/pages/brand-style";
import BrandGuide from "@/components/shared/BrandGuide";

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) return;
    const returnTo = encodeURIComponent(location);
    setLocation(`/?returnTo=${returnTo}`);
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

function Router() {
  const {
    isOnboardingOpen,
    isProfileSetupOpen,
    existingTour,
    completeProfileSetup,
    closeOnboarding,
    setIsProfileSetupOpen,
  } = useOnboarding();

  const { isAuthenticated } = useAuth();

  return (
    <>
      <Switch>
        {/* Public entry point */}
        <Route path="/" component={Landing} />
        {/* Back-compat / explicit marketing path */}
        <Route path="/landing" component={Landing} />

        {/* Protected app routes (explicit entry via login/demo CTA -> /dashboard) */}
        <Route path="/dashboard">
          {() => (
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          )}
        </Route>
        <Route path="/log-days">
          {() => (
            <RequireAuth>
              <LogDays />
            </RequireAuth>
          )}
        </Route>
        <Route path="/expenses">
          {() => (
            <RequireAuth>
              <Expenses />
            </RequireAuth>
          )}
        </Route>
        <Route path="/journal">
          {() => (
            <RequireAuth>
              <Journal />
            </RequireAuth>
          )}
        </Route>
        <Route path="/ai-assistant">
          {() => (
            <RequireAuth>
              <AIAssistant />
            </RequireAuth>
          )}
        </Route>
        <Route path="/export">
          {() => (
            <RequireAuth>
              <Export />
            </RequireAuth>
          )}
        </Route>
        <Route path="/audit-prep">
          {() => (
            <RequireAuth>
              <AuditPrep />
            </RequireAuth>
          )}
        </Route>
        <Route path="/scorecard">
          {() => (
            <RequireAuth>
              <Scorecard />
            </RequireAuth>
          )}
        </Route>
        <Route path="/properties">
          {() => (
            <RequireAuth>
              <Properties />
            </RequireAuth>
          )}
        </Route>
        <Route path="/premium">
          {() => (
            <RequireAuth>
              <Premium />
            </RequireAuth>
          )}
        </Route>
        <Route path="/settings">
          {() => (
            <RequireAuth>
              <Settings />
            </RequireAuth>
          )}
        </Route>
        <Route path="/brand-style">
          {() => (
            <RequireAuth>
              <BrandStyle />
            </RequireAuth>
          )}
        </Route>
        <Route path="/brand-guide">
          {() => (
            <RequireAuth>
              <BrandGuide />
            </RequireAuth>
          )}
        </Route>
        {/* Dev-only routes */}
        {import.meta.env.DEV && (
          <Route path="/style-guide">
            {() => (
              <RequireAuth>
                <BrandGuide />
              </RequireAuth>
            )}
          </Route>
        )}
        <Route component={NotFound} />
      </Switch>

      {/* Onboarding Components */}
      {isAuthenticated && (
        <>
          {isProfileSetupOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-backdrop">
              <UserProfileSetup
                onComplete={completeProfileSetup}
                onBack={() => setIsProfileSetupOpen(false)}
              />
            </div>
          )}
          
          <OnboardingTour
            isOpen={isOnboardingOpen}
            onClose={closeOnboarding}
            userProfile={existingTour?.userProfile}
          />

          {/* Floating bottom-right actions (intentionally stacked) */}
          <FloatingActions />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark">
            <TooltipProvider>
              <Router />
              <Toaster />
              <DemoBanner />
            </TooltipProvider>
          </div>
        </SidebarProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

export default App;
