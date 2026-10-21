import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getCase, listCases } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/site/page-hero";
import { RichText } from "@/components/site/rich-text";
import { Cover, LinkNode, PillLink, SectionHead } from "@/components/site/kit";
import { CaseCard } from "@/components/site/case-card";
import { TileRows } from "@/components/site/media-tile";
import { MediaCarousel } from "@/components/site/media-carousel";
import { CtaSection } from "@/components/site/cta-section";
import { coverSrc, cn } from "@/lib/utils";
import copy from "@/content/copy.json";

export const revalidate = 120;

export async function generateStaticParams() {
  const cases = await listCases();
  return cases.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCase(slug);
  if (!item) return {};
  return buildMetadata({
    title: item.title,
    description: item.summary,
    path: `/cases/${slug}`,
    images: [coverSrc("case", item)],
  });
}

export default async function CaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getCase(slug);
  if (!item) notFound();

  const others = (await listCases()).filter((c) => c.slug !== slug).slice(0, 3);

  const facts = [
    { label: copy.cases.client, value: item.client },
    { label: copy.cases.industry, value: item.industry },
    { label: copy.cases.year, value: String(item.year) },
    { label: copy.cases.location, value: item.location },
  ].filter((f) => f.value);

  return (
    <>
      <PageHero
        eyebrow={item.industry}
        title={item.title}
        description={item.summary}
        crumbs={[{ label: copy.nav.cases, href: "/cases" }, { label: item.title }]}
      >
        <dl className="intro mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border pt-8 sm:grid-cols-4" style={{ animationDelay: "280ms" }}>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-muted-foreground">{fact.label}</dt>
              <dd className="mt-2 text-base">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      <section className="theme-white section-y">
        <div className="container-x">
          {item.media?.length ? (
            <MediaCarousel items={item.media} title={item.title} sizes="(max-width: 1024px) 100vw, (max-width: 1408px) 75vw, 1000px" />
          ) : (
            <Cover
              src={coverSrc("case", item)}
              alt={item.title}
              sizes="(max-width: 1408px) 100vw, 1408px"
              priority
              className="aspect-video rounded-(--radius)"
            />
          )}

          {item.metrics.length > 0 ? (
            // Three across on every screen: on phones the type shrinks instead of stacking.
            <div className="mt-10 grid grid-cols-3 gap-y-6 border-t border-border sm:mt-16 sm:gap-y-10">
              {item.metrics.map((metric, i) => (
                <div
                  key={metric.label}
                  className={cn("reveal pt-6 pr-3 sm:pt-10 sm:pr-6", i % 3 !== 0 && "border-l border-border pl-4 sm:pl-8")}
                >
                  <div className="text-[1.625rem] leading-tight font-medium tracking-tight tabular-nums sm:text-5xl lg:text-6xl">
                    {metric.value}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground sm:mt-4 sm:text-sm">{metric.label}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-20 grid gap-16 lg:grid-cols-12">
            <RichText content={item.content} className="lg:col-span-7" />

            <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
              {item.scope.length > 0 ? (
                <div>
                  <h2 className="text-sm text-muted-foreground">{copy.cases.scope}</h2>
                  <ul className="mt-4 divide-y divide-border border-y border-border">
                    {item.scope.map((s) => (
                      <li key={s} className="flex items-center gap-3 py-3.5 text-sm text-body">
                        <LinkNode className="size-2" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {item.tags.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="outline" size="md">
                        {tag}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : null}
              <PillLink href="/contact" size="default">
                {copy.home.cta.primary}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </PillLink>
            </aside>
          </div>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="theme-light section-y">
          <div className="container-x">
            <SectionHead
              eyebrow={copy.cases.title}
              title={copy.cases.related}
              action={
                <PillLink href="/cases" variant="outline">
                  {copy.common.viewAll}
                  <ArrowRight />
                </PillLink>
              }
            />
            <TileRows
              items={others}
              pattern={[3]}
              className="mt-14"
              render={(other) => <CaseCard item={other} size="md" sizes="(max-width: 768px) 100vw, 45vw" />}
            />
          </div>
        </section>
      ) : null}

      <CtaSection />
    </>
  );
}
