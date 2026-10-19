/* ==========================================================================
   线稿几何 / Line-art geometry
   --------------------------------------------------------------------------
   Isometric CAD-style wireframes in the same language as the hero: hairline
   strokes, hidden edges faded, the accent only where something is "live".
   Plain data (SVG path strings), no React — the same drawings render inline
   on the page (components/site/line-art.tsx) and are written to the cover
   placeholders in public/media (scripts/generate-placeholders.ts).
   ========================================================================== */

export type P3 = [number, number, number];
/** base = visible edge · faint = hidden edge / guide · accent = the live part */
export type Tone = "base" | "faint" | "accent";
export type Stroke = { d: string; tone: Tone; dash?: string };
export type Dot = { x: number; y: number; r: number; tone: Tone; opacity?: number };
export type Label = {
  x: number;
  y: number;
  text: string;
  size?: number;
  anchor?: "start" | "middle" | "end";
  tone?: Tone;
  mono?: boolean;
  /** Keep this size when a cover scales labels up (text inside a drawn box). */
  fixed?: boolean;
};
/** A drawing on the 400 × 280 art board. */
export type Drawing = { strokes: Stroke[]; dots?: Dot[]; labels?: Label[] };
/** Isometric camera: screen origin and scale. */
export type View = { x: number; y: number; s: number };

export const ART_W = 400;
export const ART_H = 280;

const COS = Math.cos(Math.PI / 6);
const r1 = (n: number) => Math.round(n * 10) / 10;

export function project([x, y, z]: P3, v: View): [number, number] {
  return [v.x + (x - z) * COS * v.s, v.y + (x + z) * 0.5 * v.s - y * v.s];
}

export function path(pts: P3[], v: View, tone: Tone = "base", closed = false): Stroke {
  const d = pts
    .map((p, i) => {
      const [x, y] = project(p, v);
      return `${i ? "L" : "M"}${r1(x)} ${r1(y)}`;
    })
    .join(" ");
  return { d: closed ? `${d} Z` : d, tone };
}

/** A 2D polyline in art-board coordinates. */
export function line2(pts: [number, number][], tone: Tone = "base", closed = false): Stroke {
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)} ${r1(y)}`).join(" ");
  return { d: closed ? `${d} Z` : d, tone };
}

export function rect2(x: number, y: number, w: number, h: number, tone: Tone = "base"): Stroke {
  return line2([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], tone, true);
}

export function circle2(cx: number, cy: number, r: number, tone: Tone = "base"): Stroke {
  return { d: `M${r1(cx - r)} ${r1(cy)} a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0 a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0`, tone };
}

/** Axis-aligned box; the three edges meeting at the hidden back-bottom corner are faded. */
export function box(v: View, [x0, y0, z0]: P3, [x1, y1, z1]: P3, tone: Tone = "base"): Stroke[] {
  const c = (x: number, y: number, z: number): P3 => [x, y, z];
  const hidden = tone === "accent" ? "accent" : "faint";
  return [
    path([c(x1, y0, z0), c(x1, y0, z1), c(x0, y0, z1)], v, tone),
    path([c(x0, y1, z0), c(x1, y1, z0), c(x1, y1, z1), c(x0, y1, z1)], v, tone, true),
    path([c(x1, y0, z0), c(x1, y1, z0)], v, tone),
    path([c(x1, y0, z1), c(x1, y1, z1)], v, tone),
    path([c(x0, y0, z1), c(x0, y1, z1)], v, tone),
    path([c(x0, y0, z0), c(x1, y0, z0)], v, hidden),
    path([c(x0, y0, z0), c(x0, y0, z1)], v, hidden),
    path([c(x0, y0, z0), c(x0, y1, z0)], v, hidden),
  ];
}

/** Rectangle on a +z face (the one facing down-left). */
export function faceZ(v: View, z: number, [x0, y0]: [number, number], [x1, y1]: [number, number], tone: Tone): Stroke {
  return path([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], v, tone, true);
}

/** Rectangle on a +x face (the one facing down-right). */
export function faceX(v: View, x: number, [z0, y0]: [number, number], [z1, y1]: [number, number], tone: Tone): Stroke {
  return path([[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]], v, tone, true);
}

/** Rectangle lying on a horizontal plane at height y. */
export function faceY(v: View, y: number, [x0, z0]: [number, number], [x1, z1]: [number, number], tone: Tone): Stroke {
  return path([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], v, tone, true);
}

export const X: P3 = [1, 0, 0];
export const Y: P3 = [0, 1, 0];
export const Z: P3 = [0, 0, 1];

/** Circle around `c` in the plane of unit vectors u, w; split into front / back halves. */
export function ring(v: View, c: P3, u: P3, w: P3, r: number, tone: Tone = "base", backTone: Tone = tone): Stroke[] {
  const at = (a: number): P3 => [
    c[0] + (u[0] * Math.cos(a) + w[0] * Math.sin(a)) * r,
    c[1] + (u[1] * Math.cos(a) + w[1] * Math.sin(a)) * r,
    c[2] + (u[2] * Math.cos(a) + w[2] * Math.sin(a)) * r,
  ];
  const arc = (a0: number, a1: number) => Array.from({ length: 17 }, (_, i) => at(a0 + ((a1 - a0) * i) / 16));
  return [path(arc(-Math.PI / 4, (3 * Math.PI) / 4), v, tone), path(arc((3 * Math.PI) / 4, (7 * Math.PI) / 4), v, backTone)];
}

/** Vertical cylinder: rings top and bottom (bottom back half faded) and the two silhouette lines. */
export function cylinder(v: View, [cx, y0, cz]: P3, r: number, h: number, tone: Tone = "base"): Stroke[] {
  const k = r / Math.SQRT2;
  return [
    ...ring(v, [cx, y0 + h, cz], X, Z, r, tone),
    ...ring(v, [cx, y0, cz], X, Z, r, tone, tone === "accent" ? "accent" : "faint"),
    path([[cx + k, y0, cz - k], [cx + k, y0 + h, cz - k]], v, tone),
    path([[cx - k, y0, cz + k], [cx - k, y0 + h, cz + k]], v, tone),
  ];
}

export const sub = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a: P3, b: P3, k = 1): P3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
export const norm = (a: P3): P3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const cross = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Square-section beam between two points. */
export function beam(v: View, a: P3, b: P3, w: number, tone: Tone = "base"): Stroke[] {
  const d = norm(sub(b, a));
  const side = norm(cross(d, Y));
  const up = cross(side, d);
  const h = w / 2;
  const corners = (p: P3): P3[] => [
    add(add(p, side, h), up, h),
    add(add(p, side, -h), up, h),
    add(add(p, side, -h), up, -h),
    add(add(p, side, h), up, -h),
  ];
  const ca = corners(a);
  const cb = corners(b);
  return [
    path(ca, v, tone, true),
    path(cb, v, tone, true),
    ...ca.map((p, i) => path([p, cb[i]], v, i === 2 ? "faint" : tone)),
  ];
}

/** Decorative dot matrix in the accent colour — the "signal" texture of every drawing. */
export function dotGrid(x: number, y: number, cols: number, rows: number, step = 11): Dot[] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c): Dot => ({
      x: x + c * step,
      y: y + r * step,
      r: 1.25,
      tone: "accent",
      opacity: (r + c) % 3 === 0 ? 0.75 : 0.34,
    }))
  ).flat();
}

/** Several drawings on one board (each built with its own View / offset). */
export function merge(...parts: Drawing[]): Drawing {
  return {
    strokes: parts.flatMap((p) => p.strokes),
    dots: parts.flatMap((p) => p.dots ?? []),
    labels: parts.flatMap((p) => p.labels ?? []),
  };
}
