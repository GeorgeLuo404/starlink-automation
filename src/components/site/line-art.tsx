import { ART_H, ART_W, type Drawing, type Tone } from "@/lib/line-art/geometry";
import { cn } from "@/lib/utils";

/**
 * A line-art drawing (src/lib/line-art) drawn inline: strokes in the text
 * colour of the section, the live parts in the accent. The cover placeholders
 * in public/media are the same drawings written to files.
 */
export function LineArt({ drawing, className }: { drawing: Drawing; className?: string }) {
  const group = (tone: Tone) =>
    drawing.strokes
      .filter((s) => s.tone === tone)
      .map((s, i) => <path key={`${tone}-${i}`} d={s.d} strokeDasharray={s.dash} vectorEffect="non-scaling-stroke" />);
  return (
    <svg viewBox={`0 0 ${ART_W} ${ART_H}`} fill="none" className={cn("h-auto w-full", className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth={1} strokeLinejoin="round" strokeLinecap="round">
        <g opacity={0.22}>{group("faint")}</g>
        <g opacity={0.78}>{group("base")}</g>
      </g>
      <g className="stroke-primary" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round">
        {group("accent")}
      </g>
      {drawing.dots?.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r}
          className={p.tone === "accent" ? "fill-primary" : "fill-current"}
          opacity={p.opacity}
        />
      ))}
      {drawing.labels?.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          fontSize={l.size ?? 7}
          textAnchor={l.anchor}
          className={cn(l.mono && "font-mono", l.tone === "accent" ? "fill-primary" : "fill-current")}
          fillOpacity={l.tone === "accent" ? 1 : 0.5}
        >
          {l.text}
        </text>
      ))}
    </svg>
  );
}
