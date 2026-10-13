import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { listCases } from "@/lib/data";
import { localeHref } from "@/components/site/nav-items";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

export async function HomeCases({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const cases = await listCases({ limit: 5 });
  const [lead, ...rest] = cases;
  const t = dict.home.cases;
  if (!lead) return null;

  return (
    <section className="section-y relative">
      <div className="container-x">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.desc}
          action={
            <Link href={localeHref(locale, "/cases")} className="btn btn-ghost">
              {dict.common.viewAll}
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <Reveal className="mt-14">
          <Link
            href={localeHref(locale, `/cases/${lead.slug}`)}
            className="card-industrial corner-ticks group grid overflow-hidden lg:grid-cols-2"
          >
            <div className="relative aspect-16/10 overflow-hidden lg:aspect-auto lg:min-h-104">
              <Image
                src={`/media/case-${lead.slug}.svg`}
                alt={lead.title[locale]}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/70 to-transparent lg:bg-linear-to-r" />
            </div>

            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#22e0ff]/25 bg-[#22e0ff]/8 px-2.5 py-1 font-mono text-[0.625rem] tracking-wider text-[#22e0ff]">
                  {lead.industry[locale]}
                </span>
                <span className="font-mono text-[0.625rem] tracking-wider text-[#5c6472]">
                  {lead.year} · {lead.location}
                </span>
              </div>

              <h3 className="text-display mt-6 text-2xl text-white lg:text-3xl">{lead.title[locale]}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{lead.summary[locale]}</p>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#1b1f27] pt-6">
                {lead.metrics.map((metric) => (
                  <div key={metric.value}>
                    <div className="text-xl font-semibold text-[#22e0ff] tabular-nums">{metric.value}</div>
                    <div className="mt-1 text-[0.6875rem] text-muted-foreground">{metric.label[locale]}</div>
                  </div>
                ))}
              </div>

              <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-white">
                {dict.common.viewDetail}
                <ArrowUpRight className="size-4 text-[#22e0ff] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        </Reveal>

        <Stagger className="mt-6 grid gap-6 md:grid-cols-2" gap={0.1}>
          {rest.map((item) => (
            <StaggerItem key={item.slug}>
              <Link
                href={localeHref(locale, `/cases/${item.slug}`)}
                className="card-industrial group corner-ticks flex h-full gap-5 overflow-hidden p-5"
              >
                <div className="relative size-24 shrink-0 overflow-hidden rounded-(--radius) sm:size-28">
                  <Image
                    src={`/media/case-${item.slug}.svg`}
                    alt={item.title[locale]}
                    fill
                    sizes="120px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-mono text-[0.625rem] tracking-wider text-[#5c6472]">
                    <span className="text-[#22e0ff]">{item.industry[locale]}</span>
                    <span>·</span>
                    <span>{item.year}</span>
                  </div>
                  <h3 className="mt-2.5 line-clamp-2 text-base leading-snug font-semibold text-white">
                    {item.title[locale]}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
                    {item.summary[locale]}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
