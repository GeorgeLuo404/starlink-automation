import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getPageContent } from "@/lib/page-content";
import { listCases } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { CaseCard } from "@/components/site/case-card";
import { TileRows } from "@/components/site/media-tile";
import { EmptyState } from "@/components/site/kit";
import { CtaSection } from "@/components/site/cta-section";
import copy from "@/content/copy.json";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const header = await getPageContent("cases.header");
  return buildMetadata({ title: copy.nav.cases, description: header.lead, path: "/cases" });
}

export default async function CasesPage() {
  const [cases, header] = await Promise.all([listCases(), getPageContent("cases.header")]);

  return (
    <>
      <PageHero
        eyebrow={header.eyebrow}
        title={header.title}
        description={header.lead}
        crumbs={[{ label: copy.nav.cases }]}
      />

      <section className="theme-light section-y">
        <div className="container-x">
          {cases.length === 0 ? (
            <EmptyState title={copy.common.empty} hint={copy.common.emptyHint} />
          ) : (
            <TileRows
              items={cases}
              pattern={[1, 2]}
              // The first rows sit above the fold and hold the page's LCP image.
              render={(item, i) => <CaseCard item={item} lead={i === 0} priority={i < 3} />}
            />
          )}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
