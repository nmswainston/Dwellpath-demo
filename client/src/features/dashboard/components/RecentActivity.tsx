import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Receipt, AlertTriangle, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ResidencyLog, Expense, Alert } from "@shared/schema";

export default function RecentActivity() {
  const { data: residencyLogs = [], isLoading: logsLoading } = useQuery<ResidencyLog[]>({
    queryKey: ["/api/residency-logs"],
    select: (data) => data?.slice(0, 5) || [],
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
    select: (data) => data?.slice(0, 3) || [],
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    select: (data) => data?.slice(0, 2) || [],
  });

  const isLoading = logsLoading || expensesLoading || alertsLoading;

  // Combine and sort activities by date
  const activities = [
    ...residencyLogs.map((log: ResidencyLog) => ({
      type: 'residency',
      id: `residency-${log.id}`,
      date: log.createdAt,
      icon: MapPin,
      iconColor: 'text-brand-primary dark:text-accent',
      iconBg: 'bg-brand-primary/10 dark:bg-accent/10',
      title: 'Days logged',
      description: `${log.state} • ${format(parseISO(log.startDate), "MMM dd")} - ${format(parseISO(log.endDate), "MMM dd")}`,
    })),
    ...expenses.map((expense: Expense) => ({
      type: 'expense',
      id: `expense-${expense.id}`,
      date: expense.createdAt,
      icon: Receipt,
      iconColor: 'text-brand-primary dark:text-accent',
      iconBg: 'bg-brand-primary/10 dark:bg-accent/10',
      title: 'Expense recorded',
      description: `$${parseFloat(expense.amount).toLocaleString()} ${expense.category} in ${expense.state}`,
    })),
    ...alerts.map((alert: Alert) => ({
      type: 'alert',
      id: `alert-${alert.id}`,
      date: alert.createdAt,
      icon: AlertTriangle,
      iconColor: 'text-brand-primary dark:text-accent',
      iconBg: 'bg-brand-primary/10 dark:bg-accent/10',
      title: alert.title,
      description: alert.message,
    })),
  ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 6);

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2 min-w-0">
            <Clock className="h-5 w-5 text-brand-primary dark:text-accent shrink-0" />
            <span className="truncate">Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <div className="h-full min-h-0 overflow-y-auto pr-2 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="winter-card h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2 min-w-0">
          <Clock className="h-5 w-5 text-brand-primary dark:text-accent shrink-0" />
          <span className="truncate">Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-text-light/70 dark:text-brand-text-dark/70">No recent activity. Start by logging some residency days!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-xl transition-colors"
                  >
                    <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center mt-0.5 shrink-0`}>
                      <Icon className={`${activity.iconColor} h-4 w-4`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-text-light dark:text-brand-text-dark leading-tight break-words">{activity.title}</p>
                      <p className="text-sm text-brand-text-light/60 dark:text-brand-text-dark/60 leading-tight break-words mt-1">{activity.description}</p>
                      <p className="text-xs text-brand-text-light/50 dark:text-brand-text-dark/50 mt-1">
                        {activity.date ? format(typeof activity.date === "string" ? parseISO(activity.date) : activity.date, "MMM dd, yyyy 'at' h:mm a") : "Unknown date"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Button variant="ghost" className="w-full mt-4 text-primary shrink-0">
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
}
