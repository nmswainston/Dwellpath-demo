import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Building2,
  Calculator,
  Shield,
  Smartphone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { DwellpathLogo } from "@/components/branding/DwellpathLogo";
import { DEV_MODE } from "@/lib/config/dev";
import Footer from "@/components/shared/Footer";
import { startDemoSession } from "@/lib/demoSession";
import { ConsultationContactModal } from "@/components/shared/ConsultationContactModal";

type Feature = {
  title: string;
  description: string;
  Icon: LucideIcon;
  badge?: string;
};

const styles = {
  featureGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  featureCard: "bg-brand-bg-dark/90 backdrop-blur-sm border border-border/30 shadow-xl animate-fade-in",
  featureCardHeader: "pb-3",
  featureIcon: "h-7 w-7 mb-1 landing-feature-icon",
  featureTitle: "text-base landing-feature-title",
  featureDesc: "text-sm landing-feature-desc",
} as const;

const FEATURES: Feature[] = [
  {
    title: "183-Day Rule Protection",
    description: "Advanced monitoring for NY, CA, and other high-tax states with real-time alerts",
    Icon: Calculator,
  },
  {
    title: "Auto Location Tracking",
    description: "GPS-based automatic day logging creates an unbreakable audit trail",
    Icon: Smartphone,
  },
  {
    title: "Audit Defense Suite",
    description: "Professional documentation, CPA-ready reports, and legal compliance",
    Icon: Shield,
  },
  {
    title: "Property & Asset Tracking",
    description: "Monitor multiple residences and ties that affect tax residency status",
    Icon: Building2,
  },
  {
    title: "Premium Concierge",
    description: "White-glove service with tax professionals and compliance consulting",
    Icon: Users,
  },
  {
    title: "Tax Optimization AI",
    description: "AI-powered strategies to maximize savings while maintaining compliance",
    Icon: BarChart3,
  },
];

function FeatureCard({ title, description, Icon, badge }: Feature) {
  return (
    <Card className={styles.featureCard}>
      <CardHeader className={styles.featureCardHeader}>
        <Icon className={styles.featureIcon} aria-hidden="true" />
        {badge ? <div className="landing-feature-title text-xs font-medium">{badge}</div> : null}
        <CardTitle className={styles.featureTitle}>{title}</CardTitle>
        <CardDescription className={styles.featureDesc}>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function Landing() {
  const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
  const [consultationOpen, setConsultationOpen] = React.useState(false);
  const returnTo = (() => {
    try {
      const value = new URLSearchParams(window.location.search).get("returnTo");
      if (!value) return "/dashboard";
      if (!value.startsWith("/")) return "/dashboard";
      if (value.startsWith("//")) return "/dashboard";
      return value;
    } catch {
      return "/dashboard";
    }
  })();

  return (
    <div className="min-h-screen landing-gradient flex flex-col">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <DwellpathLogo variant="default" size="lg" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 pb-12">
        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          <h1 className="font-heading text-3xl md:text-5xl font-light mb-3 landing-title">
            Track. Prove. Protect.
          </h1>
          
          <h2 className="text-xl md:text-2xl font-medium mb-4 landing-subtitle">
            Precision residency tracking for modern wealth
          </h2>
          
          <p className="text-base mb-6 max-w-2xl mx-auto leading-relaxed landing-copy">
            Stay mobile. Stay compliant. Dwellpath provides elite individuals with audit-ready documentation and professional-grade residency tracking to protect your wealth from high-tax jurisdictions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              className={[
                // Hero primary CTA: calm, composed, premium (muted navy + cream).
                "h-11 px-7 text-[15px] font-medium tracking-[0.02em]",
                "bg-brand-navy text-brand-cream border border-brand-cream/10 shadow-none",
                // Subtle tonal shift on hover (no hue jump / no glow).
                "hover:bg-brand-navy/95 hover:text-brand-cream",
                "focus-visible:ring-brand-cream/30",
              ].join(" ")}
              onClick={() => {
                if (DEMO_MODE) {
                  // Explicit demo entry: only after a user click.
                  startDemoSession();
                  window.location.assign(returnTo);
                  return;
                }
                if (DEV_MODE) {
                  window.location.assign(returnTo);
                  return;
                }
                if (!DEV_MODE) {
                  window.location.assign(`/api/login?returnTo=${encodeURIComponent(returnTo)}`);
                }
              }}
            >
              {DEMO_MODE ? "View Demo" : "Start Free Trial"}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className={[
                // Hero secondary CTA: low-contrast outline, does not compete with primary.
                "h-11 px-7 text-[15px] font-medium tracking-[0.02em]",
                "bg-transparent text-brand-cream/85 border-brand-cream/25 shadow-none",
                // Subtle tint on hover (still restrained).
                "hover:bg-brand-cream/5 hover:border-brand-cream/30 hover:text-brand-cream/90",
                "focus-visible:ring-brand-cream/30",
              ].join(" ")}
              onClick={() => setConsultationOpen(true)}
            >
              Schedule Consultation
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </section>
      </main>
      <Footer />

      <ConsultationContactModal open={consultationOpen} onOpenChange={setConsultationOpen} />
    </div>
  );
}
