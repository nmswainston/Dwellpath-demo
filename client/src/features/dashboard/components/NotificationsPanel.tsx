import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { alertsApi } from "@/lib/apiClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/lib/handleUnauthorized";
import type { Alert as AlertType } from "@shared/schema";

export default function NotificationsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: alerts, isLoading } = useQuery<AlertType[]>({
    queryKey: ["/api/alerts"],
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await alertsApi.delete(alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Notification dismissed",
        description: "The notification has been removed from your dashboard.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to dismiss notification. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="winter-card h-full">
        <CardHeader className="pb-4">
          <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
            <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2 min-w-0">
              <Bell className="h-5 w-5 text-brand-primary dark:text-accent flex-shrink-0" />
              <span className="truncate">Notifications</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadAlerts = alerts?.filter((alert) => !alert.isRead) || [];
  const recentAlerts = alerts?.slice(0, 4) || [];

  const getAlertIcon = (severity: string | null | undefined) => {
    switch (severity) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4 text-status-risk" />;
      case "medium":
        return <Info className="h-4 w-4 text-status-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 text-status-safe" />;
    }
  };

  return (
    <Card className="winter-card h-full">
      <CardHeader className="pb-4">
        <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
          <CardTitle className="font-heading text-lg font-bold text-brand-primary dark:text-foreground flex items-center gap-2 min-w-0">
            <Bell className="h-5 w-5 text-brand-primary dark:text-accent flex-shrink-0" />
            <span className="truncate">Notifications</span>
          </CardTitle>
          {unreadAlerts.length > 0 && (
            <Badge variant="destructive" className="flex-shrink-0">
              {unreadAlerts.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recentAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-brand-primary mx-auto mb-3" />
            <p className="text-sm text-brand-text-light/70 dark:text-brand-text-dark/70">All caught up!</p>
            <p className="text-xs text-brand-text-light/60 dark:text-brand-text-dark/60 mt-1">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`group relative p-3 rounded-xl border border-border transition-colors bg-card shadow-sm ${
                  alert.isRead 
                    ? 'bg-surface/50 border-border' 
                    : 'bg-card border-border shadow-sm'
                }`}
              >
                {/* Dismiss Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlertMutation.mutate(alert.id)}
                  disabled={dismissAlertMutation.isPending}
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>

                <div className="flex items-start gap-3 pr-8">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 min-w-0">
                      <h4 className={`text-sm font-medium truncate flex-1 min-w-0 ${
                        alert.isRead ? 'text-brand-text-light/70 dark:text-brand-text-dark/70' : 'text-brand-text-light dark:text-brand-text-dark'
                      }`}>
                        {alert.title}
                      </h4>
                      {!alert.isRead && (
                        <div className="w-2 h-2 bg-status-neutral rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className={`text-xs leading-tight break-words ${
                      alert.isRead ? 'text-brand-text-light/60 dark:text-brand-text-dark/60' : 'text-brand-text-light/70 dark:text-brand-text-dark/70'
                    }`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {alert.state && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {alert.state}
                        </Badge>
                      )}
                      <span className="text-xs text-brand-text-light/50 dark:text-brand-text-dark/50">
                        {formatDistanceToNow(new Date(alert.createdAt || Date.now()), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {alerts && alerts.length > 4 && (
              <div className="text-center pt-2">
                <button className="text-xs text-status-neutral hover:text-status-neutral/80 font-medium">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}