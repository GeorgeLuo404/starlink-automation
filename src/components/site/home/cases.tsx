import { ArrowRight } from "lucide-react";
import type { CaseContent } from "@/content/defaults";
import { PillLink, SectionHead } from "../kit";
import { CaseCard } from "../case-card";
import copy from "@/content/copy.json";

/** 项目案例 — the lead project wide, the rest two by two. */
export function HomeCases({ cases }: { cases: CaseContent[] }) {
  const [lead, ...rest] = cases;
  if (!lead) return null;
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
        <div className="mt-16 grid gap-4 lg:grid-cols-2">
          <CaseCard item={lead} lead />
          {rest.map((item) => (
            <CaseCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
