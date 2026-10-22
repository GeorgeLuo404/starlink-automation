import { ArrowRight } from "lucide-react";
import type { ArticleView } from "@/lib/data";
import { getPageContent } from "@/lib/page-content";
import { PillLink, SectionHead } from "../kit";
import { ArticleCard } from "../article-card";
import copy from "@/content/copy.json";

/** 新闻动态 — the latest three. */
export async function HomeNews({ articles }: { articles: ArticleView[] }) {
  if (!articles.length) return null;
  const t = await getPageContent("home.news");
  return (
    <section className="theme-light section-y">
      <div className="container-x">
        <SectionHead
          eyebrow={t.eyebrow}
          title={t.title}
          action={
            <PillLink href="/news" variant="outline">
              {copy.common.viewAll}
              <ArrowRight />
            </PillLink>
          }
        />
        <div className="mt-16 grid gap-x-6 gap-y-12 md:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
