/**
 * 生成线稿占位图 / Generate the line-art cover placeholders
 *
 *   pnpm media:placeholders
 *
 * 业务能力、项目案例、新闻与图库在后台上传真实照片之前，显示这里生成的 SVG：
 *   public/media/service-<slug>.svg · case-<slug>.svg · article-<slug>.svg
 *   public/media/gallery-01…09.svg · factory.svg · og.svg
 *   src/app/icon.svg · src/app/favicon.ico（品牌标识，见 scripts/brand-mark.ts）
 * 文件名与 coverSrc()（src/lib/utils.ts）和数据库种子一致；上传封面后自动被替换。
 *
 * Until a real photo is uploaded in the admin, every cover falls back to these
 * files (coverSrc in src/lib/utils.ts, and the seed writes the same paths).
 * Drawings come from src/lib/line-art — the same ones the site draws inline —
 * and colours from the palette in src/app/globals.css, so nothing here can
 * drift from the design system. Output is deterministic.
 */
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { articles, cases, galleryItems, services } from "../src/content/defaults";
import { drawings, serviceDrawing, type DrawingName } from "../src/lib/line-art/drawings";
import { FONT_MONO, FONT_SANS, drawingBounds, drawingMarkup, textWidth } from "../src/lib/line-art/svg";
import type { Drawing } from "../src/lib/line-art/geometry";
import { markShapes, polyPath } from "../src/lib/brand-mark";
import { markIco, markSvg } from "./brand-mark";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "media");

/* ---------------------------------------------------------------------------
   色板唯一来源：globals.css 的 :root 变量 —— 这里不出现任何十六进制颜色。
   Single source of truth for colour: the palette in globals.css.
   --------------------------------------------------------------------------- */
const css = readFileSync(path.join(ROOT, "src", "app", "globals.css"), "utf8");
const PALETTE = new Map([...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2].toLowerCase()]));
const token = (name: string) => {
  const value = PALETTE.get(name);
  if (!value) throw new Error(`Palette token --${name} not found in src/app/globals.css`);
  return value;
};
/** SVG-as-<img> does not reliably support color-mix(), so emit plain rgba(). */
const alpha = (name: string, a: number) => {
  const n = parseInt(token(name).slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

type Theme = "dark" | "light";
const THEMES = {
  dark: { bg: "ink-900", ink: "paper-50", label: "stone-400", grid: 0.045 },
  light: { bg: "paper-100", ink: "ink-950", label: "stone-600", grid: 0.06 },
} as const;

const esc = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * One cover: drawing centred on a faint grid, with a small CAD-style title
 * block. 16:10, with enough margin that 16:9, 4:3 and square crops
 * (object-cover) all keep the whole drawing.
 */
function cover({
  drawing,
  theme,
  code,
  title,
  W = 1600,
  H = 1000,
  titleBlock = true,
}: {
  drawing: Drawing;
  theme: Theme;
  code: string;
  title: string;
  W?: number;
  H?: number;
  /** Off for gallery tiles, which carry their own caption. */
  titleBlock?: boolean;
}) {
  const t = THEMES[theme];
  const ink = token(t.ink);
  const accent = token("orange-500");
  const LABELS = 1.25;

  // Fit the drawing's real bounds into the middle band of the frame — inside
  // what a 16:9, 4:3 or square crop (object-cover) still shows.
  const b = drawingBounds(drawing, LABELS);
  const k = Math.min((W * 0.62) / b.w, (H * (titleBlock ? 0.56 : 0.64)) / b.h);
  const dx = W / 2 - (b.x + b.w / 2) * k;
  const dy = H * (titleBlock ? 0.46 : 0.42) - (b.y + b.h / 2) * k;

  // Title block, sized to its text, kept clear of the crop edges.
  const fs = 1000 * 0.022;
  const pad = fs * 0.8;
  const codeW = textWidth(code, fs) + pad * 2;
  const brandW = textWidth("STARLINK AUTOMATION", fs) + 19 * 2 + pad * 2;
  const bw = Math.max(codeW + brandW, textWidth(title, fs) + pad * 2);
  const bh = fs * 4.4;
  const bx = W * 0.9 - bw;
  const by = H * 0.92 - bh;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
  <defs>
    <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${alpha(t.ink, t.grid)}" stroke-width="1"/></pattern>
    <radialGradient id="glow" cx="0.82" cy="0.12" r="0.75"><stop offset="0" stop-color="${accent}" stop-opacity="${theme === "dark" ? 0.07 : 0.05}"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${token(t.bg)}"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) scale(${k.toFixed(3)})">${drawingMarkup(drawing, { ink, accent, label: token(t.label) }, LABELS)}</g>
  ${titleBlock ? `<g fill="none" stroke="${alpha(t.ink, 0.28)}" stroke-width="1">
    <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}"/>
    <path d="M${bx.toFixed(1)} ${(by + bh / 2).toFixed(1)}H${(bx + bw).toFixed(1)}M${(bx + codeW).toFixed(1)} ${by.toFixed(1)}V${(by + bh / 2).toFixed(1)}"/>
  </g>
  <g font-size="${fs.toFixed(1)}">
    <text x="${(bx + pad).toFixed(1)}" y="${(by + bh * 0.33).toFixed(1)}" font-family="${FONT_MONO}" fill="${accent}">${esc(code)}</text>
    <text x="${(bx + codeW + pad).toFixed(1)}" y="${(by + bh * 0.33).toFixed(1)}" font-family="${FONT_MONO}" letter-spacing="2" fill="${token(t.label)}">STARLINK AUTOMATION</text>
    <text x="${(bx + pad).toFixed(1)}" y="${(by + bh * 0.82).toFixed(1)}" font-family="${FONT_SANS}" fill="${ink}" fill-opacity="0.8">${esc(title)}</text>
  </g>` : ""}
</svg>
`;
}

/** Social share image: the brand mark, the line and the robot. 1200 × 630. */
function ogImage() {
  const W = 1200;
  const H = 630;
  const ink = token("paper-50");
  const accent = token("orange-500");
  const k = 1.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="深圳市星链自动化有限公司">
  <defs>
    <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${alpha("paper-50", 0.045)}" stroke-width="1"/></pattern>
    <radialGradient id="glow" cx="0.78" cy="0.3" r="0.6"><stop offset="0" stop-color="${accent}" stop-opacity="0.16"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${token("ink-950")}"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g transform="translate(560 70) scale(${k})">${drawingMarkup(drawings.ctaRobot(), { ink, accent, label: token("stone-400") })}</g>
  <g transform="translate(74 86) scale(1.3)">
    <path d="${polyPath(markShapes.upper)}" fill="${accent}"/>
    <path d="${polyPath(markShapes.lower)}" fill="${ink}"/>
    <path d="${polyPath(markShapes.star)}" fill="${accent}"/>
  </g>
  <g transform="translate(80 92)">
    <text x="52" y="27" font-family="${FONT_SANS}" font-size="22" font-weight="600" fill="${ink}">星链自动化</text>
  </g>
  <text x="80" y="330" font-family="${FONT_SANS}" font-size="64" font-weight="500" fill="${ink}">以自动化，</text>
  <text x="80" y="414" font-family="${FONT_SANS}" font-size="64" font-weight="500" fill="${ink}"><tspan fill="${accent}">链接</tspan>智能制造</text>
  <text x="80" y="500" font-family="${FONT_SANS}" font-size="22" fill="${token("stone-400")}">深圳市星链自动化有限公司 · 工业自动化整线交付</text>
  <text x="80" y="560" font-family="${FONT_MONO}" font-size="14" letter-spacing="4" fill="${token("ink-400")}">STARLINK AUTOMATION</text>
</svg>
`;
}

/** Favicon colours: the brand mark (scripts/brand-mark.ts) on an ink tile. */
const rgb = (name: string): [number, number, number] => {
  const n = parseInt(token(name).slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const MARK = { tile: rgb("ink-950"), upper: rgb("orange-500"), lower: rgb("paper-50"), star: rgb("orange-500") };

/* ------------------------------ 题材对照 ---------------------------------- */

const caseDrawing: Record<string, DrawingName> = {
  "cell-assembly-line-control": "assemblyLine",
  "robot-tending-workstation": "robotCell",
  "hot-press-temperature-pressure-loop": "hotPressLoop",
  "auto-parts-vision-inspection": "visionLine",
  "module-pack-mes-integration": "moduleMes",
};
const articleDrawing: Record<string, DrawingName> = {
  "hot-press-line-delivered": "hotPressLine",
  "iso9001-certified": "certificate",
  "battery-inspection-methods": "batteryTest",
  "plc-communication-troubleshooting": "network",
  "robot-team-expansion": "robotPair",
  "electrical-drawing-standard-v2": "schematicStack",
};
/** In the order of galleryItems in src/content/defaults.ts. */
const galleryDrawing: DrawingName[] = [
  "assemblyLine",
  "hotPressLoop",
  "robotCell",
  "cabinet",
  "visionLine",
  "commissioning",
  "floorPlan",
  "schematic",
  "taktChart",
];

const n2 = (i: number) => String(i + 1).padStart(2, "0");
const pick = (name: DrawingName | undefined, fallback: DrawingName) => (drawings[name ?? fallback] as () => Drawing)();

async function main() {
  await mkdir(OUT, { recursive: true });
  const files: [string, string][] = [];

  services.forEach((s, i) =>
    files.push([`service-${s.slug}.svg`, cover({ drawing: pick(serviceDrawing[s.slug], "plcRack"), theme: "dark", code: `SVC-${n2(i)}`, title: s.title })])
  );
  cases.forEach((c, i) =>
    files.push([`case-${c.slug}.svg`, cover({ drawing: pick(caseDrawing[c.slug], "assemblyLine"), theme: "light", code: `CASE-${n2(i)}`, title: c.title })])
  );
  articles.forEach((a, i) =>
    files.push([`article-${a.slug}.svg`, cover({ drawing: pick(articleDrawing[a.slug], "schematic"), theme: "light", code: `NOTE-${n2(i)}`, title: a.title })])
  );
  galleryItems.forEach((g, i) =>
    files.push([
      `gallery-${n2(i)}.svg`,
      // 4:3 like the gallery tiles, and no title block: the tile shows the caption.
      cover({ drawing: pick(galleryDrawing[i], "assemblyLine"), theme: "dark", code: `IMG-${n2(i)}`, title: g.title, H: 1200, titleBlock: false }),
    ])
  );
  files.push(["factory.svg", cover({ drawing: drawings.workshop(), theme: "light", code: "SITE", title: "作业现场" })]);
  files.push(["og.svg", ogImage()]);

  for (const [name, svg] of files) await writeFile(path.join(OUT, name), svg);
  // Next.js serves both for every route (site and admin): icon.svg for current
  // browsers, favicon.ico for older ones and for crawlers such as Baidu.
  await writeFile(path.join(ROOT, "src", "app", "icon.svg"), markSvg(MARK));
  await writeFile(path.join(ROOT, "src", "app", "favicon.ico"), markIco(MARK));

  console.log(`Generated ${files.length} placeholders in public/media, plus src/app/icon.svg and favicon.ico`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
