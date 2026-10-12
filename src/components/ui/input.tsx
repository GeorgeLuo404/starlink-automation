import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-[var(--radius)] border border-[#1b1f27] bg-[#0d0f13] px-3 py-2 text-sm text-[#e8ebf0] transition-colors",
        "placeholder:text-[#5c6472] file:mr-3 file:rounded file:border-0 file:bg-[#1b1f27] file:px-2 file:py-1 file:text-xs file:text-[#e8ebf0]",
        "focus-visible:border-[#22e0ff]/65 focus-visible:ring-3 focus-visible:ring-[#22e0ff]/14 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
