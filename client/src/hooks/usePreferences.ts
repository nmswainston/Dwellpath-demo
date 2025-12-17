import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesApi } from '@/lib/apiClient';
import type { UserPreferences, InsertUserPreferences } from '@shared/schema';

interface PreferencesContextType {
  preferences: UserPreferences | undefined;
  isLoading: boolean;
  updatePreferences: (preferences: Partial<InsertUserPreferences>) => Promise<void>;
}

export const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

export function usePreferencesQuery() {
  return useQuery({
    queryKey: ['/api/user/preferences'],
    retry: false,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preferences: Partial<InsertUserPreferences>) => {
      return preferencesApi.update(preferences as any);
    },
    onSuccess: (data) => {
      // Optimistically update the cache
      queryClient.setQueryData(['/api/user/preferences'], data);
      // Also invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
    },
  });
}