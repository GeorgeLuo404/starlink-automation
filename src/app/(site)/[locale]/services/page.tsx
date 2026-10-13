import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { listServices } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { ServiceIcon } from "@/components/site/service-icon";
import { localeHref } from "@/components/site/nav-items";
import { Reveal } from "@/components/motion";

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
    title: dict.services.title,
    description: dict.services.lead,
    path: "/services",
  });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const services = await listServices();

  return (
    <>
      <PageHero
        locale={locale}
        eyebrow={dict.services.eyebrow}
        title={dict.services.title}
        description={dict.services.lead}
        crumbs={[{ label: dict.nav.services }]}
      />

      <div className="container-x py-16 md:py-24">
        <div className="space-y-4">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={0.04}>
              <Link
                href={localeHref(locale, `/services/${service.slug}`)}
                className="card-industrial corner-ticks group grid gap-8 overflow-hidden p-7 lg:grid-cols-12 lg:p-9"
              >
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex size-12 items-center justify-center rounded-(--radius) border border-[#1b1f27] bg-[#0d0f13] text-[#22e0ff]">
                      <ServiceIcon name={service.icon} className="size-5" />
                    </span>
                    <span className="font-mono text-xs tracking-[0.2em] text-[#3d4552]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="text-display mt-6 text-2xl text-white lg:text-3xl">
                    {service.title[locale]}
                  </h2>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                    {service.summary[locale]}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#22e0ff]">
                    {dict.services.detailCta}
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>

                <div className="lg:col-span-4">
                  <h3 className="text-eyebrow">{dict.services.capabilities}</h3>
                  <ul className="mt-5 space-y-2.5">
                    {service.features.slice(0, 6).map((feature) => (
                      <li key={feature.zh} className="flex items-start gap-2.5 text-sm text-[#c3c9d4]">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-[#22e0ff]" />
                        {feature[locale]}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative aspect-16/10 overflow-hidden rounded-(--radius) border border-[#1b1f27] lg:col-span-3 lg:aspect-auto lg:min-h-full">
                  <Image
                    src={`/media/service-${service.slug}.svg`}
                    alt={service.title[locale]}
                    fill
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
