import { usePreferences } from './usePreferences';
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const { preferences, updatePreferences } = usePreferences();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  
  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Get current effective theme
  const getEffectiveTheme = (): 'light' | 'dark' => {
    const userTheme = preferences?.theme || 'system';
    if (userTheme === 'system') {
      return systemTheme;
    }
    return userTheme as 'light' | 'dark';
  };

  const setTheme = async (newTheme: Theme) => {
    await updatePreferences({ theme: newTheme });
  };

  const toggleTheme = async () => {
    const currentEffective = getEffectiveTheme();
    const newTheme = currentEffective === 'light' ? 'dark' : 'light';
    await setTheme(newTheme);
  };

  // Quick toggle between light and dark (skips system)
  const toggleLightDark = async () => {
    const currentTheme = preferences?.theme || 'light';
    if (currentTheme === 'system') {
      // If currently system, toggle to opposite of what system is showing
      const newTheme = systemTheme === 'light' ? 'dark' : 'light';
      await setTheme(newTheme);
    } else {
      await toggleTheme();
    }
  };

  return { 
    theme: preferences?.theme || 'system',
    effectiveTheme: getEffectiveTheme(),
    systemTheme,
    setTheme, 
    toggleTheme,
    toggleLightDark,
    isLoading: !preferences
  };
}