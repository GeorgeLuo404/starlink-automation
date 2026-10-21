import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/site/brand-mark";
import { Eyebrow, SectionHead, highlight } from "../kit";
import copy from "@/content/copy.json";
import type { PartnerContent } from "@/content/defaults";

const PROTOCOLS = ["PROFINET", "EtherCAT", "EtherNet/IP", "Modbus TCP", "CC-Link IE", "OPC UA"];

/** 集成能力 + 支持的品牌与平台 — what we connect, then the brands we work with. */
export function HomeIntegration({ partners }: { partners: PartnerContent[] }) {
  const t = copy.home.integration;
  const row = [...partners, ...partners];
  return (
    <section className="theme-dark section-y overflow-hidden">
      <div className="container-x">
        <SectionHead eyebrow={t.eyebrow} title={highlight(t.title, "一站式集成")} lead={t.desc} />

        <div className="mt-16 grid gap-px overflow-hidden rounded-(--radius) border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {t.nodes.map((node, i) => (
            <div key={node} className="reveal flex items-center justify-between bg-background px-6 py-7">
              <span className="text-base">{node}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-2.5">
          {PROTOCOLS.map((p) => (
            <Badge key={p} variant="outline" size="lg" className="px-4 py-2 text-sm">
              {p}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-24">
        <div className="container-x">
          <Eyebrow>{copy.home.partners.eyebrow}</Eyebrow>
        </div>
        <div className="mask-fade-x mt-12 overflow-hidden">
          {/* Hovering pauses the row so a name can be read. */}
          <ul className="flex w-max animate-marquee gap-12 pr-12 hover:[animation-play-state:paused]">
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
        <p className="container-x mt-12 text-xs text-faint">{copy.home.partners.note}</p>
      </div>
    </section>
  );
}
