import { Counter } from "@/components/motion";
import { cn } from "@/lib/utils";

export type Stat = { value: number; suffix?: string; label: string; desc?: string };

/**
 * Big counted numbers under a rule: two by two on phones and tablets (so four
 * of them fit one screen), four in a row from lg, with hairlines between columns.
 */
export function StatGrid({ items, className }: { items: Stat[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-y-8 border-t border-border sm:gap-y-12 lg:grid-cols-4", className)}>
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            "reveal border-border pt-6 pr-4 sm:pt-10 sm:pr-8",
            i % 2 === 1 && "border-l pl-5 sm:pl-8",
            i % 2 === 0 && i % 4 !== 0 && "lg:border-l lg:pl-8"
          )}
        >
          <div className="text-[2.75rem] leading-none font-medium tracking-tight tabular-nums sm:text-6xl lg:text-7xl">
            <Counter value={item.value} />
            <span className="text-primary-text">{item.suffix}</span>
          </div>
          <p className="mt-4 text-sm sm:mt-5 sm:text-base">{item.label}</p>
          {item.desc ? <p className="mt-1 text-xs leading-5 text-muted-foreground sm:mt-1.5 sm:text-sm">{item.desc}</p> : null}
        </div>
      ))}
    </div>
  );
}
