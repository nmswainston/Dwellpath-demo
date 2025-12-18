import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { StatValue } from "@/components/shared/StatValue";

type ResidencyStats = {
  state: string;
  totalDays: number;
  daysRemaining: number;
  isAtRisk: boolean;
};

export default function QuickStats() {
  const { data: residencyStats, isLoading } = useQuery<ResidencyStats[]>({
    queryKey: ["/api/dashboard/residency-stats"],
  });

  if (isLoading) {
    return (
      <Card className="winter-card h-full">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2 min-w-0">
            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="truncate">Quick Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-muted rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
              <div className="h-2 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalStates = residencyStats?.length || 0;
  const atRiskStates = residencyStats?.filter(stat => stat.isAtRisk).length || 0;
  const totalDaysLogged = residencyStats?.reduce((sum, stat) => sum + stat.totalDays, 0) || 0;

  return (
    <Card className="winter-card h-full">
      <CardHeader className="pb-4">
        <CardTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2 min-w-0">
          <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="truncate">Quick Stats</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Days Tracked */}
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">Total Days Logged</span>
            </div>
            <StatValue className="text-foreground flex-shrink-0">{totalDaysLogged}</StatValue>
          </div>
          <div className="text-xs text-muted-foreground">Across all states this year</div>
        </div>

        {/* Active States */}
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">Active States</span>
            </div>
            <StatValue className="text-foreground flex-shrink-0">{totalStates}</StatValue>
          </div>
          <div className="text-xs text-muted-foreground">States with logged time</div>
        </div>

        {/* Risk Status */}
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${atRiskStates > 0 ? 'text-status-risk' : 'text-status-safe'}`} />
              <span className="text-sm font-medium text-foreground truncate">Risk Status</span>
            </div>
            <span className={`text-sm font-semibold flex-shrink-0 ${atRiskStates > 0 ? 'text-status-risk' : 'text-status-safe'}`}>
              {atRiskStates > 0 ? `${atRiskStates} At Risk` : 'All Clear'}
            </span>
          </div>
          {atRiskStates > 0 && (
            <div className="text-xs text-status-risk">States approaching 183-day limit</div>
          )}
          {atRiskStates === 0 && totalStates > 0 && (
            <div className="text-xs text-status-safe">No states near the limit</div>
          )}
        </div>

        {/* Progress bars for top states */}
        {residencyStats && residencyStats.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">Top States</div>
            {residencyStats.slice(0, 2).map((stat) => (
              <div key={stat.state} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{stat.state}</span>
                  <span className="text-foreground font-medium">{stat.totalDays}/183 days</span>
                </div>
                <Progress 
                  value={(stat.totalDays / 183) * 100} 
                  className={`h-2 ${stat.isAtRisk ? 'bg-status-risk/20' : 'bg-muted'}`}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}