import { Eyebrow, highlight } from "../kit";
import { StatGrid } from "../stat-grid";
import copy from "@/content/copy.json";

/** 方法 + 数据 — the approach in one sentence, then the numbers. */
export function HomeStatement() {
  const t = copy.home;
  return (
    <section className="theme-white section-y">
      <div className="container-x">
        <Eyebrow>{t.statement.eyebrow}</Eyebrow>
        {/* One line per clause, so the sentence breaks at the comma. Plain wrapping (not
            balance) and a size that fits ten characters on a 360px phone keep words whole. */}
        <p className="title-2 reveal mt-8 max-w-5xl text-wrap max-sm:text-[1.875rem]">
          {t.statement.text.split(/(?<=，)/).map((clause) => (
            <span key={clause} className="block">
              {highlight(clause, "可验证的模块")}
            </span>
          ))}
        </p>

        <StatGrid items={t.stats.items} className="mt-12 sm:mt-16 lg:mt-20" />
      </div>
    </section>
  );
}
