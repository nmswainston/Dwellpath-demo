/**
 * Frontend Dev Mode Flag
 *
 * True in local Vite dev (`import.meta.env.DEV`), and also when the app is
 * running in explicit demo mode (`VITE_DEMO_MODE=true`).
 *
 * This prevents accidentally shipping "dev-only" behavior into production
 * builds while keeping the no-backend demo workflow intact.
 */
export const DEV_MODE =
  import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === "true";

