import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-(--radius) text-sm font-medium transition-all duration-200 outline-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Hover states use the theme roles (not literal white), so every variant
        // works on both dark and light sections.
        default: "bg-primary text-primary-foreground hover:bg-foreground hover:text-background",
        brand: "bg-primary text-primary-foreground hover:bg-foreground hover:text-background",
        /** High-contrast solid in the text colour — e.g. a white pill on a black header. */
        inverse: "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
        outline:
          "border border-border bg-transparent text-foreground hover:border-foreground/40 hover:bg-foreground/5",
        secondary: "bg-secondary text-foreground hover:bg-secondary-hover",
        ghost: "text-foreground hover:bg-foreground/5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-[0.9375rem]",
        icon: "size-10 p-0",
        "icon-sm": "size-8 p-0",
      },
      shape: {
        default: "",
        pill: "rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default", shape: "default" },
  }
);

function Button({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
