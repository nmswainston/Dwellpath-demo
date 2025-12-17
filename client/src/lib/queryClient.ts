import { QueryClient, QueryFunction } from "@tanstack/react-query";
import * as apiClient from "./apiClient";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle API routes using the centralized API client
    const key = queryKey[0] as string;
    
    // Map query keys to API client methods
    if (key === "/api/auth/user") {
      return apiClient.authApi.getUser() as Promise<T>;
    }
    if (key === "/api/dashboard/stats") {
      return apiClient.dashboardApi.getStats() as Promise<T>;
    }
    if (key === "/api/dashboard/residency-stats") {
      const year = (queryKey[1] as any)?.year;
      return apiClient.dashboardApi.getResidencyStats(year) as Promise<T>;
    }
    if (key === "/api/residency-logs") {
      const year = (queryKey[1] as any)?.year;
      return apiClient.residencyLogsApi.getAll(year) as Promise<T>;
    }
    if (key === "/api/expenses") {
      const params = queryKey[1] as any;
      return apiClient.expensesApi.getAll(params?.state, params?.year) as Promise<T>;
    }
    if (key === "/api/journal-entries") {
      return apiClient.journalApi.getAll() as Promise<T>;
    }
    if (key === "/api/ai/chats") {
      return apiClient.aiApi.getChats() as Promise<T>;
    }
    if (key === "/api/alerts") {
      return apiClient.alertsApi.getAll() as Promise<T>;
    }
    if (key === "/api/properties") {
      return apiClient.propertiesApi.getAll() as Promise<T>;
    }
    if (key === "/api/audit-documents") {
      return apiClient.auditDocumentsApi.getAll() as Promise<T>;
    }
    if (key === "/api/user/preferences") {
      return apiClient.preferencesApi.get() as Promise<T>;
    }
    if (key === "/api/onboarding/tour") {
      return apiClient.onboardingApi.getTour() as Promise<T>;
    }
    if (key.startsWith("/api/onboarding/tour/") && key.includes("/steps")) {
      const tourId = queryKey[1] as string;
      return apiClient.onboardingApi.getSteps(tourId) as Promise<T>;
    }
    if (key === "/api/feedback") {
      return apiClient.feedbackApi.getAll() as Promise<T>;
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
