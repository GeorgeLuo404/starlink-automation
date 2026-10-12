import type { Dictionary } from "@/lib/i18n";
import { listPartners } from "@/lib/data";
import { Marquee } from "@/components/motion";

export async function HomePartners({ dict }: { dict: Dictionary }) {
  const partners = await listPartners();
  const t = dict.home.partners;
  const half = Math.ceil(partners.length / 2);
  const rowA = partners.slice(0, half);
  const rowB = partners.slice(half);

  const renderRow = (items: typeof partners) =>
    items.map((partner) => (
      <div
        key={partner.name}
        className="group mx-4 flex min-w-[11rem] flex-col items-center justify-center rounded-[var(--radius)] border border-[#1b1f27] bg-[#0a0b0e] px-6 py-5 transition-colors hover:border-[#22e0ff]/30"
      >
        <span className="font-mono text-sm tracking-[0.12em] text-[#c3c9d4] transition-colors group-hover:text-white">
          {partner.name}
        </span>
        <span className="mt-1.5 text-[0.6875rem] text-[#5c6472]">{partner.sub}</span>
      </div>
    ));

  return (
    <section className="section-y relative overflow-hidden bg-[#0a0b0e]">
      <div className="container-x relative">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-[#22e0ff]" />
          <span className="text-eyebrow text-[#22e0ff]">{t.eyebrow}</span>
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
