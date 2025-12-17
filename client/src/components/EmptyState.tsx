import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateAction = {
  label: string;
  onClick: () => void;
};

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: EmptyStateAction;
  className?: string;
}) {
  return (
    <Card className={cn("winter-card p-8 text-center", className)}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-brand-primary dark:text-accent">
        {icon}
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-6">
          <Button onClick={action.onClick} className="px-6">
            {action.label}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}


