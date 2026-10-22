import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings, listArticles, listCases, listPartners, listServices } from "@/lib/data";
import { getPageContent } from "@/lib/page-content";
import { HomeHero } from "@/components/site/home/hero";
import { HomeStatement } from "@/components/site/home/statement";
import { HomeServices } from "@/components/site/home/services";
import { HomeProcess } from "@/components/site/home/process-stack";
import { HomeCases } from "@/components/site/home/cases";
import { HomeIntegration } from "@/components/site/home/integration";
import { HomeWhy } from "@/components/site/home/why";
import { HomeNews } from "@/components/site/home/news";
import { CtaSection } from "@/components/site/cta-section";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const { companyName, seo } = await getSiteSettings();
  return buildMetadata({ title: `${companyName} | ${seo.tagline}`, description: seo.description, path: "/" });
}

/**
 * 首页 / Home. Rhythm: black hero → white statement → black services and
 * process → paper cases → black integration → white reasons → paper news →
 * the closing card.
 */
export default async function HomePage() {
  const [services, cases, articles, partners, process] = await Promise.all([
    listServices(),
    listCases({ limit: 5 }),
    listArticles({ page: 1, pageSize: 3 }),
    listPartners(),
    getPageContent("home.process"),
  ]);

  return (
    <>
      <HomeHero />
      <HomeStatement />
      <HomeServices services={services} />
      <HomeProcess eyebrow={process.eyebrow} title={process.title} lead={process.desc} steps={process.steps} />
      <HomeCases cases={cases} />
      <HomeIntegration partners={partners} />
      <HomeWhy />
      <HomeNews articles={articles.items} />
      <CtaSection />
    </>
  );
}
