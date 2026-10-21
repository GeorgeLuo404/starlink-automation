import { ArrowRight } from "lucide-react";
import type { CaseContent } from "@/content/defaults";
import { PillLink, SectionHead } from "../kit";
import { CaseCard } from "../case-card";
import { TileRows } from "../media-tile";
import copy from "@/content/copy.json";

/** 项目案例 — the lead project wide, the rest two by two. */
export function HomeCases({ cases }: { cases: CaseContent[] }) {
  if (!cases.length) return null;
  const t = copy.home.cases;
  return (
    <section className="theme-light section-y">
      <div className="container-x">
        <SectionHead
          eyebrow={t.eyebrow}
          title={t.title}
          lead={t.desc}
          action={
            <PillLink href="/cases" variant="outline">
              {copy.common.viewAll}
              <ArrowRight />
            </PillLink>
          }
        />
        <TileRows items={cases} pattern={[1, 2]} className="mt-16" render={(item, i) => <CaseCard item={item} lead={i === 0} />} />
      </div>
    </section>
  );
}
