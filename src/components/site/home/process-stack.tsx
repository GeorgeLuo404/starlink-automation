import type { CSSProperties } from "react";
import type { ProcessStep } from "@/content/defaults";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SectionHead } from "../kit";
import { stepArtFor } from "./step-art";

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
  /** Numbered by position ("01", "02" …); `art` is the chosen illustration's key ("" for none). */
  steps: (Omit<ProcessStep, "no"> & { art?: string })[];
}) {
  const no = (i: number) => String(i + 1).padStart(2, "0");
  const total = no(steps.length - 1);
  // % of the text colour mixed into the black: lightest first, darkest last
  const shadeOf = (i: number) => `color-mix(in oklab, var(--background), var(--foreground) ${18 - i * 2.8}%)`;

  return (
    <section className="theme-dark border-t border-border">
      <div className="container-x section-y pb-12 sm:pb-16">
        <SectionHead eyebrow={eyebrow} title={title} lead={lead} />
      </div>

      <div className="process-stack" style={{ "--steps": steps.length } as CSSProperties}>
        {steps.map((step, i) => {
          const Art = stepArtFor(step.art);
          return (
            // Each card gets its own wrapper (its sticky containing block); see .process-stack in globals.css.
            <div key={i} className="process-slot" style={{ "--i": i } as CSSProperties}>
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
                      <span className="text-sm text-primary tabular-nums">{no(i)}</span>
                      <h3 className="text-base font-medium sm:text-lg">{step.title}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      阶段 {no(i)} / {total}
                    </span>
                  </div>

                  {/* Phones: compact text and one row of small tags, so the drawing keeps most of the card. */}
                  <div className="process-step-body grid grid-cols-1 gap-4 py-4 sm:gap-8 sm:py-8 lg:grid-cols-12 lg:items-stretch lg:gap-12 lg:py-7">
                    <div className={cn("flex flex-col justify-between gap-4 sm:gap-8", Art ? "lg:col-span-7" : "lg:col-span-12")}>
                      <p className="max-w-xl text-base leading-[1.6] font-medium sm:text-xl sm:leading-[1.55] lg:text-[1.625rem]">
                        {step.desc}
                      </p>
                      {step.outputs.length ? (
                        <div>
                          <p className="text-xs tracking-widest text-muted-foreground">输出物</p>
                          <ul className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                            {step.outputs.map((o, j) => (
                              <li key={j}>
                                <Badge variant="tag" size="md" className="sm:px-3.5 sm:py-1.5 sm:text-[0.8125rem]">
                                  {o}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                    {Art ? (
                      <div className="flex min-h-0 lg:col-span-5 lg:justify-end">
                        <div className="process-step-art grid-lines grid-lines-sm aspect-3/2 w-full max-w-sm rounded-xl border border-border p-3 text-foreground">
                          <Art />
                        </div>
                      </div>
                    ) : null}
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
