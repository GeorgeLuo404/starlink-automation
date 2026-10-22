import type { CSSProperties } from "react";
import { ART_H, ART_W, type Drawing, type Tone } from "@/lib/line-art/geometry";
import { cn } from "@/lib/utils";

/** One cycle of the draw-in loop: strokes draw in over the first part, then the drawing holds. */
const CYCLE = 7;

/**
 * A line-art drawing (src/lib/line-art) drawn inline: strokes in the text
 * colour of the section, the live parts in the accent. The cover placeholders
 * in public/media are the same drawings written to files.
 *
 * `animated` draws it in stroke by stroke on a loop (art-draw in globals.css),
 * accent last, then dots and labels pop in — the process-step illustrations.
 * Dashed strokes stay as drawn. Reduced motion leaves it fully drawn.
 */
export function LineArt({ drawing, className, animated = false }: { drawing: Drawing; className?: string; animated?: boolean }) {
  const total = drawing.strokes.length;
  // Spread the starts over the first ~40% of the cycle, in drawing order.
  const delayOf = (index: number) => `${((index / Math.max(total, 1)) * CYCLE * 0.4).toFixed(2)}s`;
  const motion = (index: number): CSSProperties => ({ "--d": `${CYCLE}s`, "--delay": delayOf(index) }) as CSSProperties;

  const group = (tone: Tone) =>
    drawing.strokes.flatMap((s, i) =>
      s.tone !== tone
        ? []
        : [
            <path
              key={`${tone}-${i}`}
              d={s.d}
              strokeDasharray={s.dash}
              vectorEffect="non-scaling-stroke"
              {...(animated && !s.dash ? { pathLength: 1, className: "art-draw", style: motion(i) } : {})}
            />,
          ]
    );
  const late = (index: number, count: number): CSSProperties | undefined =>
    animated ? ({ "--d": `${CYCLE}s`, "--delay": `${(CYCLE * 0.3 + (index / Math.max(count, 1)) * CYCLE * 0.15).toFixed(2)}s` } as CSSProperties) : undefined;

  return (
    <svg viewBox={`0 0 ${ART_W} ${ART_H}`} fill="none" className={cn("h-auto w-full", className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth={1} strokeLinejoin="round" strokeLinecap="round">
        <g opacity={0.22}>{group("faint")}</g>
        <g opacity={0.78}>{group("base")}</g>
      </g>
      <g className="stroke-primary" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round">
        {group("accent")}
      </g>
      {drawing.dots?.map((p, i, all) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r}
          className={cn(p.tone === "accent" ? "fill-primary" : "fill-current", animated && "art-pop")}
          opacity={p.opacity}
          style={late(i, all.length)}
        />
      ))}
      {drawing.labels?.map((l, i, all) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          fontSize={l.size ?? 7}
          textAnchor={l.anchor}
          className={cn(l.mono && "font-mono", l.tone === "accent" ? "fill-primary" : "fill-current", animated && "art-pop")}
          fillOpacity={l.tone === "accent" ? 1 : 0.5}
          style={late(i, all.length)}
        >
          {l.text}
        </text>
      ))}
    </svg>
  );
}
