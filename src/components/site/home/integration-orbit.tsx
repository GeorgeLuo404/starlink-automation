"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { integrationNodes } from "@/content/defaults";
import { LogoMark } from "@/components/site/logo";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

/**
 * 集成能力环形示意图 / Integration orbit diagram
 *
 * Eight capability nodes orbit a central control core. The inner label of each
 * node counter-rotates so text always stays upright — the same trick the
 * reference site uses for its ecosystem diagram.
 */
export function IntegrationOrbit({ dict }: { dict: Dictionary }) {
  const t = dict.home.integration;
  const [active, setActive] = useState<number | null>(null);
  const nodes = integrationNodes;
  const step = 360 / nodes.length;

  return (
    <section className="section-y relative overflow-hidden border-y border-[#1b1f27] bg-[#0a0b0e]">
      <div className="grid-blueprint absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="container-x relative">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#22e0ff]" />
              <span className="text-eyebrow text-[#22e0ff]">{t.eyebrow}</span>
            </div>
            <Reveal delay={0.06}>
              <h2 className="text-display mt-5 text-3xl text-white sm:text-4xl">{t.title}</h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-[#8a929e]">{t.desc}</p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2.5">
                {nodes.map((node, i) => (
                  <button
                    key={node}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    className={cn(
                      "flex items-center gap-2.5 py-1 text-left text-sm transition-colors",
                      active === i ? "text-[#22e0ff]" : "text-[#8a929e]"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full transition-colors",
                        active === i ? "bg-[#22e0ff]" : "bg-[#2a303b]"
                      )}
                    />
                    {node}
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <p className="mt-8 border-t border-[#1b1f27] pt-5 font-mono text-[0.6875rem] leading-relaxed tracking-wide text-[#5c6472]">
                {t.footnote}
              </p>
            </Reveal>
          </div>

          {/* Diagram ------------------------------------------------- */}
          <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
            {/* Static rings */}
            <div className="absolute inset-0 rounded-full border border-[#1b1f27]" aria-hidden="true" />
            <div className="absolute inset-[12%] rounded-full border border-[#1b1f27]" aria-hidden="true" />
            <div className="absolute inset-[24%] rounded-full border border-dashed border-[#1b1f27]" aria-hidden="true" />

            {/* Spokes */}
            <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden="true">
              {nodes.map((_, i) => {
                const angle = ((i * step - 90) * Math.PI) / 180;
                const x = 200 + Math.cos(angle) * 150;
                const y = 200 + Math.sin(angle) * 150;
                return (
                  <line
                    key={i}
                    x1="200"
                    y1="200"
                    x2={x}
                    y2={y}
                    stroke={active === i ? "rgba(34,224,255,0.65)" : "rgba(255,255,255,0.09)"}
                    strokeWidth="1"
                    className={active === i ? "dash-flow" : undefined}
                  />
                );
              })}
            </svg>

            {/* Slow counter-rotating decorative ring */}
            <div className="orbit-cw-fast absolute inset-[6%]" aria-hidden="true">
              <div className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[#22e0ff]/70" />
              <div className="absolute bottom-0 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#22e0ff]/40" />
            </div>
            <div className="orbit-ccw absolute inset-[18%]" aria-hidden="true">
              <div className="absolute top-1/2 left-0 size-1 -translate-y-1/2 rounded-full bg-[#22e0ff]/50" />
              <div className="absolute top-1/2 right-0 size-1.5 -translate-y-1/2 rounded-full bg-[#22e0ff]/60" />
            </div>

            {/* Orbiting nodes — the frame rotates one way, each label
                counter-rotates so the text always stays upright. */}
            <div className="orbit-ccw absolute inset-0">
              {nodes.map((node, i) => {
                const radians = ((i * step - 90) * Math.PI) / 180;
                return (
                  <div
                    key={node}
                    className="absolute"
                    style={{
                      left: `${50 + 42 * Math.cos(radians)}%`,
                      top: `${50 + 42 * Math.sin(radians)}%`,
                    }}
                  >
                    <div className="orbit-cw">
                      <div className="-translate-x-1/2 -translate-y-1/2">
                        <button
                          type="button"
                          onMouseEnter={() => setActive(i)}
                          onMouseLeave={() => setActive(null)}
                          className={cn(
                            "rounded-full border px-2.5 py-1.5 font-mono text-[0.5625rem] tracking-wide whitespace-nowrap transition-all duration-300 sm:px-3 sm:text-[0.625rem]",
                            active === i
                              ? "border-[#22e0ff]/60 bg-[#22e0ff]/15 text-[#22e0ff]"
                              : "border-[#1b1f27] bg-[#0a0b0e]/92 text-[#8a929e]"
                          )}
                        >
                          {node}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Centre */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex size-32 flex-col items-center justify-center rounded-full border border-[#22e0ff]/30 bg-[#08090b] text-center lg:size-36">
                <span className="absolute inset-0 animate-pulse-ring rounded-full border border-[#22e0ff]/30" />
                <LogoMark className="size-8" />
                <span className="mt-2 text-xs font-semibold text-white">{t.centerLabel}</span>
                <span className="mt-0.5 font-mono text-[0.5625rem] tracking-[0.16em] text-[#5c6472] uppercase">
                  {t.centerSub}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
