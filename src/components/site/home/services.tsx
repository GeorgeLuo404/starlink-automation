import { ArrowRight } from "lucide-react";
import type { ServiceContent } from "@/content/defaults";
import { getPageContent } from "@/lib/page-content";
import { PillLink, SectionHead, richTitle } from "../kit";
import { ServiceCard } from "../service-card";
import { TileRows } from "../media-tile";

/** 业务能力 — two wide tiles, then rows of three. Heading from 后台 → 首页 → 业务能力. */
export async function HomeServices({ services }: { services: ServiceContent[] }) {
  const t = await getPageContent("home.services");
  return (
    <section className="theme-dark section-y">
      <div className="container-x">
        <SectionHead
          eyebrow={t.eyebrow}
          title={richTitle(t.title, t.titleAccent)}
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
