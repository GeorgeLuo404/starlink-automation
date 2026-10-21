import { ArrowRight } from "lucide-react";
import type { ServiceContent } from "@/content/defaults";
import { PillLink, SectionHead, highlight } from "../kit";
import { ServiceCard } from "../service-card";
import { TileRows } from "../media-tile";
import copy from "@/content/copy.json";

/** 业务能力 — two wide tiles, then rows of three. */
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

        <TileRows
          items={services}
          pattern={[2, 3]}
          className="mt-16"
          render={(service, i, row) => (
            <ServiceCard
              service={service}
              index={i}
              size={row === 0 ? "lg" : "md"}
              sizes={row === 0 ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 45vw"}
            />
          )}
        />
      </div>
    </section>
  );
}
