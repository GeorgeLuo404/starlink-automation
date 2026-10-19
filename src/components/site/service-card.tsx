import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServiceContent } from "@/content/defaults";
import { Card } from "@/components/ui/card";
import { coverSrc, cn } from "@/lib/utils";
import { Cover, LinkNode } from "./kit";
import copy from "@/content/copy.json";

/** A service with its cover (uploaded photo, else the line-art placeholder). */
export function ServiceCard({
  service,
  index,
  large = false,
  className,
}: {
  service: ServiceContent;
  index: number;
  /** Wider card: bigger type, more features. */
  large?: boolean;
  className?: string;
}) {
  return (
    <Link href={`/services/${service.slug}`} className={cn("reveal group block", className)}>
      <Card className="h-full p-2 transition-colors group-hover:border-lifted">
        <Cover
          src={coverSrc("service", service)}
          alt={service.title}
          sizes={large ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        />
        <div className="flex flex-1 flex-col px-4 pt-6 pb-5 lg:px-6 lg:pb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-sm text-muted-foreground tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            <h3 className={large ? "title-3 lg:text-[1.625rem]" : "title-3"}>{service.title}</h3>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{service.summary}</p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {service.features.slice(0, large ? 4 : 3).map((f) => (
              <li key={f} className="flex items-center gap-2">
                <LinkNode className="size-2" />
                {f}
              </li>
            ))}
          </ul>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-7 text-sm">
            {copy.common.viewDetail}
            <ArrowUpRight className="size-4 text-primary-text transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
