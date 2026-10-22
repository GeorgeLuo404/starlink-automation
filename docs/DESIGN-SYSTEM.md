# 设计系统与开发约定

颜色、区块主题、字号和线稿插画都定义在 `src/app/globals.css` 与 `src/lib/line-art/`。
组件只使用语义类名，换配色、换主题不需要改组件。

---

## 颜色：色板 → 语义角色

`globals.css` 把颜色分成两层，**十六进制只允许出现在第一层**：

```css
/* 1 · 原始色板 —— 唯一出现十六进制的地方 */
:root {
  --orange-500: #f24e1e;   /* 朱砂橙，唯一的强调色 */
  --ink-950:    #0a0a0b;   /* 墨黑区块 */
  --paper-100:  #f1f0ec;   /* 纸白区块 */
  /* … */
}

/* 2 · 语义角色 —— 组件只使用这一层 */
:root {
  --primary:          var(--orange-500);
  --background:       var(--ink-950);
  --muted-foreground: var(--stone-400);
  /* … */
}
```

换配色只改色板，例如 `--orange-500: #f97316;`，按钮、链接、高亮、图标和线稿会一起变
（`public/media` 占位图需运行 `pnpm media:placeholders` 重新生成）。

**令牌守卫**：`pnpm check:tokens`（`pnpm build` 会执行）扫描 `src/` 与 `scripts/`，在色板之外发现十六进制颜色即失败并给出行号。
唯一例外是 `src/lib/theme-color.ts`：`<meta name="theme-color">` 无法使用 CSS 变量。

### 语义类名速查

| 场景 | 类名 |
| --- | --- |
| 页面底色 / 正文 | `bg-background` `text-foreground` |
| 交替区块底色 | `bg-surface` |
| 卡片 / 面板 / 表单 | `bg-card` `border-border` |
| 品牌主色 | `bg-primary` `text-primary` `border-primary/40`；作文字用 `text-primary-text`（白底上自动加深） |
| 次级面 / 悬停面 | `bg-secondary` `hover:bg-secondary-hover` |
| 轨道 / 缩略图底 | `bg-raised` |
| 悬停描边 | `hover:border-lifted` |
| 正文分级 | `text-foreground` > `text-body` > `text-subtle` > `text-muted-foreground` > `text-faint` > `text-ghost` |
| 状态 | `text-success` `text-signal` `text-destructive` `text-destructive-soft` |

透明度用 Tailwind 语法：`bg-primary/10`、`border-destructive/40`。

---

## 区块主题、字号与基础件

页面由黑白区块交替组成。区块加上主题类，内部的工具类和 `ui/` 组件随之换色：

| 类名 | 用途 |
| --- | --- |
| `theme-dark` | 墨黑区块（页头、首屏、业务能力、流程、页脚） |
| `theme-light` | 纸白区块，卡片为白色（案例、新闻） |
| `theme-white` | 白色区块，卡片为浅纸色（正文、表单） |

- 字号：`display`（首页大标题）、`title-1`（内页标题）、`title-2`（区块标题）、`title-3`（卡片标题）、`lead`（导语）、`eyebrow`（小标）
- 区块上下留白：`section-y`；滚动显现：`reveal`；首屏入场：`intro`
- 各页共用的基础件在 `src/components/site/kit.tsx`（基于 shadcn）：`Eyebrow`、`SectionHead`、`PillLink`、`FilterLink`、`Cover`、`CornerArrow`、`EmptyState`
- 字体全部自托管：Inter / JetBrains Mono 在 `src/app/fonts/`，中文用 `@fontsource-variable/noto-sans-sc`（按 unicode-range 切片），不依赖 Google Fonts

---

## 线稿插画与占位图

`src/lib/line-art/` 是一套等轴测线稿（PLC 机架、机器人、装配线、视觉检测……），纯数据、不依赖 React：

- 页面中内联绘制（`components/site/line-art.tsx`），颜色跟随区块主题；
- `pnpm media:placeholders` 把同一批线稿写成 `public/media` 下的 SVG 占位图
  （`service-<slug>.svg`、`case-<slug>.svg`、`article-<slug>.svg`、`gallery-01…09.svg`、`factory.svg`、`og.svg`），
  并生成站点图标 `src/app/icon.svg` 与 `src/app/favicon.ico`（图形定义在 `scripts/brand-mark.ts`）。颜色读自色板，结果确定。

业务能力、项目案例、新闻的封面都经过 `coverSrc()`（`src/lib/utils.ts`）：后台上传了封面就用照片，否则用对应的线稿占位图，
版式不变。新增条目时，在脚本的对照表里为它指定线稿题材后重新运行即可（未指定的用默认题材）。

---

## 开发约定

- **优先使用现成组件库**：shadcn/ui（`npx shadcn@latest add <component>`）及其生态，轮播用 Embla、拖动排序用 dnd-kit、表格用 TanStack Table，不手写同类控件。
- **正文标记**由 `src/components/site/rich-text.tsx` 解析（`##`、`###`、列表、引用、`**加粗**`、`` `代码` ``），不引入 Markdown 库；需要表格等更强排版时，替换这一个组件即可。
- **`next/image` 的 `fill`**：父元素必须是 `relative`（条件 className 里也不能漏），否则图片相对更外层定位，控制台逐张报警。
- **装饰层**（`absolute inset-0` 的网格、光晕、渐变）加 `pointer-events-none`，否则会盖住其后未定位的内容、吞掉点击；`opacity-0` 的悬停工具条同样需要 `pointer-events-none group-hover:pointer-events-auto`（或用 `hidden`）。
- **`h-full` 链条**：只有父元素高度确定时才生效。从网格项到使用 `h-full` 的元素，中间每一层都要传递高度（`h-full` 或 `flex-1`）。
- **新增根布局**时，在 `<html>` 上加 `data-scroll-behavior="smooth"`（`globals.css` 设置了平滑滚动，Next.js 需要据此在路由切换时临时关闭）。
- **上传文件**一律通过 `src/lib/upload-client.ts` 的 `uploadFile()`，文件地址一律是 `/uploads/<key>`（见 [DEPLOYMENT.md](DEPLOYMENT.md#15-文件上传与访问)）。
