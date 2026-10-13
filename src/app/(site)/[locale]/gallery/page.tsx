import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { listGallery } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { localeHref } from "@/components/site/nav-items";
import { cn } from "@/lib/utils";

export const revalidate = 120;

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

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
    title: dict.gallery.title,
    description: dict.gallery.lead,
    path: "/gallery",
  });
}

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ album?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const { album } = await searchParams;

  const all = await listGallery();
  const albums = [...new Set(all.map((item) => item.album.zh))];
  const items = album ? all.filter((item) => item.album.zh === album) : all;

  return (
    <>
      <PageHero
        locale={locale}
        eyebrow={dict.gallery.eyebrow}
        title={dict.gallery.title}
        description={dict.gallery.lead}
        crumbs={[{ label: dict.nav.gallery }]}
      >
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Link
            href={localeHref(locale, "/gallery")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
              !album
                ? "border-[#22e0ff]/40 bg-[#22e0ff]/10 text-[#22e0ff]"
                : "border-[#1b1f27] text-muted-foreground hover:text-white"
            )}
          >
            {dict.gallery.albums}
          </Link>
          {albums.map((name) => (
            <Link
              key={name}
              href={`${localeHref(locale, "/gallery")}?album=${encodeURIComponent(name)}`}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                album === name
                  ? "border-[#22e0ff]/40 bg-[#22e0ff]/10 text-[#22e0ff]"
                  : "border-[#1b1f27] text-muted-foreground hover:text-white"
              )}
            >
              {name}
            </Link>
          ))}
        </div>
      </PageHero>

      <div className="container-x py-16 md:py-20">
        {items.length === 0 ? (
          <div className="rounded-(--radius) border border-dashed border-[#1b1f27] py-24 text-center">
            <p className="text-sm text-muted-foreground">{dict.common.emptyHint}</p>
          </div>
        ) : (
          <GalleryGrid items={items} locale={locale} />
        )}
      </div>
    </>
  );
}
