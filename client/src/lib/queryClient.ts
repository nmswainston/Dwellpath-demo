import { QueryClient, QueryFunction } from "@tanstack/react-query";
import * as apiClient from "./apiClient";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
const getQueryFn = <T>(options: { on401: UnauthorizedBehavior }): QueryFunction<T> => {
  const unauthorizedBehavior = options.on401;

  return async ({ queryKey }) => {
    // Handle API routes using the centralized API client
    const key = queryKey[0] as string;
    
    // Map query keys to API client methods
    if (key === "/api/auth/user") {
      return (await apiClient.authApi.getUser()) as T;
    }
    if (key === "/api/dashboard/stats") {
      return (await apiClient.dashboardApi.getStats()) as T;
    }
    if (key === "/api/dashboard/residency-stats") {
      const year = (queryKey[1] as any)?.year;
      return (await apiClient.dashboardApi.getResidencyStats(year)) as T;
    }
    if (key === "/api/residency-logs") {
      const year = (queryKey[1] as any)?.year;
      return (await apiClient.residencyLogsApi.getAll(year)) as T;
    }
    if (key === "/api/expenses") {
      const params = queryKey[1] as any;
      return (await apiClient.expensesApi.getAll(params?.state, params?.year)) as T;
    }
    if (key === "/api/journal-entries") {
      return (await apiClient.journalApi.getAll()) as T;
    }
    if (key === "/api/ai/chats") {
      return (await apiClient.aiApi.getChats()) as T;
    }
    if (key === "/api/alerts") {
      return (await apiClient.alertsApi.getAll()) as T;
    }
    if (key === "/api/properties") {
      return (await apiClient.propertiesApi.getAll()) as T;
    }
    if (key === "/api/audit-documents") {
      return (await apiClient.auditDocumentsApi.getAll()) as T;
    }
    if (key === "/api/user/preferences") {
      return (await apiClient.preferencesApi.get()) as T;
    }
    if (key === "/api/onboarding/tour") {
      return (await apiClient.onboardingApi.getTour()) as T;
    }
    if (key.startsWith("/api/onboarding/tour/") && key.includes("/steps")) {
      const tourId = queryKey[1] as string;
      return (await apiClient.onboardingApi.getSteps(tourId)) as T;
    }
    if (key === "/api/feedback") {
      return (await apiClient.feedbackApi.getAll()) as T;
    }

    // Fallback to direct fetch for unmapped routes
    const url = queryKey.length === 1 ? key : queryKey.join("/");
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
