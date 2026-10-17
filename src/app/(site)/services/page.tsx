import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { listServices } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { ServiceIcon } from "@/components/site/service-icon";
import { Reveal } from "@/components/motion";
import { coverSrc } from "@/lib/utils";
import copy from "@/content/copy.json";

export const revalidate = 120;

export const metadata: Metadata = buildMetadata({
  title: copy.services.title,
  description: copy.services.lead,
  path: "/services",
});

export default async function ServicesPage() {
  const services = await listServices();

  return (
    <>
      <PageHero
        eyebrow={copy.services.eyebrow}
        title={copy.services.title}
        description={copy.services.lead}
        crumbs={[{ label: copy.nav.services }]}
      />

      <div className="container-x py-16 md:py-24">
        <div className="space-y-4">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={0.04}>
              <Link
                href={`/services/${service.slug}`}
                className="card-industrial corner-ticks group grid gap-8 overflow-hidden p-7 lg:grid-cols-12 lg:p-9"
              >
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex size-12 items-center justify-center rounded-(--radius) border border-border bg-card text-primary">
                      <ServiceIcon name={service.icon} className="size-5" />
                    </span>
                    <span className="font-mono text-xs tracking-[0.2em] text-ghost">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="text-display mt-6 text-2xl text-white lg:text-3xl">
                    {service.title}
                  </h2>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                    {service.summary}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {copy.services.detailCta}
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>

                <div className="lg:col-span-4">
                  <h3 className="text-eyebrow">{copy.services.capabilities}</h3>
                  <ul className="mt-5 space-y-2.5">
                    {service.features.slice(0, 6).map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-body">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative aspect-16/10 overflow-hidden rounded-(--radius) border border-border lg:col-span-3 lg:aspect-auto lg:min-h-full">
                  <Image
                    src={coverSrc("service", service)}
                    alt={service.title}
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
