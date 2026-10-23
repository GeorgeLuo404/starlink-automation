import { getPageContent } from "@/lib/page-content";
import { Eyebrow, highlight } from "../kit";
import { StatGrid } from "../stat-grid";

/** 方法 + 数据 — the approach in one sentence, then the numbers. Text from 后台 → 首页 → 理念与数据. */
export async function HomeStatement() {
  const t = await getPageContent("home.statement");
  return (
    <section className="theme-white section-y">
      <div className="container-x">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        {/* One line per clause, so the sentence breaks at the comma; plain wrapping (not
            balance) keeps the words of a clause whole on phones. */}
        <p className="title-2 reveal mt-8 max-w-5xl text-wrap">
          {t.text.split(/(?<=，)/).map((clause, i) => (
            <span key={i} className="block">
              {highlight(clause, t.accent)}
            </span>
          ))}
        </p>

        <StatGrid items={t.stats} className="mt-12 sm:mt-16 lg:mt-20" />
      </div>
    </section>
  );
}
