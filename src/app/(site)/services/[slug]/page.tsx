import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, FileCheck2 } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getService, listServices } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { RichText } from "@/components/site/rich-text";
import { ServiceIcon } from "@/components/site/service-icon";
import { Reveal } from "@/components/motion";
import { coverSrc } from "@/lib/utils";
import copy from "@/content/copy.json";

export const revalidate = 120;

export async function generateStaticParams() {
  const services = await listServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return buildMetadata({
    title: service.title,
    description: service.summary,
    path: `/services/${slug}`,
    images: [coverSrc("service", service)],
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const others = (await listServices()).filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={copy.services.eyebrow}
        title={service.title}
        description={service.summary}
        crumbs={[
          { label: copy.nav.services, href: "/services" },
          { label: service.title },
        ]}
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/contact" className="btn btn-primary">
            {copy.services.detailCta}
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/cases" className="btn btn-ghost">
            {copy.nav.cases}
          </Link>
        </div>
      </PageHero>

      <div className="container-x py-16 md:py-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="relative aspect-video overflow-hidden rounded-(--radius) border border-border">
              <Image
                src={coverSrc("service", service)}
                alt={service.title}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="mt-12">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary" />
                <span className="text-eyebrow text-primary">{copy.services.capabilities}</span>
              </div>
              <RichText content={service.content} className="mt-8" />
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <div className="card-industrial p-7">
                <div className="flex items-center gap-4">
                  <span className="inline-flex size-11 items-center justify-center rounded-(--radius) border border-border bg-card text-primary">
                    <ServiceIcon name={service.icon} className="size-5" />
                  </span>
                  <h2 className="text-base font-semibold text-white">{copy.services.capabilities}</h2>
                </div>
                <ul className="mt-6 space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-body">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-industrial p-7">
                <div className="flex items-center gap-4">
                  <span className="inline-flex size-11 items-center justify-center rounded-(--radius) border border-border bg-card text-primary">
                    <FileCheck2 className="size-5" strokeWidth={1.5} />
                  </span>
                  <h2 className="text-base font-semibold text-white">{copy.services.deliverables}</h2>
                </div>
                <ul className="mt-6 space-y-3">
                  {service.deliverables.map((item) => (
                    <li key={item} className="border-l border-border pl-4 text-sm text-body">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-(--radius) border border-primary/25 bg-primary/6 p-7">
                <h2 className="text-base font-semibold text-white">{copy.home.cta.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-subtle">{copy.home.cta.desc}</p>
                <Link href="/contact" className="btn btn-primary mt-6 w-full">
                  {copy.home.cta.primary}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {service.faq.length > 0 ? (
          <div className="mt-20 border-t border-border pt-14">
            <h2 className="text-display text-2xl text-white">{copy.services.faqTitle}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {service.faq.map((entry) => (
                <Reveal key={entry.q}>
                  <div className="card-industrial h-full p-6">
                    <h3 className="text-sm font-semibold text-white">{entry.q}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{entry.a}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}

        {others.length > 0 ? (
          <div className="mt-20 border-t border-border pt-14">
            <h2 className="text-display text-2xl text-white">{copy.common.relatedTitle}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {others.map((item) => (
                <Link
                  key={item.slug}
                  href={`/services/${item.slug}`}
                  className="card-industrial corner-ticks group p-6"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-(--radius) border border-border bg-card text-primary">
                    <ServiceIcon name={item.icon} className="size-4" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-white transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[0.8125rem] text-muted-foreground">{item.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary">
                    {copy.common.viewDetail}
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
