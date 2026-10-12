import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/seo";
import { listArticles, listCases, listServices } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/services", "/cases", "/news", "/gallery", "/downloads", "/about", "/contact"];

  const [services, cases, articles] = await Promise.all([
    listServices(),
    listCases(),
    listArticles({ page: 1, pageSize: 50 }),
  ]);

  const dynamicPaths = [
    ...services.map((s) => `/services/${s.slug}`),
    ...cases.map((c) => `/cases/${c.slug}`),
    ...articles.items.map((a) => `/news/${a.slug}`),
  ];

  const all = [...staticPaths, ...dynamicPaths];
  const now = new Date();

  return locales.flatMap((locale) =>
    all.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l === "zh" ? "zh-CN" : "en", `${siteUrl}/${l}${path}`])
        ),
      },
    }))
  );
}
