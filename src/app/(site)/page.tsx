import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { HomeHero } from "@/components/site/home/hero";
import { HomeStatement } from "@/components/site/home/statement";
import { HomeServices } from "@/components/site/home/services-grid";
import { HomeStats } from "@/components/site/home/stats";
import { HomeProcess } from "@/components/site/home/process";
import { HomeCases } from "@/components/site/home/featured-cases";
import { IntegrationOrbit } from "@/components/site/home/integration-orbit";
import { HomeWhy } from "@/components/site/home/why-accordion";
import { HomePartners } from "@/components/site/home/partners-marquee";
import { HomeNews } from "@/components/site/home/latest-news";
import { HomeGallery } from "@/components/site/home/gallery-strip";
import { HomeCta } from "@/components/site/home/cta-band";
import { getSiteSettings } from "@/lib/data";
import copy from "@/content/copy.json";

export const metadata: Metadata = buildMetadata({
  title: `${copy.meta.siteName} | ${copy.meta.tagline}`,
  description: copy.meta.description,
  path: "/",
});

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <HomeHero
        videoUrl={settings.heroVideoUrl}
        posterUrl={settings.heroPosterUrl ?? undefined}
      />
      <HomeStatement />
      <HomeServices />
      <HomeStats />
      <HomeProcess />
      <HomeCases />
      <IntegrationOrbit />
      <HomeWhy />
      <HomePartners />
      <HomeNews />
      <HomeGallery />
      <HomeCta />
    </>
  );
}
