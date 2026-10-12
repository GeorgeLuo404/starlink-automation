import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { listArticles } from "@/lib/data";
import { localeHref } from "@/components/site/nav-items";
import { SectionHeading } from "@/components/site/section-heading";
import { ArticleCard } from "@/components/site/article-card";
import { Stagger, StaggerItem } from "@/components/motion";

export async function HomeNews({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { items } = await listArticles({ page: 1, pageSize: 3 });
  const t = dict.home.news;
  if (!items.length) return null;

  return (
    <section className="section-y relative">
      <div className="container-x">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          action={
            <Link href={localeHref(locale, "/news")} className="btn btn-ghost">
              {dict.common.viewAll}
              <ArrowRight className="size-4" />
            </Link>
          }
        />
        <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3" gap={0.1}>
          {items.map((article) => (
            <StaggerItem key={article.slug} className="h-full">
              <ArticleCard article={article} locale={locale} dict={dict} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
