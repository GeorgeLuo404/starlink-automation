import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.starlink-auto.com";

/** SITE_NOINDEX=true keeps search engines out — for preview/MVP deployments. */
export const siteNoindex = process.env.SITE_NOINDEX === "true";

/** Page metadata; the site name in share cards comes from 站点设置. */
export async function buildMetadata({
  title,
  description,
  path = "",
  images,
  type = "website",
  publishedTime,
}: {
  title: string;
  description: string;
  path?: string;
  images?: string[];
  type?: "website" | "article";
  publishedTime?: string;
}): Promise<Metadata> {
  const { companyName } = await getSiteSettings();
  const url = `${siteUrl}${path === "/" ? "" : path}`;
  const ogImage = images?.[0] ?? "/media/og.svg";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: companyName,
      locale: "zh_CN",
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
