import { ScrollHighlightText } from "@/components/motion";
import type { Dictionary } from "@/lib/i18n";

export function HomeStatement({ dict }: { dict: Dictionary }) {
  const t = dict.home.statement;
  return (
    <section className="section-y relative overflow-hidden border-y border-border bg-surface">
      <div className="grid-blueprint-fine absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="container-x relative">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-primary" />
          <span className="text-eyebrow text-primary">{t.eyebrow}</span>
        </div>
        <ScrollHighlightText
          text={t.text}
          className="text-display mt-10 max-w-5xl text-[1.75rem] leading-[1.35] text-white sm:text-4xl sm:leading-[1.3] lg:text-[3.25rem] lg:leading-[1.24]"
        />
      </div>
    </section>
  );
}
