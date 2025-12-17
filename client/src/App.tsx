import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/hooks/useSidebar";
import { PreferencesProvider } from "@/components/preferences/preferences-provider";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { UserProfileSetup } from "@/components/onboarding/UserProfileSetup";
import { OnboardingWidget } from "@/components/onboarding/OnboardingWidget";
import DemoBanner from "@/components/DemoBanner";

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
import BrandGuide from "@/components/BrandGuide";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const {
    isOnboardingOpen,
    isProfileSetupOpen,
    existingTour,
    completeProfileSetup,
    closeOnboarding,
    setIsOnboardingOpen,
    setIsProfileSetupOpen,
  } = useOnboarding();

  return (
    <>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/log-days" component={LogDays} />
            <Route path="/expenses" component={Expenses} />
            <Route path="/journal" component={Journal} />
            <Route path="/ai-assistant" component={AIAssistant} />
            <Route path="/export" component={Export} />
            <Route path="/audit-prep" component={AuditPrep} />
            <Route path="/scorecard" component={Scorecard} />
            <Route path="/properties" component={Properties} />
            <Route path="/premium" component={Premium} />
            <Route path="/settings" component={Settings} />
            <Route path="/brand-style" component={BrandStyle} />
            {/* Dev-only routes */}
            {import.meta.env.DEV && (
              <Route path="/style-guide" component={BrandGuide} />
            )}
            <Route path="/brand-guide" component={BrandGuide} />
          </>
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
          
          {/* Floating onboarding widget */}
          <OnboardingWidget />
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
