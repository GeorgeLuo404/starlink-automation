/**
 * 站点图标 / Favicon from the brand mark: src/app/icon.svg and favicon.ico.
 * The shapes come from src/lib/brand-mark.ts; here they are put on an ink tile
 * and written as SVG, and rasterised into a .ico with PNG frames — encoded with
 * node:zlib, so no image library is needed.
 */
import { crc32, deflateSync } from "node:zlib";
import { MARK_SIZE as SIZE, markShapes, polyPath, roundedSquare, type V } from "../src/lib/brand-mark";

type Rgb = [number, number, number];

export type MarkColours = { tile: Rgb; upper: Rgb; lower: Rgb; star: Rgb };

/** Drawing order, back to front. */
function layers(c: MarkColours): [V[], Rgb][] {
  return [
    [roundedSquare(SIZE, 9), c.tile],
    [markShapes.upper, c.upper],
    [markShapes.lower, c.lower],
    [markShapes.star, c.star],
  ];
}

const hex = ([r, g, b]: Rgb) => `rgb(${r},${g},${b})`;

export function markSvg(c: MarkColours) {
  const [, ...shapes] = layers(c);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" rx="9" fill="${hex(c.tile)}"/>
${shapes.map(([poly, colour]) => `  <path d="${polyPath(poly)}" fill="${hex(colour)}"/>`).join("\n")}
</svg>
`;
}

/* ------------------------------ raster → .ico ------------------------------ */

function inside(poly: V[], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** RGBA pixels at `px` × `px`, 8 × 8 samples per pixel. */
function rasterise(c: MarkColours, px: number): Buffer {
  const ls = layers(c);
  const ss = 8;
  const out = Buffer.alloc(px * px * 4);
  for (let y = 0; y < px; y++) {
    for (let x = 0; x < px; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const u = ((x + (sx + 0.5) / ss) / px) * SIZE;
          const v = ((y + (sy + 0.5) / ss) / px) * SIZE;
          let colour: Rgb | null = null;
          for (const [poly, col] of ls) if (inside(poly, u, v)) colour = col;
          if (colour) {
            r += colour[0];
            g += colour[1];
            b += colour[2];
            a += 1;
          }
        }
      }
      const o = (y * px + x) * 4;
      if (a) {
        out[o] = Math.round(r / a);
        out[o + 1] = Math.round(g / a);
        out[o + 2] = Math.round(b / a);
      }
      out[o + 3] = Math.round((a / (ss * ss)) * 255);
    }
  }
  return out;
}

function png(rgba: Buffer, px: number): Buffer {
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(px, 0);
  ihdr.writeUInt32BE(px, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const rows = Buffer.alloc(px * (px * 4 + 1));
  for (let y = 0; y < px; y++) rgba.copy(rows, y * (px * 4 + 1) + 1, y * px * 4, (y + 1) * px * 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(rows, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** A .ico with PNG frames (supported by every browser and Windows Vista+). */
export function markIco(c: MarkColours, sizes = [16, 32, 48]): Buffer {
  const frames = sizes.map((px) => png(rasterise(c, px), px));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(sizes.length, 4);
  let offset = 6 + 16 * sizes.length;
  const entries = sizes.map((px, i) => {
    const e = Buffer.alloc(16);
    e[0] = px % 256;
    e[1] = px % 256;
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(frames[i].length, 8);
    e.writeUInt32LE(offset, 12);
    offset += frames[i].length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...frames]);
}
