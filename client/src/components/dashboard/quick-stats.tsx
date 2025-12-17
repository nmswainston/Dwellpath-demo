import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, Calendar, TrendingUp, AlertTriangle } from "lucide-react";

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
          <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-primary dark:text-accent" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
              <div className="h-2 bg-slate-200 rounded"></div>
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
        <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-primary dark:text-accent" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Days Tracked */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-primary dark:text-accent" />
              <span className="text-sm font-medium text-slate-700">Total Days Logged</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{totalDaysLogged}</span>
          </div>
          <div className="text-xs text-slate-500">Across all states this year</div>
        </div>

        {/* Active States */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-primary dark:text-accent" />
              <span className="text-sm font-medium text-slate-700">Active States</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{totalStates}</span>
          </div>
          <div className="text-xs text-slate-500">States with logged time</div>
        </div>

        {/* Risk Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${atRiskStates > 0 ? 'text-orange-500' : 'text-brand-primary'}`} />
              <span className="text-sm font-medium text-slate-700">Risk Status</span>
            </div>
            <span className={`text-sm font-semibold ${atRiskStates > 0 ? 'text-orange-600' : 'text-brand-primary'}`}>
              {atRiskStates > 0 ? `${atRiskStates} At Risk` : 'All Clear'}
            </span>
          </div>
          {atRiskStates > 0 && (
            <div className="text-xs text-orange-600">States approaching 183-day limit</div>
          )}
          {atRiskStates === 0 && totalStates > 0 && (
            <div className="text-xs text-brand-primary">No states near the limit</div>
          )}
        </div>

        {/* Progress bars for top states */}
        {residencyStats && residencyStats.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-700">Top States</div>
            {residencyStats.slice(0, 2).map((stat) => (
              <div key={stat.state} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">{stat.state}</span>
                  <span className="text-slate-800 font-medium">{stat.totalDays}/183 days</span>
                </div>
                <Progress 
                  value={(stat.totalDays / 183) * 100} 
                  className={`h-2 ${stat.isAtRisk ? 'bg-orange-100' : 'bg-slate-100'}`}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}