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
import { handleUnauthorized } from "@/utils/handleUnauthorized";
import { Alert as AlertType } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import { useSidebar } from "@/hooks/useSidebar";

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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return AlertTriangle;
  };


  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="lg:hidden text-brand-primary dark:text-accent hover:text-blue-700 dark:hover:text-blue-300"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h2 className="page-title text-foreground">{title}</h2>
            <p className="page-subtitle text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notifications Popover */}
          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative text-brand-primary dark:text-accent hover:text-blue-700 dark:hover:text-blue-300"
              >
                <Bell className="h-5 w-5" />
                {alerts.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
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
                      <Bell className="h-8 w-8 mx-auto text-brand-primary dark:text-accent mb-2" />
                      <p className="text-sm text-brand-text-light/70 dark:text-brand-text-dark/70">No new notifications</p>
                      <p className="text-xs text-brand-text-light/60 dark:text-brand-text-dark/60 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto bg-background">
                      {alerts.map((alert: AlertType) => {
                        const SeverityIcon = getSeverityIcon(alert.severity || 'low');
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
              <Button variant="ghost" size="sm" className="text-brand-primary dark:text-accent hover:text-blue-700 dark:hover:text-blue-300">
                <Settings className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-background border border-border" align="end" side="bottom">
              <Card className="border-0 shadow-lg bg-background">
                <CardHeader className="border-b border-border bg-muted/50 py-3">
                  <CardTitle className="text-sm font-medium flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-brand-primary dark:text-accent" />
                    <span>App Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-6 bg-background">
                  {/* Notification Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-brand-primary dark:text-accent" />
                      <Label className="text-sm font-medium text-foreground">Notifications</Label>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Tax compliance alerts</Label>
                          <p className="text-xs text-gray-500">Get notified about 183-day threshold warnings</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Daily reminders</Label>
                          <p className="text-xs text-gray-500">Remind me to log residency days</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Data Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4 text-brand-primary dark:text-accent" />
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
                    <p className="text-xs text-gray-500">Dwellpath v0.1 Alpha</p>
                    <p className="text-xs text-gray-400 mt-1">© 2025 Tax Residency Tracker</p>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
          
          {/* Theme Toggle */}
          <ThemeToggle className="text-brand-primary dark:text-accent hover:text-blue-700 dark:hover:text-blue-300" />
          
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
                window.location.href = "/";
                return;
              }
              window.location.href = "/api/logout";
            }}
            className="text-brand-primary dark:text-accent hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Logout"
          >
            <Power className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
