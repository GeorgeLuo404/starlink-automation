import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getCase, listCases } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { RichText } from "@/components/site/rich-text";
import { localeHref } from "@/components/site/nav-items";
import { Reveal } from "@/components/motion";

export const revalidate = 120;

export async function generateStaticParams() {
  const cases = await listCases();
  return ["zh", "en"].flatMap((locale) => cases.map((item) => ({ locale, slug: item.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const item = await getCase(slug);
  if (!item) return {};
  return buildMetadata({
    locale,
    title: item.title[locale],
    description: item.summary[locale],
    path: `/cases/${slug}`,
    images: [`/media/case-${slug}.svg`],
  });
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const item = await getCase(slug);
  if (!item) notFound();

  const others = (await listCases()).filter((c) => c.slug !== slug).slice(0, 3);

  const facts = [
    { label: dict.cases.client, value: item.client[locale] },
    { label: dict.cases.industry, value: item.industry[locale] },
    { label: dict.cases.year, value: String(item.year) },
    { label: dict.cases.location, value: item.location },
  ].filter((f) => f.value);

  return (
    <>
      <PageHero
        locale={locale}
        eyebrow={item.industry[locale]}
        title={item.title[locale]}
        description={item.summary[locale]}
        crumbs={[
          { label: dict.nav.cases, href: localeHref(locale, "/cases") },
          { label: item.title[locale] },
        ]}
      />

      <div className="container-x py-16 md:py-24">
        <Reveal>
          <div className="relative aspect-21/9 overflow-hidden rounded-[var(--radius)] border border-[#1b1f27]">
            <Image
              src={`/media/case-${item.slug}.svg`}
              alt={item.title[locale]}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </Reveal>

        <div className="mt-12 grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RichText content={item.content[locale]} />

            <div className="mt-14 border-t border-[#1b1f27] pt-10">
              <h2 className="text-display text-xl text-white">{dict.cases.scope}</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {item.scope.map((s) => (
                  <li key={s.zh} className="flex items-start gap-2.5 text-sm text-[#c3c9d4]">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-[#22e0ff]" />
                    {s[locale]}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="card-industrial divide-y divide-[#1b1f27]">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-baseline justify-between gap-4 p-5">
                    <span className="font-mono text-[0.625rem] tracking-[0.14em] text-[#5c6472] uppercase">
                      {fact.label}
                    </span>
                    <span className="text-right text-sm text-[#e8ebf0]">{fact.value}</span>
                  </div>
                ))}
              </div>

              {item.metrics.length > 0 ? (
                <div className="card-industrial p-6">
                  <h2 className="font-mono text-[0.625rem] tracking-[0.14em] text-[#5c6472] uppercase">
                    {dict.cases.results}
                  </h2>
                  <div className="mt-5 space-y-4">
                    {item.metrics.map((metric) => (
                      <div key={metric.value} className="flex items-baseline justify-between gap-4">
                        <span className="text-sm text-[#8a929e]">{metric.label[locale]}</span>
                        <span className="text-xl font-semibold text-[#22e0ff] tabular-nums">{metric.value}</span>
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
                      className="rounded-full border border-[#1b1f27] px-3 py-1 font-mono text-[0.625rem] text-[#8a929e]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="rounded-[var(--radius)] border border-[#22e0ff]/25 bg-[#22e0ff]/6 p-6">
                <h2 className="text-sm font-semibold text-white">{dict.home.cta.title}</h2>
                <Link href={localeHref(locale, "/contact")} className="btn btn-primary mt-5 w-full">
                  {dict.home.cta.primary}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {others.length > 0 ? (
          <div className="mt-20 border-t border-[#1b1f27] pt-14">
            <h2 className="text-display text-2xl text-white">{dict.cases.related}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={localeHref(locale, `/cases/${other.slug}`)}
                  className="card-industrial corner-ticks group flex gap-4 p-5"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius)]">
                    <Image src={`/media/case-${other.slug}.svg`} alt={other.title[locale]} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-[0.625rem] tracking-wider text-[#22e0ff]">
                      {other.industry[locale]}
                    </span>
                    <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-white transition-colors group-hover:text-[#22e0ff]">
                      {other.title[locale]}
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
