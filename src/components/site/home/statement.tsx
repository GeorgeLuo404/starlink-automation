import { Counter } from "@/components/motion";
import { Eyebrow, highlight } from "../kit";
import copy from "@/content/copy.json";

/** 方法 + 数据 — the approach in one sentence, then the numbers. */
export function HomeStatement() {
  const t = copy.home;
  return (
    <section className="theme-white section-y">
      <div className="container-x">
        <Eyebrow>{t.statement.eyebrow}</Eyebrow>
        <p className="title-2 reveal mt-8 max-w-5xl">{highlight(t.statement.text, "可验证的模块")}</p>

        <div className="mt-20 grid gap-y-12 border-t border-border sm:grid-cols-2 lg:grid-cols-4">
          {t.stats.items.map((item) => (
            <div key={item.label} className="reveal border-border pt-10 sm:pr-8 lg:border-l lg:pl-8 lg:first:border-l-0 lg:first:pl-0">
              <div className="text-6xl font-medium tracking-tight tabular-nums lg:text-7xl">
                <Counter value={item.value} />
                <span className="text-primary-text">{item.suffix}</span>
              </div>
              <p className="mt-5 text-base">{item.label}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
