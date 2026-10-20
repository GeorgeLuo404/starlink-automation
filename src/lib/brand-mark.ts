/**
 * 品牌标识 / The brand mark — geometry only (plain data, no React).
 *
 * An isometric S on the hexagon the line-art is drawn in: an arc over the top,
 * a spine down the diagonal, an arc under the bottom. The upper half is orange,
 * the lower half the text colour, and the spine breaks around a four-point
 * star — 星 (the star) between the two halves it links (链).
 *
 * Drawn by the site logo (components/site/logo.tsx), and written to the
 * favicon (icon.svg + favicon.ico) and share image by scripts/generate-placeholders.ts.
 */

export type V = [number, number];

/** 40 × 40 board. */
export const MARK_SIZE = 40;
const C: V = [20, 20];
const R = 12.5; // hexagon centre-line radius (pointy top)
const W = 4.4; // band width
const GAP = 4.6; // spine stops this far from the centre, either side
const STAR = 3.6; // star radius

const add = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1];
const unit = (a: V): V => {
  const l = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / l, a[1] / l];
};

const at = (deg: number): V => [C[0] + R * Math.cos((deg * Math.PI) / 180), C[1] + R * Math.sin((deg * Math.PI) / 180)];
const UR = at(-30);
const TOP = at(-90);
const UL = at(-150);
const LL = at(150);
const BOTTOM = at(90);
const LR = at(30);

/** A polyline thickened into a band: mitred joins, square-cut ends. */
function band(pts: V[], w: number): V[] {
  const h = w / 2;
  const dirs = pts.slice(1).map((p, i) => unit(sub(p, pts[i])));
  const nrm = (d: V): V => [-d[1], d[0]];
  const left: V[] = [];
  const right: V[] = [];
  pts.forEach((p, i) => {
    if (i === 0 || i === pts.length - 1) {
      const n = nrm(dirs[i === 0 ? 0 : dirs.length - 1]);
      left.push(add(p, n, h));
      right.push(add(p, n, -h));
      return;
    }
    const n1 = nrm(dirs[i - 1]);
    const m = unit(add(n1, nrm(dirs[i])));
    const len = h / dot(m, n1);
    left.push(add(p, m, len));
    right.push(add(p, m, -len));
  });
  return [...left, ...right.reverse()];
}

/** Four-point star with concave sides (quadratic curves, sampled). */
function star(c: V, r: number): V[] {
  const k = r * 0.16;
  const tips: V[] = [
    [c[0], c[1] - r],
    [c[0] + r, c[1]],
    [c[0], c[1] + r],
    [c[0] - r, c[1]],
  ];
  const ctrl: V[] = [
    [c[0] + k, c[1] - k],
    [c[0] + k, c[1] + k],
    [c[0] - k, c[1] + k],
    [c[0] - k, c[1] - k],
  ];
  const out: V[] = [];
  tips.forEach((a, i) => {
    const b = tips[(i + 1) % 4];
    for (let s = 0; s < 10; s++) {
      const t = s / 10;
      const u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * ctrl[i][0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctrl[i][1] + t * t * b[1]]);
    }
  });
  return out;
}

export function roundedSquare(size: number, r: number): V[] {
  const out: V[] = [];
  const corners: [V, number][] = [
    [[size - r, r], -90],
    [[size - r, size - r], 0],
    [[r, size - r], 90],
    [[r, r], 180],
  ];
  for (const [c, start] of corners) {
    for (let s = 0; s <= 8; s++) {
      const a = ((start + (s / 8) * 90) * Math.PI) / 180;
      out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
    }
  }
  return out;
}

/** The spine runs UL → LR through the centre; each half stops short of the star. */
const spine = unit(sub(LR, UL));

/** The mark's three shapes, as polygons on the 40 × 40 board. */
export const markShapes = {
  upper: band([UR, TOP, UL, add(C, spine, -GAP)], W),
  lower: band([LL, BOTTOM, LR, add(C, spine, GAP)], W),
  star: star(C, STAR),
};

/** Tight box around the shapes (for the logo, which has no tile). */
export const MARK_VIEWBOX = "4.5 4.5 31 31";

export const polyPath = (poly: V[]) => `M${poly.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}Z`;

