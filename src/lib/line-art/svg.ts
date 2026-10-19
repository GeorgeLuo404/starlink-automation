import { ART_H, ART_W, type Drawing, type Stroke, type Tone } from "./geometry";

/**
 * A drawing as standalone SVG markup, for files (the cover placeholders) where
 * CSS variables and currentColor are not available — colours come in resolved.
 */
export type SvgColours = { ink: string; accent: string; label: string };

const esc = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const FONT_MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
export const FONT_SANS = "-apple-system,'PingFang SC','Noto Sans SC','Microsoft YaHei',sans-serif";

/** Same weights as the inline renderer (components/site/line-art.tsx). */
const TONE: Record<Tone, { opacity: number; width: number }> = {
  faint: { opacity: 0.22, width: 1 },
  base: { opacity: 0.78, width: 1 },
  accent: { opacity: 1, width: 1.4 },
};

function strokes(list: Stroke[], tone: Tone, colour: string) {
  const items = list.filter((s) => s.tone === tone);
  if (!items.length) return "";
  const { opacity, width } = TONE[tone];
  const paths = items
    .map((s) => `<path d="${s.d}"${s.dash ? ` stroke-dasharray="${s.dash}"` : ""} vector-effect="non-scaling-stroke"/>`)
    .join("");
  return `<g stroke="${colour}" stroke-opacity="${opacity}" stroke-width="${width}">${paths}</g>`;
}

/** The drawing's markup in art-board units (0 0 400 280); wrap it in a transform to place it. */
export function drawingMarkup(d: Drawing, c: SvgColours, labelScale = 1) {
  const dots = (d.dots ?? [])
    .map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${p.tone === "accent" ? c.accent : c.ink}"${p.opacity !== undefined ? ` fill-opacity="${p.opacity}"` : ""}/>`)
    .join("");
  const labels = (d.labels ?? [])
    .map(
      (l) =>
        `<text x="${l.x}" y="${l.y}" font-size="${(l.size ?? 7) * (l.fixed ? 1 : labelScale)}" font-family="${l.mono ? FONT_MONO : FONT_SANS}"${l.anchor ? ` text-anchor="${l.anchor}"` : ""} fill="${l.tone === "accent" ? c.accent : c.label}">${esc(l.text)}</text>`
    )
    .join("");
  return [
    `<g fill="none" stroke-linecap="round" stroke-linejoin="round">`,
    strokes(d.strokes, "faint", c.ink),
    strokes(d.strokes, "base", c.ink),
    strokes(d.strokes, "accent", c.accent),
    `</g>`,
    dots,
    labels,
  ].join("");
}

/** Rough rendered width of a label: CJK glyphs are 1em, Latin about 0.6em. */
export function textWidth(text: string, size: number) {
  return [...text].reduce((w, ch) => w + (/[⺀-￿]/.test(ch) ? 1 : 0.6), 0) * size;
}

/** Every point a path passes through or bends towards (enough for a bounding box). */
function pathPoints(d: string): [number, number][] {
  const tokens = d.match(/[MLHVCSAZa]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const pts: [number, number][] = [];
  let i = 0;
  let cmd = "M";
  let x = 0;
  let y = 0;
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i])) {
      cmd = tokens[i++];
      if (cmd === "Z") continue;
    }
    if (cmd === "M" || cmd === "L") {
      x = num();
      y = num();
      pts.push([x, y]);
    } else if (cmd === "H") {
      x = num();
      pts.push([x, y]);
    } else if (cmd === "V") {
      y = num();
      pts.push([x, y]);
    } else if (cmd === "C") {
      pts.push([num(), num()], [num(), num()]);
      x = num();
      y = num();
      pts.push([x, y]);
    } else if (cmd === "S") {
      pts.push([num(), num()]);
      x = num();
      y = num();
      pts.push([x, y]);
    } else if (cmd === "A" || cmd === "a") {
      const rx = num();
      const ry = num();
      i += 3; // rotation and flags
      const ex = num();
      const ey = num();
      x = cmd === "a" ? x + ex : ex;
      y = cmd === "a" ? y + ey : ey;
      pts.push([x, y], [x - rx, y - ry], [x + rx, y + ry]);
    } else {
      i += 1; // unknown token: skip rather than loop forever
    }
  }
  return pts;
}

/** Bounding box of everything drawn, labels included, in art-board units. */
export function drawingBounds(d: Drawing, labelScale = 1) {
  const pts: [number, number][] = d.strokes.flatMap((s) => pathPoints(s.d));
  for (const p of d.dots ?? []) pts.push([p.x - p.r, p.y - p.r], [p.x + p.r, p.y + p.r]);
  for (const l of d.labels ?? []) {
    const size = (l.size ?? 7) * (l.fixed ? 1 : labelScale);
    const w = textWidth(l.text, size);
    const x0 = l.anchor === "end" ? l.x - w : l.anchor === "middle" ? l.x - w / 2 : l.x;
    pts.push([x0, l.y - size], [x0 + w, l.y + size * 0.25]);
  }
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

export { ART_W, ART_H };
