/**
 * 设计令牌守卫 / Design-token guard
 *
 *   颜色只能来自 globals.css 的色板，组件里不允许出现十六进制字面量。
 *   Colour may only come from the palette in globals.css — no hex literals are
 *   allowed anywhere else, so re-theming the site never requires touching a
 *   component.
 *
 * Run:  pnpm check:tokens      （已接入 pnpm build）
 *
 * 唯一例外 / The only sanctioned exceptions:
 *   · src/app/globals.css    —— 色板本身 / the palette itself
 *   · src/lib/theme-color.ts —— <meta theme-color> 无法使用 CSS 变量
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TARGETS = ["src", "scripts"];
const ALLOW = new Set(["src/app/globals.css", "src/lib/theme-color.ts"]);
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
  text.split("\n").forEach((line, i) => {
    // ignore HTML anchors (#main, #capabilities) and fragments
    for (const m of line.matchAll(HEX)) {
      const rest = line.slice(m.index + m[0].length);
      if (/^[a-zA-Z]/.test(rest) && !/^[0-9a-fA-F]/.test(m[0].slice(1))) continue;
      if (/^[a-z-]+["')\s]/.test(rest) && m[0].length <= 5 && !/^#[0-9a-fA-F]{3}$/.test(m[0])) continue;
      violations.push({ rel, line: i + 1, text: line.trim().slice(0, 100), match: m[0] });
    }
  });
}

if (violations.length === 0) {
  console.log("✓ 令牌检查通过 / token check passed — no hex literals outside the palette");
  process.exit(0);
}

console.error("✗ 发现色板之外的十六进制颜色 / hex colour outside the palette:\n");
for (const v of violations) console.error(`  ${v.rel}:${v.line}  ${v.match}  ${v.text}`);
console.error(`
请改为语义类名（bg-primary / text-faint / border-border …）。
若确实需要新颜色，先在 src/app/globals.css 的 :root 色板中定义，再引用。
Use a semantic class instead (bg-primary / text-faint / border-border …).
Need a brand-new colour? Add it to the :root palette in src/app/globals.css first.
`);
process.exit(1);
