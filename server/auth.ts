import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { HAS_DATABASE, SESSION_SECRET } from "./config";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use MemoryStore when no database is available (dev/preview mode only)
  let sessionStore: session.Store;
  if (HAS_DATABASE) {
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  } else {
    // Use default MemoryStore for NO_DB mode
    sessionStore = new session.MemoryStore();
    if (process.env.NODE_ENV === "development") {
      console.log("📝 Using in-memory session store (sessions cleared on server restart)");
    }
  }
  
  return session({
    secret: SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Use session middleware
  app.use(getSession());
  
  // Restore user from session
  app.use((req: any, res, next) => {
    if (req.session?.passport?.user) {
      req.user = req.session.passport.user;
    }
    next();
  });
  
  // Dev login endpoint - automatically authenticate
  app.get("/api/login", (req: any, res) => {
    console.log("🔐 Dev login endpoint hit");
    // Create a mock user session
    const mockUser = {
      claims: {
        sub: "dev-user-123",
        email: "dev@dwellpath.local",
        first_name: "Dev",
        last_name: "User",
        profile_image_url: null,
      },
      access_token: "dev-token",
      refresh_token: "dev-refresh-token",
      expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
    };
    
    // Set user in session
    if (!req.session) {
      console.error("❌ Session not available");
      return res.status(500).json({ message: "Session not initialized" });
    }
    
    req.session.passport = { user: mockUser };
    req.user = mockUser;
    
    // Save session before redirect
    req.session.save((err: any) => {
      if (err) {
        console.error("❌ Error saving session:", err);
        return res.status(500).json({ message: "Failed to save session" });
      }
      console.log("✅ Dev user authenticated, redirecting to /");
      res.redirect("/");
    });
  });
  
  app.get("/api/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  // Check if user is already in session
  if (!req.user && req.session) {
    // Auto-authenticate with dev user
    const mockUser = {
      claims: {
        sub: "dev-user-123",
        email: "dev@dwellpath.local",
        first_name: "Dev",
        last_name: "User",
        profile_image_url: null,
      },
      access_token: "dev-token",
      refresh_token: "dev-refresh-token",
      expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
    };
    
    // Set user in session
    if (!req.session.passport) {
      req.session.passport = {};
    }
    req.session.passport.user = mockUser;
    req.user = mockUser;
  }
  
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  return next();
};

