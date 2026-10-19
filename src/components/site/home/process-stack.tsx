import type { CSSProperties } from "react";
import type { ProcessStep } from "@/content/defaults";
import { Badge } from "@/components/ui/badge";
import { SectionHead } from "../kit";
import { stepArt } from "./step-art";

/**
 * 六步交付 · 折叠堆叠 — six equal, short cards, each a shade darker than the one
 * before. Scrolling, each card sticks one strip lower than its predecessor, so
 * the next slides over it and leaves only its title strip: the steps fold into
 * a stack, which then scrolls away as one block. Pure CSS; sizes, sticky
 * offsets and the staggered wrappers live in globals.css (.process-stack).
 */
export function HomeProcess({
  eyebrow,
  title,
  lead,
  steps,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  steps: ProcessStep[];
}) {
  const total = String(steps.length).padStart(2, "0");
  // % of the text colour mixed into the black: lightest first, darkest last
  const shadeOf = (i: number) => `color-mix(in oklab, var(--background), var(--foreground) ${18 - i * 2.8}%)`;

  return (
    <section className="theme-dark border-t border-border">
      <div className="container-x pt-[clamp(5.5rem,10vw,9.5rem)] pb-16">
        <SectionHead eyebrow={eyebrow} title={title} lead={lead} />
      </div>

      <div className="process-stack" style={{ "--steps": steps.length } as CSSProperties}>
        {steps.map((step, i) => {
          const Art = stepArt[i];
          return (
            // Each card gets its own wrapper (its sticky containing block); see .process-stack in globals.css.
            <div key={step.no} className="process-slot" style={{ "--i": i } as CSSProperties}>
              <article
                className="process-step border-t border-border shadow-[0_-24px_40px_-24px_rgba(0,0,0,0.6)]"
                style={
                  {
                    backgroundColor: shadeOf(i),
                    // hairlines a touch lighter than the band, so they show on the grey
                    "--border": "color-mix(in oklab, var(--foreground) 11%, transparent)",
                  } as CSSProperties
                }
              >
                <div className="container-x">
                  {/* The strip that stays visible once the next step folds over this one. */}
                  <div className="flex h-(--strip) items-center justify-between gap-6 border-b border-border">
                    <div className="flex items-baseline gap-5">
                      <span className="text-sm text-primary tabular-nums">{step.no}</span>
                      <h3 className="text-lg font-medium">{step.title}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      阶段 {step.no} / {total}
                    </span>
                  </div>

                  <div className="process-step-body grid gap-8 py-8 lg:grid-cols-12 lg:items-stretch lg:gap-12 lg:py-7">
                    <div className="flex flex-col justify-between gap-8 lg:col-span-7">
                      <p className="max-w-xl text-xl leading-[1.55] font-medium lg:text-[1.625rem]">{step.desc}</p>
                      <div>
                        <p className="text-xs tracking-widest text-muted-foreground">输出物</p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {step.outputs.map((o) => (
                            <li key={o}>
                              <Badge variant="tag" size="lg">
                                {o}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex lg:col-span-5 lg:justify-end">
                      <div className="process-step-art grid-lines grid-lines-sm aspect-[3/2] w-full max-w-sm rounded-xl border border-border p-3 text-foreground">
                        {Art ? <Art /> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
              <div className="process-step-spacer" aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
