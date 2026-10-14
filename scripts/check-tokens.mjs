/**
 * 设计令牌守卫 / Design-token guard
 *
 *   颜色只能来自 globals.css 的色板，其它任何地方都不允许出现十六进制字面量。
 *   Colour may only come from the palette in globals.css — no hex literals are
 *   allowed anywhere else, so re-theming the site never requires touching a
 *   component.
 *
 * 它还检查两个曾经真实出过问题的地方 / It also guards two things that really did break:
 *   · @theme inline 不会输出 --color-* 变量，因此（:root / @layer 里）
 *     写 var(--color-x) 会得到一个未定义的变量 —— 必须写 var(--x)。
 *   · globals.css 自己的组件区（@layer 之后）也曾经藏了 8 处硬编码颜色。
 *
 * Run:  pnpm check:tokens      （已接入 pnpm build）
 *
 * 唯一例外 / The only sanctioned exception:
 *   · src/lib/theme-color.ts —— <meta theme-color> 无法使用 CSS 变量
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TARGETS = ["src", "scripts"];
const CSS = "src/app/globals.css";
const ALLOW = new Set(["src/lib/theme-color.ts"]);
const EXT = /\.(tsx?|css|mjs)$/;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

const files = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === "generated" || e.name === "node_modules") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (EXT.test(e.name)) files.push(p);
  }
}
for (const t of TARGETS) await walk(path.join(ROOT, t));

const violations = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  if (ALLOW.has(rel)) continue;
  const text = await readFile(file, "utf8");

  // In globals.css the palette lives above the first @layer block.
  const paletteEnd = rel === CSS ? text.indexOf("@layer base") : -1;

  text.split("\n").forEach((line, i) => {
    const offset = text.split("\n").slice(0, i).join("\n").length;
    if (paletteEnd !== -1 && offset > paletteEnd) {
      for (const m of line.matchAll(HEX)) {
        violations.push({ rel, line: i + 1, match: m[0], text: line.trim().slice(0, 90), kind: "hex outside the palette" });
      }
    } else if (rel !== CSS) {
      for (const m of line.matchAll(HEX)) {
        const rest = line.slice(m.index + m[0].length);
        // ignore anchors (#main) and non-colour fragments
        if (/^[a-zA-Z]/.test(rest) && !/^[0-9a-fA-F]/.test(m[0].slice(1))) continue;
        violations.push({ rel, line: i + 1, match: m[0], text: line.trim().slice(0, 90), kind: "hex outside the palette" });
      }
    }

    if (rel === CSS && line.includes("var(--color-")) {
      violations.push({
        rel,
        line: i + 1,
        match: "var(--color-*)",
        text: line.trim().slice(0, 90),
        kind: "@theme inline does not emit --color-* — use var(--<role>) instead",
      });
    }
  });
}

if (violations.length === 0) {
  console.log("✓ 令牌检查通过 / token check passed — palette is the only source of colour");
  process.exit(0);
}

console.error("✗ 设计令牌检查失败 / design-token check failed:\n");
for (const v of violations) console.error(`  ${v.rel}:${v.line}  [${v.kind}]\n      ${v.match}   ${v.text}`);
console.error(`
整改方式 / How to fix:
  · 颜色 -> 语义类名（bg-primary / text-faint / border-border …）
  · 确实需要新颜色 -> 先在 globals.css 的 :root 色板里定义，再引用
  · globals.css 内部 -> 用 var(--background) 这类角色变量，不要写 var(--color-x)
`);
process.exit(1);
