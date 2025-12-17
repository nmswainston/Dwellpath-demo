import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { authApi } from "@/lib/apiClient";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export function useAuth() {
  // Demo mode: return authenticated user immediately
  if (DEMO_MODE) {
    const { data: user, isLoading } = useQuery<User>({
      queryKey: ["/api/auth/user"],
      queryFn: () => authApi.getUser(),
      retry: false,
    });

    return {
      user: user || {
        id: "demo-user",
        email: "demo@dwellpath.local",
        firstName: "Demo",
        lastName: "User",
      } as User,
      isAuthenticated: true,
      isLoading: false,
    };
  }

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: () => authApi.getUser(),
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
