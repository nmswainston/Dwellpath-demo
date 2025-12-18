import { usePreferences } from "@/features/preferences/hooks/usePreferences";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Palette, Bell, Globe, Calendar, DollarSign } from 'lucide-react';
import AppLayout from "@/components/layout/AppLayout";

export default function SettingsPage() {
  const { preferences, isLoading, updatePreferences } = usePreferences();
  const { toast } = useToast();

  const handlePreferenceChange = async (key: string, value: any) => {
    try {
      await updatePreferences({ [key]: value });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Settings" subtitle="Customize your Dwellpath experience">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings" subtitle="Customize your Dwellpath experience">
      <div className="grid gap-6 max-w-4xl">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-brand-primary dark:text-accent" />
              <CardTitle className="font-heading text-brand-primary dark:text-foreground">Appearance</CardTitle>
            </div>
            <CardDescription className="font-body text-muted-foreground dark:text-muted-foreground">
              Customize how Dwellpath looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="theme">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color scheme
                </p>
              </div>
              <Select
                value={preferences?.theme || 'system'}
                onValueChange={(value) => handlePreferenceChange('theme', value)}
              >
                <SelectTrigger id="theme" name="theme" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use smaller spacing and condensed layouts
                </p>
              </div>
              <Switch
                id="compact-mode"
                checked={preferences?.compactMode || false}
                onCheckedChange={(checked) => handlePreferenceChange('compactMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sidebar-collapsed">Collapsed Sidebar</Label>
                <p className="text-sm text-muted-foreground">
                  Keep the sidebar collapsed by default
                </p>
              </div>
              <Switch
                id="sidebar-collapsed"
                checked={preferences?.sidebarCollapsed || false}
                onCheckedChange={(checked) => handlePreferenceChange('sidebarCollapsed', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-brand-primary dark:text-accent" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Manage how you receive alerts and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for compliance risks and important updates
                </p>
              </div>
              <Switch
                id="notifications"
                checked={preferences?.notificationsEnabled || false}
                onCheckedChange={(checked) => handlePreferenceChange('notificationsEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand-primary dark:text-accent" />
              <CardTitle>Regional Settings</CardTitle>
            </div>
            <CardDescription>
              Configure locale-specific preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="language">Language</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred language
                </p>
              </div>
              <Select
                value={preferences?.language || 'en'}
                onValueChange={(value) => handlePreferenceChange('language', value)}
              >
                <SelectTrigger id="language" name="language" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="timezone">Timezone</Label>
                <p className="text-sm text-muted-foreground">
                  Your local timezone for date calculations
                </p>
              </div>
              <Select
                value={preferences?.timezone || 'America/New_York'}
                onValueChange={(value) => handlePreferenceChange('timezone', value)}
              >
                <SelectTrigger id="timezone" name="timezone" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="America/Phoenix">Arizona Time</SelectItem>
                  <SelectItem value="Pacific/Honolulu">Hawaii Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Format Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-primary dark:text-accent" />
              <CardTitle>Format Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize how dates and currency are displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="date-format">Date Format</Label>
                <p className="text-sm text-muted-foreground">
                  How dates appear throughout the app
                </p>
              </div>
              <Select
                value={preferences?.dateFormat || 'MM/dd/yyyy'}
                onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
              >
                <SelectTrigger id="date-format" name="date-format" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="currency">Currency</Label>
                <p className="text-sm text-muted-foreground">
                  Default currency for expense tracking
                </p>
              </div>
              <Select
                value={preferences?.currency || 'USD'}
                onValueChange={(value) => handlePreferenceChange('currency', value)}
              >
                <SelectTrigger id="currency" name="currency" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Info */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2 text-brand-primary dark:text-brand-accent bg-brand-bg-light dark:bg-brand-bg-dark/20 px-4 py-2 rounded-lg">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">All changes are saved automatically</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}