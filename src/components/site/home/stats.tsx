import type { Dictionary } from "@/lib/i18n";
import { Counter, Stagger, StaggerItem } from "@/components/motion";

export function HomeStats({ dict }: { dict: Dictionary }) {
  const t = dict.home.stats;
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface">
      <div className="grid-blueprint absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="container-x relative py-16 md:py-20">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-primary" />
          <span className="text-eyebrow text-primary">{t.eyebrow}</span>
          <span className="text-eyebrow">/ {t.title}</span>
        </div>

        <Stagger className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4" gap={0.12}>
          {t.items.map((item) => (
            <StaggerItem key={item.label}>
              <div className="border-l border-border pl-6">
                <div className="text-display text-5xl text-white tabular-nums lg:text-6xl">
                  <Counter value={item.value} />
                  <span className="text-primary">{item.suffix}</span>
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">{item.label}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
