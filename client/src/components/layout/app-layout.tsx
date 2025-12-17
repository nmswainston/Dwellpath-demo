import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";
import Sidebar from "./sidebar";
import Header from "./header";
import FeedbackWidget from "@/components/feedback/feedback-widget";
import Footer from "@/components/Footer";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { isCollapsed } = useSidebar();
  const [location] = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location]);
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main content area - fixed to collapsed sidebar position */}
      <div className="fixed inset-y-0 left-16 right-0 flex flex-col">
        <Header title={title} subtitle={subtitle || ""} />
        
        <main className="flex-1 p-3 lg:p-5 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-4">
            {children}
            <Footer />
          </div>
        </main>
      </div>
      
      {/* Feedback Widget - appears on all pages */}
      <FeedbackWidget />
    </div>
  );
}