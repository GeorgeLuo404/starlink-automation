import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/10 text-primary",
        outline: "border-border text-muted-foreground",
        solid: "border-transparent bg-secondary text-body",
        signal: "border-signal/30 bg-signal/10 text-signal",
        success: "border-success/30 bg-success/10 text-success",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
