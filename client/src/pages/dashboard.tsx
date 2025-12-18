import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleUnauthorized } from "@/lib/handleUnauthorized";
import AppLayout from "@/components/layout/AppLayout";
import StatsGrid from "@/features/dashboard/components/StatsGrid";
import ResidencyTracker from "@/features/dashboard/components/ResidencyTracker";
import RecentActivity from "@/features/dashboard/components/RecentActivity";
import QuickStats from "@/features/dashboard/components/QuickStats";
import NotificationsPanel from "@/features/dashboard/components/NotificationsPanel";
import AIChat from "@/features/dashboard/components/AIChat";
import AlertBanner from "@/features/dashboard/components/AlertBanner";
import OnboardingModal from "@/features/onboarding/components/OnboardingModal";
import { StaggeredPageContent } from "@/components/layout/PageTransition";

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      handleUnauthorized(toast);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
        <div className="text-center bg-card dark:bg-card p-8 max-w-md animate-fade-in rounded-xl shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-primary dark:bg-accent flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-foreground/30 border-t-foreground"></div>
          </div>
          <h3 className="font-heading text-xl font-light text-brand-primary dark:text-foreground mb-2">Loading Dwellpath</h3>
          <p className="font-body text-muted-foreground dark:text-muted-foreground">Preparing your residency dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppLayout 
        title="Dashboard" 
        subtitle="Monitor your residency status and compliance"
      >
        <StaggeredPageContent>
          {/* Alert Banner */}
          <AlertBanner />
          
          {/* Top Stats Overview */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-heading text-2xl text-brand-primary dark:text-foreground">Overview</h2>
              <p className="font-body text-muted-foreground dark:text-muted-foreground">Your residency status at a glance</p>
            </div>
            <StatsGrid />
          </section>
        
          {/* Main Content - Two Column Layout */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-heading text-2xl text-brand-primary dark:text-foreground">Dashboard</h2>
              <p className="font-body text-muted-foreground dark:text-muted-foreground">Track your residency, activity, and compliance status</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                <ResidencyTracker />
                <RecentActivity />
              </div>
              {/* Right Column */}
              <div className="flex flex-col gap-6">
                <QuickStats />
                <NotificationsPanel />
              </div>
            </div>
          </section>
          
          {/* AI Chat - Full Width Below */}
          <section>
            <AIChat />
          </section>
        </StaggeredPageContent>
      </AppLayout>
      
      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
      />
    </>
  );
}