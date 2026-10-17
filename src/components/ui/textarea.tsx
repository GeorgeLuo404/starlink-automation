import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-(--radius) border border-input bg-card px-3.5 py-2.5 text-sm leading-relaxed text-foreground transition-[color,box-shadow,border-color] outline-none",
        "placeholder:text-faint",
        "focus-visible:border-primary/65 focus-visible:ring-3 focus-visible:ring-primary/14",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
