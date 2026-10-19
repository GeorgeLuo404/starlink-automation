import { Badge } from "@/components/ui/badge";
import { Eyebrow, SectionHead, highlight } from "../kit";
import copy from "@/content/copy.json";

const PROTOCOLS = ["PROFINET", "EtherCAT", "EtherNet/IP", "Modbus TCP", "CC-Link IE", "OPC UA"];

/** 集成能力 + 合作伙伴 — what we connect, then the brands we work with. */
export function HomeIntegration({ partners }: { partners: { name: string; nameZh: string }[] }) {
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
        <div className="mask-fade-x mt-10 overflow-hidden">
          <div className="flex w-max animate-marquee gap-16 pr-16">
            {row.map((p, i) => (
              <span key={`${p.name}-${i}`} className="flex items-baseline gap-3 whitespace-nowrap" aria-hidden={i >= partners.length}>
                <span className="text-3xl font-medium text-muted-foreground lg:text-4xl">{p.name}</span>
                {p.nameZh ? <span className="text-sm text-muted-foreground/70">{p.nameZh}</span> : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
