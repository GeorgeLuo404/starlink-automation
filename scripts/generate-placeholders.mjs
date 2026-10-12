/**
 * 生成工业风占位图 / Generate industrial-style placeholder artwork.
 *
 * 这些 SVG 是"看起来是有意设计"的占位物料，正式上线前请用真实照片替换：
 *   public/media/**  · 产线、设备与团队照片
 *   public/og.svg    · 社交分享图（建议另存为 1200×630 的 JPG/PNG）
 *
 * Run: node scripts/generate-placeholders.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "media");
const PUBLIC = path.join(process.cwd(), "public");

const W = 1600;
const H = 1000;
const BG = "#0a0b0e";
const LINE = "rgba(255,255,255,0.05)";
const BRAND = "#22e0ff";

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
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="rgba(34,224,255,${(0.05 + r() * 0.14).toFixed(2)})" stroke-width="1"/>`
      );
    }
    for (let i = 0; i < 8; i++) {
      const y = r() * H;
      parts.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${(y + (r() - 0.5) * 120).toFixed(1)}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`);
    }
  } else if (kind === "circuit") {
    for (let i = 0; i < 22; i++) {
      const x1 = Math.round(r() * 40) * 40;
      const y1 = Math.round(r() * 25) * 40;
      const x2 = Math.round(r() * 40) * 40;
      const y2 = Math.round(r() * 25) * 40;
      parts.push(
        `<path d="M${x1} ${y1} H${x2} V${y2}" fill="none" stroke="rgba(34,224,255,${(0.08 + r() * 0.16).toFixed(2)})" stroke-width="1.2"/>`
      );
      parts.push(`<circle cx="${x2}" cy="${y2}" r="${(2 + r() * 3).toFixed(1)}" fill="rgba(34,224,255,0.45)"/>`);
    }
  } else {
    for (let i = 0; i < 9; i++) {
      const cx = r() * W;
      const cy = r() * H;
      const rad = 60 + r() * 320;
      parts.push(
        `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rad.toFixed(1)}" fill="none" stroke="rgba(34,224,255,${(0.05 + r() * 0.12).toFixed(2)})" stroke-width="1"/>`
      );
    }
  }
  return parts.join("");
}

function svg({ label, index, kind, seed, subtitle }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
  <defs>
    <pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="${LINE}" stroke-width="1"/>
    </pattern>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.82"/>
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
  <text x="56" y="${H - 96}" font-family="-apple-system,'PingFang SC','Microsoft YaHei',sans-serif" font-size="52" font-weight="600" fill="#ffffff">${esc(label)}</text>
  ${subtitle ? `<text x="56" y="${H - 54}" font-family="-apple-system,'PingFang SC','Microsoft YaHei',sans-serif" font-size="24" fill="#8a929e">${esc(subtitle)}</text>` : ""}
  <text x="${W - 56}" y="${H - 54}" text-anchor="end" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="15" letter-spacing="4" fill="#3d4552">STARLINK AUTOMATION</text>
</svg>
`;
}

const services = [
  ["plc", "PLC 程序调试", "PLC PROGRAMMING & COMMISSIONING"],
  ["robot", "机器人调试", "ROBOT INTEGRATION"],
  ["electrical", "电气图纸设计", "ELECTRICAL DRAWING DESIGN"],
  ["battery", "锂电池检测", "LITHIUM BATTERY INSPECTION"],
  ["hot-press", "热压机", "HOT PRESS MACHINE"],
];

const cases = [
  ["cell-assembly-line-control", "方形铝壳电芯装配线", "CELL ASSEMBLY LINE"],
  ["robot-tending-workstation", "六轴机器人上下料工作站", "ROBOT TENDING CELL"],
  ["hot-press-temperature-pressure-loop", "电芯热压机温压闭环", "HOT PRESS CLOSED LOOP"],
  ["auto-parts-vision-inspection", "汽车零部件视觉检测线", "VISION INSPECTION LINE"],
  ["module-pack-mes-integration", "模组 PACK 线数据采集", "PACK LINE DATA & MES"],
];

const articles = [
  ["hot-press-line-delivered", "热压机产线顺利交付", "NEWS"],
  ["iso9001-certified", "通过 ISO 9001 认证", "NEWS"],
  ["battery-inspection-methods", "锂电池检测方法选型", "TECHNICAL"],
  ["plc-communication-troubleshooting", "PLC 通信故障排查", "TECHNICAL"],
  ["robot-team-expansion", "机器人调试团队扩充", "NEWS"],
  ["electrical-drawing-standard-v2", "电气图纸规范 v2.0", "NEWS"],
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

  for (const [i, [slug, zh, en]] of services.entries()) {
    const file = `service-${slug}.svg`;
    await writeFile(path.join(OUT, file), svg({ label: zh, subtitle: en, index: `SVC-${String(i + 1).padStart(2, "0")}`, kind: "circuit", seed: 1000 + i }));
    written.push(file);
  }
  for (const [i, [slug, zh, en]] of cases.entries()) {
    const file = `case-${slug}.svg`;
    await writeFile(path.join(OUT, file), svg({ label: zh, subtitle: en, index: `CASE-${String(i + 1).padStart(2, "0")}`, kind: "grid", seed: 2000 + i }));
    written.push(file);
  }
  for (const [i, [slug, zh, en]] of articles.entries()) {
    const file = `article-${slug}.svg`;
    await writeFile(path.join(OUT, file), svg({ label: zh, subtitle: en, index: `NOTE-${String(i + 1).padStart(2, "0")}`, kind: "rings", seed: 3000 + i }));
    written.push(file);
  }
  for (const [i, label] of gallery.entries()) {
    const file = `gallery-${String(i + 1).padStart(2, "0")}.svg`;
    await writeFile(path.join(OUT, file), svg({ label, subtitle: "", index: `IMG-${String(i + 1).padStart(2, "0")}`, kind: i % 3 === 0 ? "circuit" : "grid", seed: 4000 + i }));
    written.push(file);
  }

  await writeFile(path.join(OUT, "hero-poster.svg"), svg({ label: "自动化产线", subtitle: "TURNKEY AUTOMATION", index: "HERO", kind: "circuit", seed: 777 }));
  await writeFile(path.join(OUT, "factory.svg"), svg({ label: "作业现场", subtitle: "ON THE SHOP FLOOR", index: "SITE", kind: "grid", seed: 888 }));
  await writeFile(path.join(OUT, "og.svg"), svg({ label: "以自动化，链接智能制造", subtitle: "深圳市星链自动化有限公司", index: "STARLINK", kind: "rings", seed: 999 }));

  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <rect width="40" height="40" rx="8" fill="#08090b"/>
  <path d="M20 6 32.5 13.2v14.4L20 34 7.5 27.6V13.2L20 6Z" fill="none" stroke="#22e0ff" stroke-width="1.8"/>
  <circle cx="20" cy="20" r="2.8" fill="#22e0ff"/>
  <circle cx="20" cy="12" r="1.8" fill="#e8ebf0"/>
  <circle cx="27.5" cy="24.5" r="1.8" fill="#e8ebf0"/>
  <circle cx="12.5" cy="24.5" r="1.8" fill="#e8ebf0"/>
  <path d="M20 20V12M20 20l7.5 4.5M20 20l-7.5 4.5" stroke="#22e0ff" stroke-width="1.1" opacity="0.8"/>
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
