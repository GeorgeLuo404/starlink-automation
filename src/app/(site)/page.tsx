import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { listArticles, listCases, listPartners, listServices } from "@/lib/data";
import { processSteps, whyItems } from "@/content/defaults";
import { HomeHero } from "@/components/site/home/hero";
import { HomeStatement } from "@/components/site/home/statement";
import { HomeServices } from "@/components/site/home/services";
import { HomeProcess } from "@/components/site/home/process-stack";
import { HomeCases } from "@/components/site/home/cases";
import { HomeIntegration } from "@/components/site/home/integration";
import { HomeWhy } from "@/components/site/home/why";
import { HomeNews } from "@/components/site/home/news";
import { CtaSection } from "@/components/site/cta-section";
import copy from "@/content/copy.json";

export const revalidate = 120;

export const metadata: Metadata = buildMetadata({
  title: `${copy.meta.siteName} | ${copy.meta.tagline}`,
  description: copy.meta.description,
  path: "/",
});

/**
 * 首页 / Home. Rhythm: black hero → white statement → black services and
 * process → paper cases → black integration → white reasons → paper news →
 * the closing card.
 */
export default async function HomePage() {
  const [services, cases, articles, partners] = await Promise.all([
    listServices(),
    listCases({ limit: 5 }),
    listArticles({ page: 1, pageSize: 3 }),
    listPartners(),
  ]);

  return (
    <>
      <HomeHero />
      <HomeStatement />
      <HomeServices services={services} />
      <HomeProcess
        eyebrow={copy.home.process.eyebrow}
        title={copy.home.process.title}
        lead={copy.home.process.desc}
        steps={processSteps}
      />
      <HomeCases cases={cases} />
      <HomeIntegration partners={partners} />
      <HomeWhy items={whyItems} />
      <HomeNews articles={articles.items} />
      <CtaSection />
    </>
  );
}
