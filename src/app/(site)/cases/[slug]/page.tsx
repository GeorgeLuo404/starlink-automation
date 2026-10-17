import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getCase, listCases } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { RichText } from "@/components/site/rich-text";
import { Reveal } from "@/components/motion";
import { coverSrc } from "@/lib/utils";
import copy from "@/content/copy.json";

export const revalidate = 120;

export async function generateStaticParams() {
  const cases = await listCases();
  return cases.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
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

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
        crumbs={[
          { label: copy.nav.cases, href: "/cases" },
          { label: item.title },
        ]}
      />

      <div className="container-x py-16 md:py-24">
        <Reveal>
          <div className="relative aspect-21/9 overflow-hidden rounded-(--radius) border border-border">
            <Image
              src={coverSrc("case", item)}
              alt={item.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </Reveal>

        <div className="mt-12 grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RichText content={item.content} />

            <div className="mt-14 border-t border-border pt-10">
              <h2 className="text-display text-xl text-white">{copy.cases.scope}</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {item.scope.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-body">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="card-industrial divide-y divide-border">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-baseline justify-between gap-4 p-5">
                    <span className="font-mono text-[0.625rem] tracking-[0.14em] text-faint uppercase">
                      {fact.label}
                    </span>
                    <span className="text-right text-sm text-foreground">{fact.value}</span>
                  </div>
                ))}
              </div>

              {item.metrics.length > 0 ? (
                <div className="card-industrial p-6">
                  <h2 className="font-mono text-[0.625rem] tracking-[0.14em] text-faint uppercase">
                    {copy.cases.results}
                  </h2>
                  <div className="mt-5 space-y-4">
                    {item.metrics.map((metric) => (
                      <div key={metric.value} className="flex items-baseline justify-between gap-4">
                        <span className="text-sm text-muted-foreground">{metric.label}</span>
                        <span className="text-xl font-semibold text-primary tabular-nums">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {item.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-3 py-1 font-mono text-[0.625rem] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="rounded-(--radius) border border-primary/25 bg-primary/6 p-6">
                <h2 className="text-sm font-semibold text-white">{copy.home.cta.title}</h2>
                <Link href="/contact" className="btn btn-primary mt-5 w-full">
                  {copy.home.cta.primary}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {others.length > 0 ? (
          <div className="mt-20 border-t border-border pt-14">
            <h2 className="text-display text-2xl text-white">{copy.cases.related}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={`/cases/${other.slug}`}
                  className="card-industrial corner-ticks group flex gap-4 p-5"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-(--radius)">
                    <Image src={coverSrc("case", other)} alt={other.title} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-[0.625rem] tracking-wider text-primary">
                      {other.industry}
                    </span>
                    <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-white transition-colors group-hover:text-primary">
                      {other.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
