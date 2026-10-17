import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { listCases } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { Stagger, StaggerItem } from "@/components/motion";
import { coverSrc } from "@/lib/utils";
import copy from "@/content/copy.json";

export const revalidate = 120;

export const metadata: Metadata = buildMetadata({
  title: copy.cases.title,
  description: copy.cases.lead,
  path: "/cases",
});

export default async function CasesPage() {
  const cases = await listCases();

  return (
    <>
      <PageHero
        eyebrow={copy.cases.eyebrow}
        title={copy.cases.title}
        description={copy.cases.lead}
        crumbs={[{ label: copy.nav.cases }]}
      />

      <div className="container-x py-16 md:py-24">
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" gap={0.08}>
          {cases.map((item) => (
            <StaggerItem key={item.slug} className="h-full">
              <Link
                href={`/cases/${item.slug}`}
                className="card-industrial corner-ticks group flex h-full flex-col overflow-hidden"
              >
                <div className="relative aspect-16/10 overflow-hidden">
                  <Image
                    src={coverSrc("case", item)}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background/85 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 rounded-full border border-primary/25 bg-background/80 px-2.5 py-1 font-mono text-[0.625rem] tracking-wider text-primary backdrop-blur-sm">
                    {item.industry}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 font-mono text-[0.625rem] tracking-wider text-faint">
                    <span>{item.year}</span>
                    <span>·</span>
                    <span>{item.location}</span>
                  </div>
                  <h2 className="mt-3.5 line-clamp-2 text-base leading-snug font-semibold text-white transition-colors group-hover:text-primary">
                    {item.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 flex-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>

                  {item.metrics.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4">
                      {item.metrics.slice(0, 3).map((metric) => (
                        <div key={metric.value}>
                          <div className="text-sm font-semibold text-primary tabular-nums">
                            {metric.value}
                          </div>
                          <div className="mt-0.5 text-[0.625rem] text-muted-foreground">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    {copy.common.viewDetail}
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </>
  );
}
