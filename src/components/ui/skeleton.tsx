import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-(--radius) bg-linear-to-r from-elevated via-raised to-elevated bg-size-[200%_100%]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
