import { ReactNode, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "@/components/shared/Footer";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [location] = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to top when route changes
  useEffect(() => {
    // Our main scroll is on the fixed/overflow container (not window).
    // Scroll that container to the top on navigation.
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    // Fallback for any pages that scroll the window instead.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main content area - fixed to collapsed sidebar position */}
      <div
        ref={scrollContainerRef}
        className="fixed inset-y-0 left-16 right-0 min-h-screen flex flex-col overflow-y-auto"
      >
        <Header title={title} subtitle={subtitle || ""} />
        
        <main className="flex-1 p-3 lg:p-5">
          <div className="max-w-6xl mx-auto space-y-4">
            {children}
          </div>
        </main>

        <Footer className="mt-auto" />
      </div>
      
      {/* Feedback Widget - appears on all pages */}
    </div>
  );
}