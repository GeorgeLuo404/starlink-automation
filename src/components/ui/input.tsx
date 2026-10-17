import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-(--radius) border border-input bg-card px-3 py-2 text-sm text-foreground transition-[color,box-shadow,border-color] outline-none",
        "placeholder:text-faint selection:bg-primary selection:text-primary-foreground",
        "file:mr-3 file:rounded file:border-0 file:bg-raised file:px-2 file:py-1 file:text-xs file:text-foreground",
        "focus-visible:border-primary/65 focus-visible:ring-3 focus-visible:ring-primary/14",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
