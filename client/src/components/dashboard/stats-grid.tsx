import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, DollarSign, Shield, Crown, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardStats = {
  totalDaysTracked: number;
  activeStates: number;
  estimatedTaxSavings: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  // Future premium features
  // subscriptionTier: 'free' | 'premium' | 'concierge';
  // totalProperties: number;
  // netWorthProtected: number;
};

export default function StatsGrid() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="card-grid card-grid-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-20 mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card-grid card-grid-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="text-center font-body text-muted-foreground dark:text-muted-foreground">
                No data available
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-brand-primary';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBackground = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-brand-primary';
      case 'medium': return 'bg-yellow-600';
      case 'high': return 'bg-orange-600';
      case 'critical': return 'bg-red-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="card-grid card-grid-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Total Days Tracked */}
      <Card className="winter-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-primary dark:text-accent" />
            Total Days Tracked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-3xl font-heading font-bold text-foreground">
              {stats.totalDaysTracked}
            </p>
            <p className="text-sm font-body text-muted-foreground mt-2">
              This year
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active States */}
      <Card className="winter-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-primary dark:text-accent" />
            Active States
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-3xl font-heading font-bold text-foreground">
              {stats.activeStates}
            </p>
            <p className="text-sm font-body text-muted-foreground mt-2">
              States with residency
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tax Savings */}
      <Card className="winter-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-brand-primary dark:text-accent" />
            Est. Tax Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-3xl font-heading font-bold text-foreground">
              ${stats.estimatedTaxSavings.toLocaleString()}
            </p>
            <p className="text-sm font-body text-muted-foreground mt-2">
              High-tax state avoidance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Level */}
      <Card className="winter-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-primary dark:text-accent" />
            Risk Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className={`text-3xl font-heading font-bold capitalize ${getRiskColor(stats.riskLevel)}`}>
              {stats.riskLevel}
            </p>
            <p className="text-sm font-body text-muted-foreground mt-2">
              Compliance status
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
