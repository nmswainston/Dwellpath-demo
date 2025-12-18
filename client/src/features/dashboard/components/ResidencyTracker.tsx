import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { StatValue } from "@/components/shared/StatValue";

type ResidencyStats = {
  state: string;
  totalDays: number;
  daysRemaining: number;
  isAtRisk: boolean;
};

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export default function ResidencyTracker() {
  const { data: residencyStats = [], isLoading } = useQuery<ResidencyStats[]>({
    queryKey: ["/api/dashboard/residency-stats"],
  });

  const getProgressValue = (totalDays: number) => {
    return Math.min((totalDays / 183) * 100, 100);
  };


  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2 min-w-0">
              <MapPin className="h-5 w-5 text-brand-primary dark:text-accent shrink-0" />
              <span className="truncate">2024 Residency Status</span>
            </CardTitle>
            <Skeleton className="h-9 w-20 shrink-0" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-xl p-4 bg-card shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-6 w-16 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="w-full h-3 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card className="winter-card h-full">
        <CardHeader className="pb-4">
          <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
            <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2 min-w-0">
              <MapPin className="h-5 w-5 text-brand-primary dark:text-accent shrink-0" />
              <span className="truncate">2024 Residency Status</span>
            </CardTitle>
            <Link href="/log-days">
              <Button size="sm" className="shrink-0">
                <Plus className="mr-1 h-4 w-4" />
                Log Days
              </Button>
            </Link>
          </div>
        </CardHeader>
      <CardContent>
        {residencyStats.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-status-neutral/10 flex items-center justify-center">
              <Plus className="w-8 h-8 text-status-neutral" />
            </div>
            <h3 className="text-lg font-semibold text-brand-text-light dark:text-brand-text-dark mb-2">Start Your Journey</h3>
            <p className="text-brand-text-light/60 dark:text-brand-text-dark/60 mb-6 max-w-sm mx-auto">Begin tracking your residency days to stay compliant with state tax regulations.</p>
            <Link href="/log-days">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Log Your First Days
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {residencyStats.map((stat: ResidencyStats) => {
              const stateName = US_STATES.find(s => s.code === stat.state)?.name || stat.state;
              const progressValue = getProgressValue(stat.totalDays);
              const isHighTaxState = ['CA', 'NY', 'NJ', 'CT', 'HI', 'IL'].includes(stat.state);
              
              return (
                <div key={stat.state} className="winter-card border-l-4 border-l-blue-400 p-5 hover:scale-[1.02] transition-transform duration-200">
                  <div className="grid grid-cols-[1fr_auto] gap-3 items-start mb-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 bg-brand-accent dark:bg-accent rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
                        {stat.state.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-brand-text-light dark:text-brand-text-dark truncate">{stateName}</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-brand-text-light/60 dark:text-brand-text-dark/60">
                            {isHighTaxState ? "High-tax state" : "No state tax"}
                          </p>
                          {isHighTaxState && (
                            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <StatValue as="p" className="text-brand-text-light dark:text-brand-text-dark">
                          {stat.totalDays}
                        </StatValue>
                        <div className={cn(
                          "state-badge",
                          stat.isAtRisk ? "risk-critical" : 
                          stat.totalDays > 120 ? "risk-medium" : "risk-low"
                        )}>
                          {stat.isAtRisk ? "RISK" : stat.totalDays > 120 ? "WATCH" : "SAFE"}
                        </div>
                      </div>
                      <p className="text-sm text-brand-text-light/60 dark:text-brand-text-dark/60">
                        {stat.daysRemaining} days remaining
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={progressValue}
                      className="w-full h-3"
                    />
                    <div className="flex justify-between text-xs text-brand-text-light/60 dark:text-brand-text-dark/60 mt-1">
                      <span>0</span>
                      <span className={`font-medium ${
                        stat.isAtRisk 
                          ? "text-status-risk" 
                          : stat.totalDays > 120 
                            ? "text-status-warning" 
                            : "text-status-safe"
                      }`}>
                        {stat.totalDays}/183
                      </span>
                      <span>183</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
