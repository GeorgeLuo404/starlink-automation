import type { Metadata } from "next";
import { locales, localeOgLocale, type Locale } from "@/lib/i18n/config";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.starlink-auto.com";

export function buildMetadata({
  locale,
  title,
  description,
  path = "",
  images,
  type = "website",
  publishedTime,
}: {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
  images?: string[];
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const clean = path === "/" ? "" : path;
  const url = `${siteUrl}/${locale}${clean}`;
  const ogImage = images?.[0] ?? "/media/og.svg";

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [l === "zh" ? "zh-CN" : "en", `${siteUrl}/${l}${clean}`])
      ),
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: locale === "zh" ? "深圳市星链自动化有限公司" : "Shenzhen Starlink Automation Co., Ltd.",
      locale: localeOgLocale[locale],
      images: [{ url: ogImage, width: 1600, height: 1000, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
