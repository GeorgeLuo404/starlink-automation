import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getArticle, listArticles } from "@/lib/data";
import { ViewCounter } from "@/components/site/view-counter";
import { PageHero } from "@/components/site/page-hero";
import { RichText } from "@/components/site/rich-text";
import { ArticleCard } from "@/components/site/article-card";
import { localeHref } from "@/components/site/nav-items";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const { items } = await listArticles({ page: 1, pageSize: 50 });
  return ["zh", "en"].flatMap((locale) => items.map((item) => ({ locale, slug: item.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = await getArticle(slug);
  if (!article) return {};
  return buildMetadata({
    locale,
    title: article.title[locale],
    description: article.excerpt[locale],
    path: `/news/${slug}`,
    images: [`/media/article-${slug}.svg`],
    type: "article",
    publishedTime: article.publishedAt,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const article = await getArticle(slug);
  if (!article) notFound();

  const { items: related } = await listArticles({ page: 1, pageSize: 4 });
  const others = related.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero
        locale={locale}
        eyebrow={article.category[locale]}
        title={article.title[locale]}
        crumbs={[
          { label: dict.nav.news, href: localeHref(locale, "/news") },
          { label: article.title[locale] },
        ]}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.6875rem] tracking-wider text-faint">
          <span>{formatDate(article.publishedAt, locale)}</span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {article.readMinutes} {dict.news.minRead}
          </span>
          {typeof article.views === "number" && article.views > 0 ? (
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {article.views}
            </span>
          ) : null}
        </div>
      </PageHero>

      <ViewCounter slug={slug} />

      <article className="container-x py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="relative aspect-video overflow-hidden rounded-(--radius) border border-border">
            <Image
              src={`/media/article-${slug}.svg`}
              alt={article.title[locale]}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>

          <RichText content={article.content[locale]} className="mt-12" />

          {article.tags.length > 0 ? (
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-border pt-8">
              <span className="font-mono text-[0.625rem] tracking-[0.14em] text-faint uppercase">
                {dict.common.tags}
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-1 font-mono text-[0.625rem] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <Link
            href={localeHref(locale, "/news")}
            className="btn btn-ghost mt-10 inline-flex h-10 px-4"
          >
            <ArrowLeft className="size-4" />
            {dict.common.backToList}
          </Link>
        </div>

        {others.length > 0 ? (
          <div className="mt-20 border-t border-border pt-14">
            <h2 className="text-display text-2xl text-white">{dict.common.relatedTitle}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {others.map((item) => (
                <ArticleCard key={item.slug} article={item} locale={locale} dict={dict} />
              ))}
            </div>
          </div>
        ) : null}
      </article>
    </>
  );
}
