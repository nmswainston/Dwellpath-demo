/**
 * Server configuration
 * Handles environment variables and feature flags
 */

export const HAS_DATABASE = Boolean(process.env.DATABASE_URL);

export const SESSION_SECRET = process.env.SESSION_SECRET || (HAS_DATABASE ? undefined : "dev-secret-change-me");

if (!HAS_DATABASE && process.env.NODE_ENV === "development") {
  console.log("⚠️  Running in NO_DB mode (preview/demo) - Database features disabled");
  if (!process.env.SESSION_SECRET) {
    console.warn("⚠️  Using default SESSION_SECRET for development. Set SESSION_SECRET in production!");
  }
}

