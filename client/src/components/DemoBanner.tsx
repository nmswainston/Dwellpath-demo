import { Info } from "lucide-react";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export default function DemoBanner() {
  if (!DEMO_MODE) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/95 backdrop-blur-sm px-4 py-2.5 shadow-lg">
        <Info className="h-4 w-4 text-brand-accent" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            Demo Mode
          </span>
          <span className="text-xs text-muted-foreground">
            Using mock data (no database or server).
          </span>
        </div>
      </div>
    </div>
  );
}

