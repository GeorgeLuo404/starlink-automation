import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-(--radius) bg-linear-to-r from-ink-700 via-[#1b1f27] to-ink-700 bg-size-[200%_100%]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
