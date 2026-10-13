import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "mb-2 block font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase select-none",
        className
      )}
      {...props}
    />
  );
}

export { Label };
