import { DEV_MODE } from "./config/dev";

/**
 * Centralized handler for unauthorized (401) errors.
 * Shows a toast notification and redirects to the login page.
 * 
 * @param toast - The toast function from useToast hook
 */
export function handleUnauthorized(toast: (props: {
  title: string;
  description: string;
  variant?: "destructive" | "default";
}) => void): void {
  toast({
    title: "Unauthorized",
    description: "You are logged out. Logging in again...",
    variant: "destructive",
  });
  
  if (!DEV_MODE) {
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }
}

