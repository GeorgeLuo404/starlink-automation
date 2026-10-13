import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-(--radius) border border-[#1b1f27] bg-[#0d0f13] px-3 py-2 text-sm leading-relaxed text-[#e8ebf0] transition-colors",
        "placeholder:text-[#5c6472]",
        "focus-visible:border-[#22e0ff]/65 focus-visible:ring-3 focus-visible:ring-[#22e0ff]/14 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
