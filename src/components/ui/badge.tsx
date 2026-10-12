import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-[#22e0ff]/30 bg-[#22e0ff]/10 text-[#22e0ff]",
        outline: "border-[#1b1f27] text-[#8a929e]",
        solid: "border-transparent bg-[#171a21] text-[#c3c9d4]",
        signal: "border-[#ffb020]/30 bg-[#ffb020]/10 text-[#ffb020]",
        success: "border-[#35d07f]/30 bg-[#35d07f]/10 text-[#35d07f]",
        destructive: "border-[#ff4d4f]/30 bg-[#ff4d4f]/10 text-[#ff4d4f]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
