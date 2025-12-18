import { ReactNode, useEffect } from 'react';
import {
  PreferencesContext,
  usePreferencesQuery,
  useUpdatePreferences,
} from "@/features/preferences/hooks/usePreferences";
import type { UserPreferences, InsertUserPreferences } from '@shared/schema';

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const { data: preferences, isLoading } = usePreferencesQuery();
  const updatePreferencesMutation = useUpdatePreferences();

  const updatePreferences = async (newPreferences: Partial<InsertUserPreferences>) => {
    await updatePreferencesMutation.mutateAsync(newPreferences);
  };

  // Apply theme preference to document
  useEffect(() => {
    const userPrefs = preferences as UserPreferences | undefined;
    const root = document.documentElement;
    
    // Default to 'light' if no preference is set yet or still loading
    const theme = userPrefs?.theme || 'light';
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const isDark = mediaQuery.matches;
      root.classList.add(isDark ? 'dark' : 'light');
      
      // Listen for system theme changes
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else {
      root.classList.add(theme);
    }
  }, [(preferences as UserPreferences | undefined)?.theme]);

  return (
    <PreferencesContext.Provider
      value={{
        preferences: preferences as UserPreferences | undefined,
        isLoading,
        updatePreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}