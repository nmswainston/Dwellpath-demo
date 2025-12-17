import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleUnauthorized } from "@/utils/handleUnauthorized";
import AppLayout from "@/components/layout/app-layout";
import StatsGrid from "@/components/dashboard/stats-grid";
import ResidencyTracker from "@/components/dashboard/residency-tracker";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickStats from "@/components/dashboard/quick-stats";
import NotificationsPanel from "@/components/dashboard/notifications-panel";
import AIChat from "@/components/dashboard/ai-chat";
import AlertBanner from "@/components/dashboard/alert-banner";
import OnboardingModal from "@/components/onboarding/onboarding-modal";
import { StaggeredPageContent } from "@/components/layout/page-transition";

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
          <div>
            <div className="mb-6">
              <h2 className="font-heading text-2xl text-brand-primary dark:text-foreground">Overview</h2>
              <p className="font-body text-muted-foreground dark:text-muted-foreground">Your residency status at a glance</p>
            </div>
            <StatsGrid />
          </div>
        
          {/* Main Content - Four Window Layout */}
          <div>
            <div className="mb-6">
              <h2 className="font-heading text-2xl text-brand-primary dark:text-foreground">Dashboard</h2>
              <p className="font-body text-muted-foreground dark:text-muted-foreground">Track your residency, activity, and compliance status</p>
            </div>
            <div className="card-grid card-grid-4 lg:grid-cols-2 xl:grid-cols-4">
              <ResidencyTracker />
              <RecentActivity />
              <QuickStats />
              <NotificationsPanel />
            </div>
          </div>
          
          {/* AI Chat - Full Width Below */}
          <AIChat />
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