import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/site/brand-mark";
import { Eyebrow, SectionHead, richTitle } from "../kit";
import type { PartnerContent } from "@/content/defaults";
import { getPageContent } from "@/lib/page-content";

/** 集成能力 + 支持的品牌与平台 — what we connect, then the brands we work with. */
export async function HomeIntegration({ partners }: { partners: PartnerContent[] }) {
  const [t, brands] = await Promise.all([getPageContent("home.integration"), getPageContent("home.partners")]);
  const row = [...partners, ...partners];
  return (
    <section className="theme-dark section-y overflow-hidden">
      <div className="container-x">
        <SectionHead eyebrow={t.eyebrow} title={richTitle(t.title, t.titleAccent)} lead={t.desc} />

        <div className="mt-16 grid gap-px overflow-hidden rounded-(--radius) border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {t.nodes.map((node, i) => (
            <div key={i} className="reveal flex items-center justify-between bg-background px-6 py-7">
              <span className="text-base">{node}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            </div>
          ))}
        </div>

        {t.protocols.length ? (
          <div className="mt-10 flex flex-wrap gap-2.5">
            {t.protocols.map((p, i) => (
              <Badge key={i} variant="outline" size="lg" className="px-4 py-2 text-sm">
                {p}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-24">
        <div className="container-x">
          <Eyebrow>{brands.eyebrow}</Eyebrow>
        </div>
        <div className="mask-fade-x mt-12 overflow-hidden">
          {/* Hovering pauses the row so a name can be read. */}
          <ul className="flex w-max animate-marquee gap-12 pr-12 hover:paused">
            {row.map((p, i) => (
              <li
                key={`${p.name}-${i}`}
                className="group flex min-w-44 flex-col items-center gap-4"
                aria-hidden={i >= partners.length || undefined}
              >
                <BrandMark name={p.name} logoUrl={p.logoUrl} />
                {p.nameZh ? (
                  <span className="text-base whitespace-nowrap text-muted-foreground transition-colors group-hover:text-foreground">
                    {p.nameZh}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        {brands.note ? <p className="container-x mt-12 text-xs text-faint">{brands.note}</p> : null}
      </div>
    </section>
  );
}
