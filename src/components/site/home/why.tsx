import type { WhyItem } from "@/content/defaults";
import { SectionHead } from "../kit";
import copy from "@/content/copy.json";

/** 选择理由 — six reasons in a quiet grid. */
export function HomeWhy({ items }: { items: WhyItem[] }) {
  return (
    <section className="theme-white section-y">
      <div className="container-x">
        <SectionHead eyebrow={copy.home.why.eyebrow} title={copy.home.why.title} />
        <div className="mt-16 grid gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.no} className="reveal border-t border-border pt-7">
              <span className="text-sm text-primary-text tabular-nums">{item.no}</span>
              <h3 className="title-3 mt-5">{item.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-7 text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
