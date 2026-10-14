import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-(--radius) border border-border bg-card px-3 py-2 text-sm leading-relaxed text-foreground transition-colors",
        "placeholder:text-faint",
        "focus-visible:border-primary/65 focus-visible:ring-3 focus-visible:ring-primary/14 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
