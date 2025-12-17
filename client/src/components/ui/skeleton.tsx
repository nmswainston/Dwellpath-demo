import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

type SkeletonVariant = "line" | "title" | "card" | "avatar" | "button";

function SkeletonBlock({
  variant = "line",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: SkeletonVariant }) {
  const variants: Record<SkeletonVariant, string> = {
    line: "h-4 w-full",
    title: "h-5 w-2/3",
    card: "h-24 w-full rounded-xl",
    avatar: "h-10 w-10 rounded-full",
    button: "h-9 w-28 rounded-md",
  };

  return <Skeleton className={cn(variants[variant], className)} {...props} />;
}

export { Skeleton, SkeletonBlock }
