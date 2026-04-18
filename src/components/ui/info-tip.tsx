import * as React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTipProps {
  /** Short, plain-language explanation of what this block / chart shows. */
  children: React.ReactNode;
  className?: string;
  /** Optional accessible label override */
  label?: string;
}

/**
 * Small inline (i) icon that, on hover/focus, explains what a chart, KPI,
 * or admin block represents. Use it next to chart titles and admin section
 * headings so non-technical users instantly know what they're looking at.
 */
export const InfoTip: React.FC<InfoTipProps> = ({ children, className, label }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        aria-label={label || "More info"}
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/70 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors",
          className,
        )}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
      {children}
    </TooltipContent>
  </Tooltip>
);

export default InfoTip;
