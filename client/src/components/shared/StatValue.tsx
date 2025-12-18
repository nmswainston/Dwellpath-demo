import * as React from "react";
import { cn } from "@/lib/utils";

type StatValueOwnProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
};

export type StatValueProps<T extends React.ElementType = "span"> = StatValueOwnProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof StatValueOwnProps<T>>;

/**
 * Semantic "headline number" typography:
 * - Heading font (Playfair Display)
 * - Large bold size
 * - Lining + tabular numerals for aligned stats/currency
 *
 * Intentionally does NOT set color, spacing, or layout.
 */
export function StatValue<T extends React.ElementType = "span">({
  as,
  className,
  ...props
}: StatValueProps<T>) {
  const Comp = (as ?? "span") as React.ElementType;

  return (
    <Comp className={cn("text-3xl font-heading font-bold numeric", className)} {...props} />
  );
}


