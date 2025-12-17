import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circle";
}

export function LoadingSkeleton({ className, variant = "default" }: LoadingSkeletonProps) {
  const baseClasses = "loading-shimmer";
  
  const variantClasses = {
    default: "h-4 w-full rounded",
    card: "h-24 w-full rounded-xl",
    text: "h-3 w-3/4 rounded",
    circle: "h-10 w-10 rounded-full",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} />
  );
}

export function LoadingCard() {
  return (
    <div className="winter-card p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <LoadingSkeleton variant="circle" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="h-4 w-1/3" />
            <LoadingSkeleton variant="text" />
          </div>
        </div>
        <LoadingSkeleton variant="card" />
        <div className="space-y-2">
          <LoadingSkeleton />
          <LoadingSkeleton className="w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function LoadingDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LoadingCard />
          <LoadingCard />
        </div>
        <div className="space-y-6">
          <LoadingCard />
          <LoadingCard />
        </div>
      </div>
    </div>
  );
}