import type { Dictionary, Locale } from "@/lib/i18n";
import { listPartners } from "@/lib/data";
import { Marquee } from "@/components/motion";

export async function HomePartners({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const partners = await listPartners();
  const t = dict.home.partners;
  const half = Math.ceil(partners.length / 2);
  const rowA = partners.slice(0, half);
  const rowB = partners.slice(half);

  const renderRow = (items: typeof partners) =>
    items.map((partner) => (
      <div
        key={partner.name}
        className="group mx-4 flex min-w-44 flex-col items-center justify-center rounded-(--radius) border border-border bg-surface px-6 py-5 transition-colors hover:border-primary/30"
      >
        <span className="font-mono text-sm tracking-[0.12em] text-body transition-colors group-hover:text-white">
          {partner.name}
        </span>
        <span className="mt-1.5 text-[0.6875rem] text-faint">{partner.sub[locale]}</span>
      </div>
    ));

  return (
    <section className="section-y relative overflow-hidden bg-surface">
      <div className="container-x relative">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-primary" />
          <span className="text-eyebrow text-primary">{t.eyebrow}</span>
        </div>
        <h2 className="text-display mt-5 text-2xl text-white sm:text-3xl">{t.title}</h2>
      </div>

      <div className="mask-fade-x mt-12 space-y-4">
        <Marquee duration={58}>{renderRow(rowA)}</Marquee>
        {rowB.length > 0 ? (
          <Marquee duration={64} reverse>
            {renderRow(rowB)}
          </Marquee>
        ) : null}
      </div>
    </section>
  );
}
