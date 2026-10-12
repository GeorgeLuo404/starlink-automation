import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildMetadata({
    locale,
    title: `${dict.meta.siteName} | ${dict.meta.tagline}`,
    description: dict.meta.description,
    path: "/",
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <>
      <HomeHero locale={locale} dict={dict} />
      <HomeStatement dict={dict} />
      <HomeServices locale={locale} dict={dict} />
      <HomeStats dict={dict} />
      <HomeProcess locale={locale} dict={dict} />
      <HomeCases locale={locale} dict={dict} />
      <IntegrationOrbit dict={dict} />
      <HomeWhy locale={locale} dict={dict} />
      <HomePartners dict={dict} />
      <HomeNews locale={locale} dict={dict} />
      <HomeGallery locale={locale} dict={dict} />
      <HomeCta locale={locale} dict={dict} />
    </>
  );
}
