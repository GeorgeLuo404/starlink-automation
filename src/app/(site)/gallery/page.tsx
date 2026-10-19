import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { listGallery } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { EmptyState, FilterLink } from "@/components/site/kit";
import copy from "@/content/copy.json";

export const revalidate = 120;

export const metadata: Metadata = buildMetadata({
  title: copy.gallery.title,
  description: copy.gallery.lead,
  path: "/gallery",
});

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ album?: string }> }) {
  const { album } = await searchParams;

  const all = await listGallery();
  const albums = [...new Set(all.map((item) => item.album))];
  const items = album ? all.filter((item) => item.album === album) : all;

  return (
    <>
      <PageHero
        eyebrow={copy.gallery.eyebrow}
        title={copy.home.gallery.title}
        description={copy.gallery.lead}
        crumbs={[{ label: copy.nav.gallery }]}
      >
        <nav className="intro mt-10 flex flex-wrap items-center gap-2" aria-label={copy.gallery.albums} style={{ animationDelay: "280ms" }}>
          <FilterLink href="/gallery" active={!album}>
            {copy.gallery.albums}
          </FilterLink>
          {albums.map((name) => (
            <FilterLink key={name} href={`/gallery?album=${encodeURIComponent(name)}`} active={album === name}>
              {name}
            </FilterLink>
          ))}
        </nav>
      </PageHero>

      <section className="theme-dark section-y pt-4 md:pt-6">
        <div className="container-x">
          {items.length === 0 ? <EmptyState hint={copy.common.emptyHint} /> : <GalleryGrid items={items} />}
        </div>
      </section>
    </>
  );
}
