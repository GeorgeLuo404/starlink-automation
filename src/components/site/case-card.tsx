import Link from "next/link";
import type { CaseContent } from "@/content/defaults";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { coverSrc, cn } from "@/lib/utils";
import { CornerArrow, Cover } from "./kit";

/**
 * A delivered project. `lead` spans two columns with the cover beside the
 * text; the rest stack the cover on top.
 */
export function CaseCard({ item, lead = false, priority, className }: { item: CaseContent; lead?: boolean; priority?: boolean; className?: string }) {
  return (
    <Link href={`/cases/${item.slug}`} className={cn("reveal group block", lead && "lg:col-span-2", className)}>
      <Card className={cn("h-full p-2 transition-colors group-hover:border-lifted", lead && "lg:grid lg:grid-cols-2")}>
        <div className={cn("relative", lead && "lg:order-2")}>
          <Cover
            src={coverSrc("case", item)}
            alt={item.title}
            sizes={lead ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 100vw, 50vw"}
            priority={priority}
            className={lead ? "lg:aspect-auto lg:h-full lg:min-h-96" : undefined}
          />
          <CornerArrow className="absolute top-4 right-4" />
        </div>

        <div className={cn("flex flex-1 flex-col px-4 pt-6 pb-5 lg:px-6 lg:pb-6", lead && "lg:justify-between lg:p-10")}>
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="tag" size="md">
                {item.industry}
              </Badge>
              <span>
                {item.year} · {item.location}
              </span>
            </div>
            <h3 className={lead ? "title-2 mt-8 text-[clamp(1.75rem,2.6vw,2.5rem)]" : "title-3 mt-5"}>{item.title}</h3>
            <p className={cn("mt-4 text-sm leading-7 text-muted-foreground", !lead && "line-clamp-2")}>{item.summary}</p>
          </div>

          {item.metrics.length > 0 ? (
            <div className={cn("grid grid-cols-3 gap-4 border-t border-border pt-6", lead ? "mt-10" : "mt-7")}>
              {item.metrics.slice(0, 3).map((m) => (
                <div key={m.label}>
                  <div className={cn("font-medium tabular-nums", lead ? "text-3xl lg:text-4xl" : "text-xl")}>{m.value}</div>
                  <div className="mt-1.5 text-xs text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
