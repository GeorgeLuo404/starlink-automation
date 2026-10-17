import type { Metadata } from "next";
import copy from "@/content/copy.json";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.starlink-auto.com";

export function buildMetadata({
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
}): Metadata {
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
      siteName: copy.meta.siteName,
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
