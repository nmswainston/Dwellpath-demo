import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Users, Zap, CheckCircle, ArrowRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { StaggeredPageContent } from "@/components/layout/PageTransition";
import { ConsultationContactModal } from "@/components/shared/ConsultationContactModal";

export default function Premium() {
  const [consultationOpen, setConsultationOpen] = React.useState(false);
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Basic residency tracking for personal use",
      features: [
        "Manual day logging",
        "183-day monitoring",
        "Basic alerts",
        "State residency tracking",
        "Export to PDF"
      ],
      current: true,
      badge: null,
      buttonText: "Current Plan",
      buttonVariant: "outline" as const
    },
    {
      name: "Premium",
      price: "$49",
      period: "per month",
      description: "Advanced features for high-net-worth individuals",
      features: [
        "Auto GPS location tracking",
        "Property & asset management",
        "Advanced tax optimization AI",
        "CPA-ready audit reports",
        "Sticky ties tracking",
        "Priority support",
        "Custom alerts & notifications"
      ],
      current: false,
      badge: "Most Popular",
      buttonText: "Upgrade to Premium",
      buttonVariant: "default" as const
    },
    {
      name: "Concierge",
      price: "$199",
      period: "per month",
      description: "White-glove service with dedicated tax professionals",
      features: [
        "Everything in Premium",
        "Dedicated tax professional",
        "Monthly compliance reviews",
        "Custom audit preparation",
        "Direct CPA consultations",
        "24/7 priority support",
        "Custom integration setup",
        "Quarterly strategy sessions"
      ],
      current: false,
      badge: "Elite",
      buttonText: "Get Concierge Service",
      buttonVariant: "default" as const
    }
  ];

  return (
    <AppLayout 
      title="Premium Plans" 
      subtitle="Protect your wealth with professional-grade tax residency tracking"
    >
      <div className="page-container">
        <StaggeredPageContent>
          {/* Hero Section */}
          <div className="text-center mb-12 font-body">
            <h2 className="font-heading text-4xl font-light text-brand-primary dark:text-foreground mb-4">
              Elite Tax Protection Plans
            </h2>
            <p className="text-xl text-muted-foreground dark:text-muted-foreground max-w-3xl mx-auto">
              Professional-grade residency tracking for sophisticated wealth management
            </p>
          </div>
          <div className="section-spacing text-center">
            <div className="header-spacing">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-brand-text-light dark:text-brand-text-dark mb-4">
                Upgrade Your Tax Protection
              </h1>
              <p className="text-xl text-brand-text-light/70 dark:text-brand-text-dark/70 max-w-2xl mx-auto">
                Advanced features designed for high-net-worth individuals who need comprehensive 
                compliance tracking and professional support.
              </p>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="section-spacing">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card key={plan.name} className={`relative ${index === 1 ? 'border-2 border-primary shadow-lg scale-105' : ''}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold break-words">{plan.name}</CardTitle>
                    <div className="mt-4 flex items-baseline justify-center gap-1 flex-wrap">
                      <span className="text-4xl font-bold text-brand-text-light dark:text-brand-text-dark">{plan.price}</span>
                      <span className="text-brand-text-light/70 dark:text-brand-text-dark/70">/{plan.period}</span>
                    </div>
                    <CardDescription className="mt-2 min-h-[48px] break-words">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                          <span className="text-brand-text-light dark:text-brand-text-dark min-w-0 break-words">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      variant={plan.buttonVariant}
                      className="w-full"
                      disabled={plan.current}
                      size="lg"
                    >
                      {plan.buttonText}
                      {!plan.current && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="section-spacing">
            <div className="header-spacing text-center">
              <h2 className="text-3xl font-bold text-brand-text-light dark:text-brand-text-dark mb-4">
                Why Upgrade to Premium?
              </h2>
              <p className="text-xl text-brand-text-light/70 dark:text-brand-text-dark/70 max-w-2xl mx-auto">
                Get the advanced tools and professional support you need to protect your wealth
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-muted-foreground mb-2 flex-shrink-0" />
                  <CardTitle className="text-lg break-words">Auto Tracking</CardTitle>
                  <CardDescription className="break-words">
                    GPS-based location tracking creates an unbreakable audit trail
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-muted-foreground mb-2 flex-shrink-0" />
                  <CardTitle className="text-lg break-words">Audit Defense</CardTitle>
                  <CardDescription className="break-words">
                    Professional documentation and CPA-ready reports for tax audits
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-brand-primary mb-2 flex-shrink-0" />
                  <CardTitle className="text-lg break-words">Expert Support</CardTitle>
                  <CardDescription className="break-words">
                    Direct access to tax professionals and compliance experts
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <Crown className="h-10 w-10 text-muted-foreground mb-2 flex-shrink-0" />
                  <CardTitle className="text-lg break-words">Wealth Focus</CardTitle>
                  <CardDescription className="break-words">
                    Advanced features designed specifically for high-net-worth individuals
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="section-spacing">
            <Card className="bg-[hsl(var(--brand-sand-muted))] border-border">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-brand-text-light dark:text-brand-text-dark mb-4">
                  Ready to Protect Your Wealth?
                </h3>
                <p className="text-lg text-brand-text-light/70 dark:text-brand-text-dark/70 mb-6 max-w-2xl mx-auto">
                  Join thousands of high-net-worth individuals who trust TaxGuard Pro 
                  to keep them compliant and audit-ready.
                </p>
                <div className="space-x-4">
                  <Button size="lg">
                    Start Premium Trial
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setConsultationOpen(true)}
                  >
                    Schedule Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </StaggeredPageContent>
      </div>

      <ConsultationContactModal open={consultationOpen} onOpenChange={setConsultationOpen} />
    </AppLayout>
  );
}