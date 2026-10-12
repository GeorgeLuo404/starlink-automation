import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "h-10 w-full appearance-none rounded-[var(--radius)] border border-[#1b1f27] bg-[#0d0f13] px-3 pr-9 text-sm text-[#e8ebf0] transition-colors",
          "focus-visible:border-[#22e0ff]/65 focus-visible:ring-3 focus-visible:ring-[#22e0ff]/14 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#8a929e]" />
    </div>
  );
}

export { Select };
