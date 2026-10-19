import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { listArticleCategories, listArticles } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/page-hero";
import { ArticleCard } from "@/components/site/article-card";
import { EmptyState, FilterLink } from "@/components/site/kit";
import { cn } from "@/lib/utils";
import copy from "@/content/copy.json";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({ title: copy.news.title, description: copy.news.lead, path: "/news" });

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const category = sp.category?.trim() || undefined;
  const query = sp.q?.trim() || undefined;

  const [{ items, total, totalPages }, categories] = await Promise.all([
    listArticles({ page, pageSize: 9, category, query }),
    listArticleCategories(),
  ]);

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { category, q: query, page: String(page), ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value && !(key === "page" && value === "1")) next.set(key, value);
    }
    const qs = next.toString();
    return `/news${qs ? `?${qs}` : ""}`;
  };

  const pager = (disabled: boolean) => cn("h-10 px-5", disabled && "pointer-events-none opacity-40");

  return (
    <>
      <PageHero
        eyebrow={copy.news.eyebrow}
        title={copy.home.news.title}
        description={copy.news.lead}
        crumbs={[{ label: copy.nav.news }]}
      >
        <div className="intro mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between" style={{ animationDelay: "280ms" }}>
          <nav className="flex flex-wrap items-center gap-2" aria-label={copy.common.category}>
            <FilterLink href={buildQuery({ category: undefined, page: undefined })} active={!category}>
              {copy.common.all}
            </FilterLink>
            {categories.map((cat) => (
              <FilterLink key={cat.slug} href={buildQuery({ category: cat.slug, page: undefined })} active={category === cat.slug}>
                {cat.name}
              </FilterLink>
            ))}
          </nav>

          <form action="/news" className="flex w-full max-w-sm gap-2" role="search">
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <Input
              type="search"
              name="q"
              defaultValue={query ?? ""}
              placeholder={copy.common.searchPlaceholder}
              className="h-10 rounded-full px-5"
              aria-label={copy.common.search}
            />
            <Button type="submit" variant="outline" size="icon" shape="pill" className="shrink-0" aria-label={copy.common.search}>
              <Search />
            </Button>
          </form>
        </div>
      </PageHero>

      <section className="theme-light section-y">
        <div className="container-x">
          {items.length === 0 ? (
            <EmptyState title={copy.common.empty} hint={copy.common.emptyHint} />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((article, i) => (
                  <ArticleCard key={article.slug} article={article} priority={i < 3} />
                ))}
              </div>

              {totalPages > 1 ? (
                <nav className="mt-16 flex items-center justify-between border-t border-border pt-8" aria-label="Pagination">
                  <Button asChild variant="outline" shape="pill" className={pager(page <= 1)}>
                    <Link href={buildQuery({ page: String(Math.max(1, page - 1)) })} aria-disabled={page <= 1}>
                      <ChevronLeft />
                      {copy.common.prev}
                    </Link>
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {copy.common.page} {page} / {totalPages} 页 · 共 {total} 篇
                  </span>
                  <Button asChild variant="outline" shape="pill" className={pager(page >= totalPages)}>
                    <Link href={buildQuery({ page: String(Math.min(totalPages, page + 1)) })} aria-disabled={page >= totalPages}>
                      {copy.common.next}
                      <ChevronRight />
                    </Link>
                  </Button>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </section>
    </>
  );
}
