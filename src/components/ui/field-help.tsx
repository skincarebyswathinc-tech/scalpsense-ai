import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Small helper text displayed under a form Label to explain the field.
 * Use a stable id and pass it via aria-describedby on the input for a11y.
 */
export const FieldHelp: React.FC<
  React.HTMLAttributes<HTMLParagraphElement> & { id?: string }
> = ({ className, children, id, ...props }) => (
  <p
    id={id}
    className={cn("text-[11px] leading-snug text-muted-foreground font-body", className)}
    {...props}
  >
    {children}
  </p>
);

export default FieldHelp;
