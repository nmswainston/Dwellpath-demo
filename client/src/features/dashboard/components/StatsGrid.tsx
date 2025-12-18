import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, DollarSign, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatValue } from "@/components/shared/StatValue";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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
      case 'low': return 'text-status-safe';
      case 'medium': return 'text-status-warning';
      case 'high': return 'text-status-risk';
      case 'critical': return 'text-status-risk';
      default: return 'text-status-neutral';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Total Days Tracked */}
      <Card className="winter-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2 min-w-0">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="truncate">Total Days Tracked</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <StatValue as="p" className="text-foreground">
              {stats.totalDaysTracked}
            </StatValue>
            <p className="text-sm font-body text-muted-foreground mt-2">
              This year
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active States */}
      <Card className="winter-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2 min-w-0">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="truncate">Active States</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <StatValue as="p" className="text-foreground">
              {stats.activeStates}
            </StatValue>
            <p className="text-sm font-body text-muted-foreground mt-2">
              States with residency
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tax Savings */}
      <Card className="winter-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2 min-w-0">
            <DollarSign className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="truncate">Est. Tax Savings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <StatValue as="p" className="text-foreground">
              ${stats.estimatedTaxSavings.toLocaleString()}
            </StatValue>
            <p className="text-sm font-body text-muted-foreground mt-2">
              High-tax state avoidance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Level */}
      <Card className="winter-card">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2 min-w-0">
            <Shield className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="truncate">Risk Level</span>
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
