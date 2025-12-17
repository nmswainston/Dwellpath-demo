import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calculator, Receipt, Shield, BarChart3, FileText, Smartphone, Users, Building2 } from "lucide-react";
import { DwellpathLogo } from "@/components/branding/dwellpath-logo";
import { DEV_MODE } from "@/dev";

export default function Landing() {
  return (
    <div className="min-h-screen"
         style={{ 
           background: 'linear-gradient(135deg, hsl(220 26% 14%) 0%, hsl(215 25% 27%) 35%, hsl(210 40% 98%) 100%)'
         }}>
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <DwellpathLogo variant="default" size="lg" />
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12">
        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          <h1 className="font-heading text-3xl md:text-5xl font-light mb-3" style={{ color: 'hsl(210 40% 98%)' }}>
            Track. Prove. Protect.
          </h1>
          
          <h2 className="text-xl md:text-2xl font-medium mb-4" style={{ color: 'hsl(214 32% 91%)' }}>
            Precision residency tracking for modern wealth
          </h2>
          
          <p className="text-base mb-6 max-w-2xl mx-auto leading-relaxed" style={{ color: 'hsl(213 27% 84%)' }}>
            Stay mobile. Stay compliant. Dwellpath provides elite individuals with audit-ready documentation and professional-grade residency tracking to protect your wealth from high-tax jurisdictions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              onClick={() => {
                // Force full page navigation to bypass client router
                if (!DEV_MODE) {
                  window.location.assign('/api/login');
                }
              }}
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="backdrop-blur-sm"
              onClick={() => {
                // Force full page navigation to bypass client router
                if (!DEV_MODE) {
                  window.location.assign('/api/login');
                }
              }}
            >
              Schedule Consultation
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-brand-bg-dark/90 backdrop-blur-sm border border-border/30 shadow-xl animate-fade-in">
            <CardHeader className="pb-3">
              <Calculator className="h-7 w-7 mb-1" style={{ color: 'hsl(200 100% 80%)' }} />
              <CardTitle className="text-base" style={{ color: 'hsl(210 40% 98%)' }}>183-Day Rule Protection</CardTitle>
              <CardDescription className="text-sm" style={{ color: 'hsl(213 27% 84%)' }}>
                Advanced monitoring for NY, CA, and other high-tax states with real-time alerts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-brand-bg-dark/90 backdrop-blur-sm border border-border/30 shadow-xl animate-fade-in">
            <CardHeader className="pb-3">
              <Smartphone className="h-7 w-7 mb-1" style={{ color: 'hsl(200 100% 80%)' }} />
              <CardTitle className="text-base" style={{ color: 'hsl(210 40% 98%)' }}>Auto Location Tracking</CardTitle>
              <CardDescription className="text-sm" style={{ color: 'hsl(213 27% 84%)' }}>
                GPS-based automatic day logging creates an unbreakable audit trail
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-brand-bg-dark/90 backdrop-blur-sm border border-border/30 shadow-xl animate-fade-in">
            <CardHeader className="pb-3">
              <Shield className="h-7 w-7 mb-1" style={{ color: 'hsl(200 100% 80%)' }} />
              <CardTitle className="text-base" style={{ color: 'hsl(210 40% 98%)' }}>Audit Defense Suite</CardTitle>
              <CardDescription className="text-sm" style={{ color: 'hsl(213 27% 84%)' }}>
                Professional documentation, CPA-ready reports, and legal compliance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-brand-bg-dark/90 backdrop-blur-sm border border-border/30 shadow-xl animate-fade-in">
            <CardHeader className="pb-3">
              <Building2 className="h-7 w-7 mb-1" style={{ color: 'hsl(200 100% 80%)' }} />
              <CardTitle className="text-base" style={{ color: 'hsl(210 40% 98%)' }}>Property & Asset Tracking</CardTitle>
              <CardDescription className="text-sm" style={{ color: 'hsl(213 27% 84%)' }}>
                Monitor multiple residences and ties that affect tax residency status
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-brand-bg-dark/90 backdrop-blur-sm border border-border/30 shadow-xl animate-fade-in">
            <CardHeader className="pb-3">
              <Users className="h-7 w-7 mb-1" style={{ color: 'hsl(200 100% 80%)' }} />
              <CardTitle className="text-base" style={{ color: 'hsl(210 40% 98%)' }}>Premium Concierge</CardTitle>
              <CardDescription className="text-sm" style={{ color: 'hsl(213 27% 84%)' }}>
                White-glove service with tax professionals and compliance consulting
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-brand-bg-dark/90 backdrop-blur-sm border border-border/30 shadow-xl animate-fade-in">
            <CardHeader className="pb-3">
              <BarChart3 className="h-7 w-7 mb-1" style={{ color: 'hsl(200 100% 80%)' }} />
              <CardTitle className="text-base" style={{ color: 'hsl(210 40% 98%)' }}>Tax Optimization AI</CardTitle>
              <CardDescription className="text-sm" style={{ color: 'hsl(213 27% 84%)' }}>
                AI-powered strategies to maximize savings while maintaining compliance
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
    </div>
  );
}
