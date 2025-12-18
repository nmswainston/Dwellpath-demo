import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
const DEMO_BANNER_DISMISSED_KEY = "dwellpath.demoBanner.dismissed.v1";

export default function DemoBanner() {
  if (!DEMO_MODE) {
    return null;
  }

  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(DEMO_BANNER_DISMISSED_KEY);
      if (dismissed === "true") setIsDismissed(true);
    } catch {
      // ignore (privacy mode / blocked storage)
    }
  }, []);

  if (isDismissed) {
    return null;
  }

  const dismiss = () => {
    setIsDismissed(true);
    try {
      window.localStorage.setItem(DEMO_BANNER_DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-card/95 backdrop-blur-sm px-4 py-2.5 shadow-lg">
        <Info className="mt-0.5 h-4 w-4 flex-none text-brand-accent" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">Demo Mode</span>
          <span className="text-xs text-muted-foreground">
            Using mock data (no database or server).
          </span>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss demo mode banner"
          className="ml-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}


