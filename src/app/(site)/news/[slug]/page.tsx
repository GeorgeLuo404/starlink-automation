import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Clock, Eye } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getArticle, listArticles } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { ViewCounter } from "@/components/site/view-counter";
import { PageHero } from "@/components/site/page-hero";
import { RichText } from "@/components/site/rich-text";
import { ArticleCard } from "@/components/site/article-card";
import { Cover, PillLink, SectionHead } from "@/components/site/kit";
import { coverSrc, formatDate } from "@/lib/utils";
import copy from "@/content/copy.json";

export const revalidate = 60;

export async function generateStaticParams() {
  const { items } = await listArticles({ page: 1, pageSize: 50 });
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${slug}`,
    images: [coverSrc("article", article)],
    type: "article",
    publishedTime: article.publishedAt,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const { items: related } = await listArticles({ page: 1, pageSize: 4 });
  const others = related.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={article.category}
        title={article.title}
        size="md"
        crumbs={[{ label: copy.nav.news, href: "/news" }, { label: article.title }]}
      >
        <div className="intro mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground" style={{ animationDelay: "200ms" }}>
          <span className="tabular-nums">{formatDate(article.publishedAt)}</span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {article.readMinutes} {copy.news.minRead}
          </span>
          {typeof article.views === "number" && article.views > 0 ? (
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {article.views} {copy.common.views}
            </span>
          ) : null}
        </div>
      </PageHero>

      <ViewCounter slug={slug} />

      <article className="theme-white section-y">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <Cover
              src={coverSrc("article", article)}
              alt={article.title}
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              className="aspect-16/9 rounded-(--radius)"
            />

            {article.excerpt ? <p className="title-3 mt-14 text-xl leading-relaxed text-body">{article.excerpt}</p> : null}
            <RichText content={article.content} className="mt-10" />

            {article.tags.length > 0 ? (
              <div className="mt-14 flex flex-wrap items-center gap-2 border-t border-border pt-8">
                <span className="mr-2 text-xs text-muted-foreground">{copy.common.tags}</span>
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" size="md">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            <PillLink href="/news" variant="outline" size="default" className="mt-10">
              <ArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
              {copy.common.backToList}
            </PillLink>
          </div>
        </div>
      </article>

      {others.length > 0 ? (
        <section className="theme-light section-y">
          <div className="container-x">
            <SectionHead
              eyebrow={copy.news.title}
              title={copy.common.relatedTitle}
              action={
                <PillLink href="/news" variant="outline">
                  {copy.common.viewAll}
                  <ArrowRight />
                </PillLink>
              }
            />
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {others.map((item) => (
                <ArticleCard key={item.slug} article={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
