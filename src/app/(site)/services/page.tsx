import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getPageContent } from "@/lib/page-content";
import { listServices } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { Cover, LinkNode, PillLink } from "@/components/site/kit";
import { ServiceIcon } from "@/components/site/service-icon";
import { HomeProcess } from "@/components/site/home/process-stack";
import { CtaSection } from "@/components/site/cta-section";
import { coverSrc, cn } from "@/lib/utils";
import copy from "@/content/copy.json";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const header = await getPageContent("services.header");
  return buildMetadata({ title: copy.nav.services, description: header.lead, path: "/services" });
}

export default async function ServicesPage() {
  const [services, header, process] = await Promise.all([listServices(), getPageContent("services.header"), getPageContent("home.process")]);

  return (
    <>
      <PageHero
        eyebrow={header.eyebrow}
        title={header.title}
        description={header.lead}
        crumbs={[{ label: copy.nav.services }]}
      />

      <section className="theme-white section-y">
        <div className="container-x divide-y divide-border">
          {services.map((service, i) => (
            <article key={service.slug} className="reveal grid gap-10 py-14 first:pt-0 last:pb-0 lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-20">
              <Link href={`/services/${service.slug}`} className={cn("group block lg:col-span-6", i % 2 === 1 && "lg:order-2")}>
                <Cover
                  src={coverSrc("service", service)}
                  alt={service.title}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={i === 0}
                  className="rounded-(--radius)"
                />
              </Link>

              <div className="lg:col-span-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-px w-8 bg-border" aria-hidden="true" />
                  <ServiceIcon name={service.icon} className="size-4 text-primary-text" />
                </div>
                <h2 className="title-2 mt-6 text-[clamp(1.875rem,3vw,2.75rem)]">
                  <Link href={`/services/${service.slug}`} className="transition-colors hover:text-primary-text">
                    {service.title}
                  </Link>
                </h2>
                <p className="lead mt-5 max-w-xl">{service.summary}</p>

                <p className="mt-9 text-xs tracking-widest text-muted-foreground">{copy.services.capabilities}</p>
                <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {service.features.slice(0, 6).map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-body">
                      <LinkNode className="size-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap gap-3">
                  <PillLink href={`/services/${service.slug}`} size="default">
                    {copy.common.viewDetail}
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </PillLink>
                  <PillLink href="/contact" variant="outline" size="default">
                    {copy.services.detailCta}
                  </PillLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <HomeProcess eyebrow={process.eyebrow} title={process.title} lead={process.desc} steps={process.steps} />
      <CtaSection />
    </>
  );
}
