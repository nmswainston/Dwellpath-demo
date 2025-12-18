import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { HAS_DATABASE } from "./config";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Get the database instance.
 * Throws only when called, not at import time.
 * Returns null if no database is configured.
 */
function getDb() {
  if (!HAS_DATABASE) {
    throw new Error(
      "Database is not configured. DATABASE_URL must be set to use database features."
    );
  }
  
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    dbInstance = drizzle({ client: pool, schema });
  }
  
  return dbInstance;
}

// For backward compatibility, export db as a getter that throws when accessed
// This allows existing code to fail gracefully when DB is not available
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const db = getDb();
    const value = (db as any)[prop];
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  }
});