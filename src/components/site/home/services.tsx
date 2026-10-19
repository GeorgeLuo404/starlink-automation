import { ArrowRight } from "lucide-react";
import type { ServiceContent } from "@/content/defaults";
import { PillLink, SectionHead, highlight } from "../kit";
import { ServiceCard } from "../service-card";
import copy from "@/content/copy.json";

/** 业务能力 — two wide cards, then three. */
export function HomeServices({ services }: { services: ServiceContent[] }) {
  const t = copy.home.services;
  return (
    <section className="theme-dark section-y">
      <div className="container-x">
        <SectionHead
          eyebrow={t.eyebrow}
          title={
            <>
              从图纸到整线，
              <br />
              {highlight("一条完整的交付链路", "交付链路")}
            </>
          }
          lead={t.desc}
          action={
            <PillLink href="/services" variant="outline">
              {t.cta}
              <ArrowRight />
            </PillLink>
          }
        />

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {services.map((service, i) => (
            <ServiceCard
              key={service.slug}
              service={service}
              index={i}
              large={i < 2}
              className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
