import { ArrowRight } from "lucide-react";
import type { ArticleView } from "@/lib/data";
import { PillLink, SectionHead } from "../kit";
import { ArticleCard } from "../article-card";
import copy from "@/content/copy.json";

/** 新闻动态 — the latest three. */
export function HomeNews({ articles }: { articles: ArticleView[] }) {
  if (!articles.length) return null;
  return (
    <section className="theme-light section-y">
      <div className="container-x">
        <SectionHead
          eyebrow={copy.home.news.eyebrow}
          title={copy.home.news.title}
          action={
            <PillLink href="/news" variant="outline">
              {copy.common.viewAll}
              <ArrowRight />
            </PillLink>
          }
        />
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
