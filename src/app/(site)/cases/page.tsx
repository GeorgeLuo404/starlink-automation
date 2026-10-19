import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { listCases } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { CaseCard } from "@/components/site/case-card";
import { EmptyState } from "@/components/site/kit";
import { CtaSection } from "@/components/site/cta-section";
import copy from "@/content/copy.json";

export const revalidate = 120;

export const metadata: Metadata = buildMetadata({
  title: copy.cases.title,
  description: copy.cases.lead,
  path: "/cases",
});

export default async function CasesPage() {
  const cases = await listCases();

  return (
    <>
      <PageHero
        eyebrow={copy.cases.eyebrow}
        title={copy.home.cases.title}
        description={copy.cases.lead}
        crumbs={[{ label: copy.nav.cases }]}
      />

      <section className="theme-light section-y">
        <div className="container-x">
          {cases.length === 0 ? (
            <EmptyState title={copy.common.empty} hint={copy.common.emptyHint} />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {cases.map((item, i) => (
                // The first row sits above the fold and holds the page's LCP image.
                <CaseCard key={item.slug} item={item} lead={i === 0} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
