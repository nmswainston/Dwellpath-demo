import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { alertsApi } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/lib/handleUnauthorized";
import { Alert as AlertType } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function AlertBanner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery<AlertType[]>({
    queryKey: ["/api/alerts"],
    select: (data) => data?.filter((alert: AlertType) => !alert.isRead && (alert.severity === 'high' || alert.severity === 'critical')) || [],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await alertsApi.markAsRead(alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to dismiss alert",
        variant: "destructive",
      });
    },
  });

  if (alerts.length === 0) {
    return null;
  }

  // Show the most critical alert
  const criticalAlert = alerts.find((alert: AlertType) => alert.severity === 'critical') || alerts[0];

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="mb-6 winter-card border-l-4 border-l-brand-bg-dark">
      <Alert variant={getAlertVariant(criticalAlert.severity || 'default')} className="bg-transparent border-0 shadow-none">
        <div className="flex items-start space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-bg-light/50 dark:bg-brand-bg-dark/50 text-brand-text-light dark:text-brand-text-dark flex-shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <AlertDescription className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1 min-w-0">
                  <p className="font-semibold text-brand-text-light dark:text-brand-text-dark min-w-0 truncate">{criticalAlert.title}</p>
                  <div className={cn(
                    "state-badge text-xs",
                    criticalAlert.severity === 'critical' || criticalAlert.severity === 'high' ? "status-risk" : "status-warning"
                  )}>
                    {(criticalAlert.severity || 'unknown').toUpperCase()}
                  </div>
                </div>
                <p className="text-sm text-brand-text-light/70 dark:text-brand-text-dark/70 leading-relaxed">{criticalAlert.message}</p>
                {alerts.length > 1 && (
                  <p className="text-xs mt-2 text-brand-text-light/60 dark:text-brand-text-dark/60">
                    +{alerts.length - 1} more alert{alerts.length > 2 ? 's' : ''}
                  </p>
                )}
                <div className="mt-2 text-xs text-brand-text-light/60 dark:text-brand-text-dark/60">
                  Tap to dismiss or address this alert to maintain compliance.
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsReadMutation.mutate(criticalAlert.id)}
                disabled={markAsReadMutation.isPending}
                className="ml-4 h-8 w-8 hover:bg-brand-bg-light/50 dark:hover:bg-brand-bg-dark/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
