import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { listCases } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { localeHref } from "@/components/site/nav-items";
import { Stagger, StaggerItem } from "@/components/motion";

export const revalidate = 120;

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildMetadata({
    locale,
    title: dict.cases.title,
    description: dict.cases.lead,
    path: "/cases",
  });
}

export default async function CasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const cases = await listCases();

  return (
    <>
      <PageHero
        locale={locale}
        eyebrow={dict.cases.eyebrow}
        title={dict.cases.title}
        description={dict.cases.lead}
        crumbs={[{ label: dict.nav.cases }]}
      />

      <div className="container-x py-16 md:py-24">
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" gap={0.08}>
          {cases.map((item) => (
            <StaggerItem key={item.slug} className="h-full">
              <Link
                href={localeHref(locale, `/cases/${item.slug}`)}
                className="card-industrial corner-ticks group flex h-full flex-col overflow-hidden"
              >
                <div className="relative aspect-16/10 overflow-hidden">
                  <Image
                    src={`/media/case-${item.slug}.svg`}
                    alt={item.title[locale]}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090b]/85 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 rounded-full border border-[#22e0ff]/25 bg-[#08090b]/80 px-2.5 py-1 font-mono text-[0.625rem] tracking-wider text-[#22e0ff] backdrop-blur-sm">
                    {item.industry[locale]}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 font-mono text-[0.625rem] tracking-wider text-[#5c6472]">
                    <span>{item.year}</span>
                    <span>·</span>
                    <span>{item.location}</span>
                  </div>
                  <h2 className="mt-3.5 line-clamp-2 text-base leading-snug font-semibold text-white transition-colors group-hover:text-[#22e0ff]">
                    {item.title[locale]}
                  </h2>
                  <p className="mt-3 line-clamp-3 flex-1 text-[0.8125rem] leading-relaxed text-[#8a929e]">
                    {item.summary[locale]}
                  </p>

                  {item.metrics.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#1b1f27] pt-4">
                      {item.metrics.slice(0, 3).map((metric) => (
                        <div key={metric.value}>
                          <div className="text-sm font-semibold text-[#22e0ff] tabular-nums">
                            {metric.value}
                          </div>
                          <div className="mt-0.5 text-[0.625rem] text-[#8a929e]">{metric.label[locale]}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#22e0ff]">
                    {dict.common.viewDetail}
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
