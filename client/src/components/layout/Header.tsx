import { Bell, Settings, X, AlertTriangle, Menu, Power, Monitor } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { alertsApi } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/lib/handleUnauthorized";
import { Alert as AlertType } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import { useSidebar } from "@/hooks/useSidebar";
import { clearDemoSession } from "@/lib/demoSession";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setIsCollapsed } = useSidebar();

  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
    select: (data: any[]) => data?.filter((alert: any) => !alert.isRead) || [],
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-[hsl(var(--destructive)/0.10)] text-[hsl(var(--destructive))] border border-[hsl(var(--destructive)/0.25)]';
      case 'high':
        return 'bg-[hsl(var(--status-warning)/0.10)] text-[hsl(var(--status-warning))] border border-[hsl(var(--status-warning)/0.25)]';
      case 'medium':
        return 'bg-[hsl(var(--status-warning)/0.08)] text-[hsl(var(--status-warning))] border border-[hsl(var(--status-warning)/0.20)]';
      default:
        return 'bg-[hsl(var(--status-neutral)/0.10)] text-[hsl(var(--status-neutral))] border border-[hsl(var(--status-neutral)/0.25)]';
    }
  };

  const getSeverityIcon = () => {
    return AlertTriangle;
  };


  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-6">
      <div className="flex items-start justify-between gap-6">
        {/* Left: title stack aligned to the same top rail as the sidebar header divider */}
        <div className="grid grid-rows-[var(--app-shell-sidebar-header-h)_auto]">
          <div className="flex items-end gap-4">
            {/* Mobile menu button (kept in the top rail) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground self-end"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Title baseline sits on the sidebar header divider guide */}
            <h2 className="page-title text-foreground">{title}</h2>
          </div>

          {/* Subtitle lives below the guide (keeps typography untouched) */}
          <p className="page-subtitle text-muted-foreground">{subtitle}</p>
        </div>

        {/* Right: actions aligned within the same top rail */}
        <div className="h-(--app-shell-sidebar-header-h) flex items-end space-x-4">
          {/* Notifications Popover */}
          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                {alerts.length > 0 && (
                  <Badge 
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs border border-border bg-[hsl(var(--status-warning)/0.14)] text-[hsl(var(--status-warning))]"
                  >
                    {alerts.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 bg-background border border-border" align="end" side="bottom">
              <Card className="border-0 shadow-lg bg-background">
                <CardHeader className="border-b border-border bg-muted/50 py-3">
                  <CardTitle className="text-sm font-body font-medium flex items-center justify-between">
                    <span>Notifications</span>
                    {alerts.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {alerts.length} new
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 bg-background">
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center bg-background">
                      <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-brand-text-light/70 dark:text-brand-text-dark/70">No new notifications</p>
                      <p className="text-xs text-brand-text-light/60 dark:text-brand-text-dark/60 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto bg-background">
                      {alerts.map((alert: AlertType) => {
                        const SeverityIcon = getSeverityIcon();
                        return (
                          <div key={alert.id} className="border-b border-border p-4 hover:bg-muted/50 transition-colors bg-background">
                            <div className="flex items-start justify-between space-x-3">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className={`p-1.5 rounded-full ${getSeverityColor(alert.severity || 'low')}`}>
                                  <SeverityIcon className="h-3 w-3" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-brand-text-light dark:text-brand-text-dark leading-tight">
                                    {alert.title}
                                  </p>
                                  <p className="text-xs text-brand-text-light/70 dark:text-brand-text-dark/70 mt-1 leading-relaxed">
                                    {alert.message}
                                  </p>
                                  <p className="text-xs text-brand-text-light/50 dark:text-brand-text-dark/50 mt-2">
                                    {alert.createdAt ? format(new Date(alert.createdAt), "MMM dd, h:mm a") : 'Just now'}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsReadMutation.mutate(alert.id)}
                                disabled={markAsReadMutation.isPending}
                                className="h-6 w-6 p-0 hover:bg-brand-bg-light/50 dark:hover:bg-brand-bg-dark/50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
          
          {/* Settings Popover */}
          <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Settings className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-background border border-border" align="end" side="bottom">
              <Card className="border-0 shadow-lg bg-background">
                <CardHeader className="border-b border-border bg-muted/50 py-3">
                  <CardTitle className="text-sm font-medium flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>App Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-6 bg-background">
                  {/* Notification Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium text-foreground">Notifications</Label>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Tax compliance alerts</Label>
                          <p className="text-xs text-muted-foreground">Get notified about 183-day threshold warnings</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Daily reminders</Label>
                          <p className="text-xs text-muted-foreground">Remind me to log residency days</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Data Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Data & Privacy</Label>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Export my data
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Privacy settings
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* App Info */}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Dwellpath v0.1 Alpha</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">© 2025 Tax Residency Tracker</p>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
          
          {/* Theme Toggle */}
          <ThemeToggle className="text-muted-foreground hover:text-foreground" />
          
          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (DEMO_MODE) {
                toast({
                  title: "Demo Mode",
                  description: "Demo session reset.",
                });
                clearDemoSession();
                window.location.href = "/";
                return;
              }
              window.location.href = "/api/logout";
            }}
            className="text-muted-foreground hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.10)]"
            title="Logout"
          >
            <Power className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
