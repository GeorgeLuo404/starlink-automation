import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getService, listServices } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/site/page-hero";
import { RichText } from "@/components/site/rich-text";
import { Cover, Eyebrow, LinkNode, PillLink, SectionHead } from "@/components/site/kit";
import { ServiceCard } from "@/components/site/service-card";
import { TileRows } from "@/components/site/media-tile";
import { MediaCarousel } from "@/components/site/media-carousel";
import { CtaSection } from "@/components/site/cta-section";
import { coverSrc } from "@/lib/utils";
import copy from "@/content/copy.json";

export const revalidate = 120;

export async function generateStaticParams() {
  const services = await listServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const all = await listServices();
  const index = Math.max(0, all.findIndex((item) => item.slug === slug));
  const others = all.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={`${copy.services.title} · ${String(index + 1).padStart(2, "0")}`}
        title={service.title}
        description={service.summary}
        crumbs={[{ label: copy.nav.services, href: "/services" }, { label: service.title }]}
        aside={
          <Cover
            src={coverSrc("service", service)}
            alt={service.title}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="rounded-(--radius) border border-border"
          />
        }
      >
        <div className="intro mt-10 flex flex-wrap gap-3" style={{ animationDelay: "280ms" }}>
          <PillLink href="/contact">
            {copy.services.detailCta}
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </PillLink>
          <PillLink href="/cases" variant="outline">
            {copy.nav.cases}
          </PillLink>
        </div>
      </PageHero>

      <section className="theme-white section-y">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>{copy.services.overview}</Eyebrow>
            <RichText content={service.content} className="mt-8" />
          </div>

          <aside className="lg:col-span-5">
            <div className="space-y-4 lg:sticky lg:top-28">
              <Card className="p-7 lg:p-8">
                <h2 className="title-3">{copy.services.capabilities}</h2>
                <ul className="mt-6 divide-y divide-border border-t border-border">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 py-3.5 text-sm text-body">
                      <LinkNode className="size-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
              {service.deliverables.length > 0 ? (
                <Card className="p-7 lg:p-8">
                  <h2 className="title-3">{copy.services.deliverables}</h2>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {service.deliverables.map((item) => (
                      <li key={item}>
                        <Badge variant="tag" size="lg" className="bg-background">
                          {item}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      {service.media?.length ? (
        <section className="theme-dark section-y">
          <div className="container-x">
            <SectionHead eyebrow={service.title} title={copy.services.media} lead={copy.services.mediaLead} />
            <div className="mt-14">
              <MediaCarousel items={service.media} title={service.title} sizes="(max-width: 1024px) 100vw, (max-width: 1408px) 75vw, 1000px" />
            </div>
          </div>
        </section>
      ) : null}

      {service.faq.length > 0 ? (
        <section className="theme-light section-y">
          <div className="container-x">
            <SectionHead eyebrow={service.title} title={copy.services.faqTitle} />
            <div className="mt-14 grid gap-x-12 gap-y-12 md:grid-cols-2">
              {service.faq.map((entry, i) => (
                <div key={entry.q} className="reveal border-t border-border pt-7">
                  <span className="text-sm text-primary-text tabular-nums">Q{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="title-3 mt-4 text-lg">{entry.q}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-7 text-muted-foreground">{entry.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section className="theme-dark section-y">
          <div className="container-x">
            <SectionHead
              eyebrow={copy.services.title}
              title={copy.services.others}
              action={
                <PillLink href="/services" variant="outline">
                  {copy.common.viewAll}
                  <ArrowRight />
                </PillLink>
              }
            />
            <TileRows
              items={others}
              pattern={[3]}
              className="mt-14"
              render={(item) => (
                <ServiceCard service={item} index={all.indexOf(item)} size="md" sizes="(max-width: 768px) 100vw, 45vw" />
              )}
            />
          </div>
        </section>
      ) : null}

      <CtaSection />
    </>
  );
}
