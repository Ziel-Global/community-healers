import * as React from "react";

import { cn } from "@/lib/utils";
import { softFieldClassName } from "@/components/ui/field-styles";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50",
        softFieldClassName,
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
