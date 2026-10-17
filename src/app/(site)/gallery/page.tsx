import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listGallery } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { cn } from "@/lib/utils";
import copy from "@/content/copy.json";

export const revalidate = 120;

export const metadata: Metadata = buildMetadata({
  title: copy.gallery.title,
  description: copy.gallery.lead,
  path: "/gallery",
});

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ album?: string }>;
}) {
  const { album } = await searchParams;

  const all = await listGallery();
  const albums = [...new Set(all.map((item) => item.album))];
  const items = album ? all.filter((item) => item.album === album) : all;

  return (
    <>
      <PageHero
        eyebrow={copy.gallery.eyebrow}
        title={copy.gallery.title}
        description={copy.gallery.lead}
        crumbs={[{ label: copy.nav.gallery }]}
      >
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Link
            href="/gallery"
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
              !album
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-white"
            )}
          >
            {copy.gallery.albums}
          </Link>
          {albums.map((name) => (
            <Link
              key={name}
              href={`/gallery?album=${encodeURIComponent(name)}`}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                album === name
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-white"
              )}
            >
              {name}
            </Link>
          ))}
        </div>
      </PageHero>

      <div className="container-x py-16 md:py-20">
        {items.length === 0 ? (
          <div className="rounded-(--radius) border border-dashed border-border py-24 text-center">
            <p className="text-sm text-muted-foreground">{copy.common.emptyHint}</p>
          </div>
        ) : (
          <GalleryGrid items={items} />
        )}
      </div>
    </>
  );
}
