/**
 * 生成工业风占位图。
 *
 * 这些 SVG 是"看起来是有意设计"的占位物料，正式上线前请用真实照片替换：
 *   public/media/**  · 产线、设备与团队照片
 *   public/og.svg    · 社交分享图（建议另存为 1200×630 的 JPG/PNG）
 *
 * Run: node scripts/generate-placeholders.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "media");
const PUBLIC = path.join(process.cwd(), "public");

const W = 1600;
const H = 1000;
/* --------------------------------------------------------------------------
   色板唯一来源：src/app/globals.css 的 :root 变量。
   这里不再出现任何十六进制颜色，避免与设计系统脱节。
   Single source of truth for colour: the :root palette in globals.css.
   No hex literal may appear below this line.
   -------------------------------------------------------------------------- */
const cssText = await readFile(path.join(process.cwd(), "src", "app", "globals.css"), "utf8");
const PALETTE = new Map();
for (const m of cssText.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
  PALETTE.set(m[1], m[2].toLowerCase());
}

function token(name) {
  const value = PALETTE.get(name);
  if (!value) throw new Error("Palette token --" + name + " not found in src/app/globals.css");
  return value;
}

/** SVG-as-<img> does not reliably support color-mix(), so emit plain rgba(). */
function alpha(name, a) {
  const n = parseInt(token(name).slice(1), 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

const BG = token("ink-900");
const BRAND = token("brand-500");
const INK_950 = token("ink-950");
const WHITE = token("white");
const PAPER_100 = token("paper-100");
const PAPER_500 = token("paper-500");
const WATERMARK = token("ink-400");
const BLACK = token("black");
const LINE = alpha("white", "0.05");

/** Deterministic PRNG so regenerating produces identical files. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function art(seed, kind) {
  const r = rng(seed);
  const parts = [];
  if (kind === "grid") {
    for (let i = 0; i < 26; i++) {
      const x = r() * W;
      const y = r() * H;
      const w = 90 + r() * 260;
      const h = 60 + r() * 200;
      parts.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="${alpha("brand-500", (0.05 + r() * 0.14).toFixed(2))}" stroke-width="1"/>`
      );
    }
    for (let i = 0; i < 8; i++) {
      const y = r() * H;
      parts.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${(y + (r() - 0.5) * 120).toFixed(1)}" stroke="${LINE}" stroke-width="1"/>`);
    }
  } else if (kind === "circuit") {
    for (let i = 0; i < 22; i++) {
      const x1 = Math.round(r() * 40) * 40;
      const y1 = Math.round(r() * 25) * 40;
      const x2 = Math.round(r() * 40) * 40;
      const y2 = Math.round(r() * 25) * 40;
      parts.push(
        `<path d="M${x1} ${y1} H${x2} V${y2}" fill="none" stroke="${alpha("brand-500", (0.08 + r() * 0.16).toFixed(2))}" stroke-width="1.2"/>`
      );
      parts.push(`<circle cx="${x2}" cy="${y2}" r="${(2 + r() * 3).toFixed(1)}" fill="${alpha("brand-500", "0.45")}"/>`);
    }
  } else {
    for (let i = 0; i < 9; i++) {
      const cx = r() * W;
      const cy = r() * H;
      const rad = 60 + r() * 320;
      parts.push(
        `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rad.toFixed(1)}" fill="none" stroke="${alpha("brand-500", (0.05 + r() * 0.12).toFixed(2))}" stroke-width="1"/>`
      );
    }
  }
  return parts.join("");
}

function svg({ label, index, kind, seed, subtitle, showLabel = true }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
  <defs>
    <pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="${LINE}" stroke-width="1"/>
    </pattern>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BLACK}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${BLACK}" stop-opacity="0.82"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.78" cy="0.2" r="0.7">
      <stop offset="0%" stop-color="${BRAND}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${BRAND}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${art(seed, kind)}
  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <g stroke="${BRAND}" stroke-width="1.5" opacity="0.85">
    <path d="M40 70V40H70"/><path d="M${W - 70} 40H${W - 40}V70"/>
    <path d="M40 ${H - 70}V${H - 40}H70"/><path d="M${W - 70} ${H - 40}H${W - 40}V${H - 70}"/>
  </g>
  <text x="56" y="72" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="17" letter-spacing="5" fill="${BRAND}">${esc(index)}</text>
  ${showLabel ? `<text x="56" y="${H - 96}" font-family="-apple-system,'PingFang SC','Microsoft YaHei',sans-serif" font-size="52" font-weight="600" fill="${WHITE}">${esc(label)}</text>` : ""}
  ${subtitle ? `<text x="56" y="${H - 54}" font-family="-apple-system,'PingFang SC','Microsoft YaHei',sans-serif" font-size="24" fill="${PAPER_500}">${esc(subtitle)}</text>` : ""}
  <text x="${W - 56}" y="${H - 54}" text-anchor="end" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="15" letter-spacing="4" fill="${WATERMARK}">STARLINK AUTOMATION</text>
</svg>
`;
}

const services = [
  ["plc", "PLC 程序调试"],
  ["robot", "机器人调试"],
  ["electrical", "电气图纸设计"],
  ["battery", "锂电池检测"],
  ["hot-press", "热压机"],
];

const cases = [
  ["cell-assembly-line-control", "方形铝壳电芯装配线"],
  ["robot-tending-workstation", "六轴机器人上下料工作站"],
  ["hot-press-temperature-pressure-loop", "电芯热压机温压闭环"],
  ["auto-parts-vision-inspection", "汽车零部件视觉检测线"],
  ["module-pack-mes-integration", "模组 PACK 线数据采集"],
];

/** [slug, title, category] */
const articles = [
  ["hot-press-line-delivered", "热压机产线顺利交付", "公司新闻"],
  ["iso9001-certified", "通过 ISO 9001 认证", "公司新闻"],
  ["battery-inspection-methods", "锂电池检测方法选型", "技术分享"],
  ["plc-communication-troubleshooting", "PLC 通信故障排查", "技术分享"],
  ["robot-team-expansion", "机器人调试团队扩充", "公司新闻"],
  ["electrical-drawing-standard-v2", "电气图纸规范 v2.0", "公司新闻"],
];

const gallery = [
  "电芯装配线整线调试",
  "热压机温控柜",
  "机器人上下料工作站",
  "控制柜内部接线",
  "视觉检测工位",
  "现场调试作业",
  "技术方案评审",
  "电气图纸设计",
  "产线节拍验证",
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const written = [];

  for (const [i, [slug, label]] of services.entries()) {
    const file = `service-${slug}.svg`;
    await writeFile(path.join(OUT, file), svg({ label, subtitle: "业务能力", index: `SVC-${String(i + 1).padStart(2, "0")}`, kind: "circuit", seed: 1000 + i }));
    written.push(file);
  }
  for (const [i, [slug, label]] of cases.entries()) {
    const file = `case-${slug}.svg`;
    await writeFile(path.join(OUT, file), svg({ label, subtitle: "项目案例", index: `CASE-${String(i + 1).padStart(2, "0")}`, kind: "grid", seed: 2000 + i }));
    written.push(file);
  }
  for (const [i, [slug, label, category]] of articles.entries()) {
    const file = `article-${slug}.svg`;
    await writeFile(path.join(OUT, file), svg({ label, subtitle: category, index: `NOTE-${String(i + 1).padStart(2, "0")}`, kind: "rings", seed: 3000 + i }));
    written.push(file);
  }
  for (const [i, label] of gallery.entries()) {
    const file = `gallery-${String(i + 1).padStart(2, "0")}.svg`;
    await writeFile(path.join(OUT, file), svg({ label, showLabel: false, subtitle: "", index: `IMG-${String(i + 1).padStart(2, "0")}`, kind: i % 3 === 0 ? "circuit" : "grid", seed: 4000 + i }));
    written.push(file);
  }

  await writeFile(path.join(OUT, "hero-poster.svg"), svg({ label: "自动化产线", subtitle: "深圳市星链自动化有限公司", index: "HERO", kind: "circuit", seed: 777 }));
  await writeFile(path.join(OUT, "factory.svg"), svg({ label: "作业现场", subtitle: "深圳市星链自动化有限公司", index: "SITE", kind: "grid", seed: 888 }));
  await writeFile(path.join(OUT, "og.svg"), svg({ label: "以自动化，链接智能制造", subtitle: "深圳市星链自动化有限公司", index: "STARLINK", kind: "rings", seed: 999 }));

  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <rect width="40" height="40" rx="8" fill="${INK_950}"/>
  <path d="M20 6 32.5 13.2v14.4L20 34 7.5 27.6V13.2L20 6Z" fill="none" stroke="${BRAND}" stroke-width="1.8"/>
  <circle cx="20" cy="20" r="2.8" fill="${BRAND}"/>
  <circle cx="20" cy="12" r="1.8" fill="${PAPER_100}"/>
  <circle cx="27.5" cy="24.5" r="1.8" fill="${PAPER_100}"/>
  <circle cx="12.5" cy="24.5" r="1.8" fill="${PAPER_100}"/>
  <path d="M20 20V12M20 20l7.5 4.5M20 20l-7.5 4.5" stroke="${BRAND}" stroke-width="1.1" opacity="0.8"/>
</svg>
`;
  await writeFile(path.join(PUBLIC, "favicon.svg"), favicon);
  await writeFile(path.join(PUBLIC, "icon.svg"), favicon);
  written.push("favicon.svg", "icon.svg", "og.svg");

  console.log(`Generated ${written.length} assets into public/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
