import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface WinterTooltipProps {
  children: ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function WinterTooltip({ 
  children, 
  content, 
  side = "top",
  className = ""
}: WinterTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent 
        side={side}
        className={`winter-tooltip ${className}`}
      >
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}