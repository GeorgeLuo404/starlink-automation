# 深圳市星链自动化有限公司 · 官方网站

工业风企业官网 + 内容管理后台。中英双语（以中文为主），支持文章、案例、图库、视频与文件上传下载。

> Industrial-style corporate website with a full content admin. Bilingual (Chinese-first), with articles, case studies, galleries, video and file upload/download.

---

## 1. 技术栈与选型说明

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 前端框架 | **Next.js 16**（App Router）+ **TypeScript 5.9** | 服务端组件负责取数与 SEO，客户端组件只负责交互与动画 |
| 样式 | **Tailwind CSS v4** + 自建设计系统 | 工业深色主题写在 `src/app/globals.css` 的 `@theme` 与 `@layer components` 中 |
| 组件 | **shadcn/ui 风格**（手写实现） | 见下方「为什么没有直接用 Radix」 |
| 动画 | **motion**（原 framer-motion） | 首屏遮罩揭示、滚动点亮大字、数字滚动、轨道旋转、磁吸按钮等 |
| 数据库 | **PostgreSQL** + **Prisma 7** | 见下方「Prisma 7 的变化」 |
| 认证 | `jose`（JWT）+ `node:crypto` scrypt | 无第三方认证服务依赖，会话存 HttpOnly Cookie |
| 文件存储 | 本地磁盘 **或** S3 兼容对象存储 | 阿里云 OSS / MinIO / AWS S3 均可，通过 `STORAGE_DRIVER` 切换 |
| 部署 | Vercel（开发预览）· 阿里云 ECS + RDS + OSS（生产） | 见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |

### 关于你的技术栈：结论与建议

你的选型整体是**合理的**，我基本沿用了它，只做了两处调整，另外有几点需要在动手前想清楚：

1. **shadcn/ui 没有直接引入 Radix UI**（调整一）
   shadcn/ui 本身只是「复制到你项目里的组件源码」，真正提供无头交互的是 Radix。本项目手写了
   Button / Input / Dialog / Dropdown / Tabs / Select / Switch / Badge / Card / Table 等基础件，
   保留了 shadcn 的 `cva + cn + data-slot` 约定和 `components.json`。
   **好处**：少了 15 个依赖包与随之而来的版本漂移风险，首屏 JS 更小。
   **仍然兼容**：后续想加别的 shadcn 组件，直接 `npx shadcn@latest add <component>` 即可，
   它会自动把 Radix 依赖装进来。

2. **没有引入 markdown 渲染库**（调整二）
   后台正文使用一套轻量标记（`##`、`###`、`- `、`1. `、`> `、`**加粗**`、`` `代码` ``），
   由 `src/components/site/rich-text.tsx` 解析。避免了引入 marked/remark 带来的 XSS 清洗面。
   如果你需要表格、脚注、图片排版等更强的排版能力，替换成 `react-markdown + rehype-sanitize` 即可，
   替换点只有 `RichText` 一个组件。

3. **Vercel 只适合做开发预览，不适合作为面向中国大陆的正式站点**（重要）
   - Vercel 的节点在境外，国内访问延迟高且不稳定；
   - 更关键的是：**域名备案要求接入商是中国大陆的服务商**。域名解析到 Vercel 是无法通过
     工信部备案的，也就无法使用国内 CDN 与国内服务器。
   - 建议节奏：**现在就以阿里云为目标环境开发**，Vercel 仅用于内部预览与 PR 预览。
     备案通常需要 2–4 周，建议与开发并行启动。

4. **文件存储绝对不要放在应用本地磁盘**（如果部署到 Vercel）
   Vercel 是无状态 Serverless，文件系统只读且不持久化，上传的文件重启即丢。
   本项目默认 `STORAGE_DRIVER=local`（本地开发方便），生产环境请切到 `s3`（阿里云 OSS）。

5. **视频建议走阿里云 VOD / CDN，而不是直接放 OSS**
   首页背景视频若直接放 OSS，每个访客都会回源拉取整段视频。量起来之后建议接 VOD 转码 + CDN 加速，
   后台「站点设置」里填的地址是普通的 URL，换成 VOD 地址即可，无需改代码。

6. **PostgreSQL 是合适的**。如果只是单人维护的小站，SQLite 也能跑，但既然计划上云，
   RDS PostgreSQL 在备份、监控、扩容上都更省心，且本项目已按 PostgreSQL 建模。

### Prisma 7 的变化（升级踩坑记录）

Prisma 7 相比 6 有两个破坏性变更，本项目已经处理好：

- **连接串不再写在 `schema.prisma`**，而是移到根目录的 `prisma.config.ts`；
- **不再内置 Rust 查询引擎**，PostgreSQL 通过驱动适配器 `@prisma/adapter-pg`（基于 `pg`）连接；
- 生成的 Client 是**源码形式**，输出到 `src/generated/prisma`（已在 .gitignore 中），
  安装依赖后由 `postinstall` 自动生成。

如果你更希望沿用 Prisma 6 的写法，把 `package.json` 中的 `prisma` / `@prisma/client`
降到 `^6`，并删除 `prisma.config.ts` 与适配器即可。

---

## 2. 功能清单

### 前台（中英双语）

- **首页**：视频首屏 + 遮罩揭示标题、滚动点亮大字、五项业务能力、数字滚动统计、
  六步交付流程、精选案例、**环形集成能力图**（节点公转、文字始终正向）、
  六条优势手风琴、合作伙伴双排跑马灯、最新动态、现场图库、行动号召
- **业务能力** `/services`、`/services/[slug]`：服务内容、交付物、常见问题
- **项目案例** `/cases`、`/cases/[slug]`：行业、年份、成果指标、服务范围、图集
- **新闻动态** `/news`、`/news/[slug]`：分类筛选、关键词搜索、分页、阅读量
- **现场图库** `/gallery`：相册筛选、瀑布栅格、灯箱（键盘 ←/→/Esc）
- **资料下载** `/downloads`：文件类型/大小/版本展示、下载计数、可选留资弹窗
- **关于我们** `/about`：公司简介、做事方式、发展历程、团队构成、资质
- **联系我们** `/contact`：带校验的表单 + 联系方式 + 位置

技术细节：

- 完整的 **hreflang / canonical / OpenGraph / Twitter Card**；
  自动生成 `sitemap.xml` 与 `robots.txt`（robots 已屏蔽 `/admin`）
- 语义化标签、跳转到主内容的 skip link、`prefers-reduced-motion` 全量降级
- **数据库不可用时自动降级**到内置内容，站点永远不会白屏或 500

### 后台 `/admin`

| 模块 | 能力 |
| --- | --- |
| 仪表盘 | 内容统计、最新询盘 |
| 文章 / 新闻 | 增删改、草稿/发布/归档、置顶与精选、封面、标签、SEO 字段 |
| 项目案例 | 增删改、成果指标、服务范围、分类排序 |
| 业务能力 | 增删改、图标、服务内容、交付物、FAQ |
| 图库 | 相册归类、图片/视频 |
| 媒体库 | **拖拽多文件上传**（带进度）、类型/目录筛选、搜索、复制链接、删除 |
| 下载资料 | 文件上传、类型/大小/版本、下载次数统计 |
| 客户询盘 | 状态流转（新/跟进中/完成/垃圾）、跟进备注、删除 |
| 合作伙伴 | 首页跑马灯名录 |
| 站点设置 | 首页视频与封面、联系方式、ICP 备案号、统计 ID |

---

## 3. 快速开始

```bash
# 1. 安装依赖（会自动执行 prisma generate）
pnpm install

# 2. 准备环境变量
cp .env.example .env
#    至少修改 AUTH_SECRET：openssl rand -base64 32

# 3. 启动数据库（本机已有 PostgreSQL 可跳过）
docker compose up -d db

# 4. 建表（应用 prisma/migrations）+ 导入内置内容 + 创建管理员
pnpm db:deploy
pnpm db:seed

# 5. 启动
pnpm dev
```

- 前台：<http://localhost:3000> （会跳转到 <http://localhost:3000/zh>）
- 后台：<http://localhost:3000/admin>
- 默认账号：`admin@starlink-auto.com` / `Starlink@2026` —— **上线前务必修改**

> 没有数据库也能运行：前台会使用 `src/content/defaults.ts` 的内置内容，
> 后台则会显示初始化指引。

### 修改管理员密码

```bash
ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='一个足够强的密码' pnpm admin:create
```

### 常用脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 开发服务器 |
| `pnpm build` | 生产构建（含 prisma generate） |
| `pnpm start` | 启动生产构建 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm db:migrate --name <名称>` | 修改 `schema.prisma` 后生成并应用迁移文件（需提交到 Git） |
| `pnpm db:deploy` | 应用已有迁移（首次建表、CI、生产） |
| `pnpm db:reset` | 清空本地库，重新应用全部迁移并执行 seed（仅限开发） |
| `pnpm db:seed` | 导入内置内容：只写入空表，不会覆盖后台已编辑的数据 |
| `pnpm db:seed --force` | 用 `defaults.ts` 覆盖同 slug 的内置内容 |
| `pnpm db:studio` | Prisma Studio 可视化查看数据（也可用 TablePlus 等客户端连接 `DATABASE_URL`） |
| `pnpm admin:create` | 创建/重置管理员 |
| `pnpm docker:db` | 启动本地 PostgreSQL |
| `node scripts/generate-placeholders.mjs` | 重新生成占位图 |

---

## 4. 目录结构

```
├── prisma/
│   ├── schema.prisma          数据模型（11 张表）
│   └── seed.ts                内容初始化脚本
├── prisma.config.ts           Prisma 7 配置（数据源 URL 在这里）
├── public/media/              占位图（上线前替换为真实照片）
├── scripts/
│   ├── create-admin.ts        管理员创建/重置
│   └── generate-placeholders.mjs
├── src/
│   ├── app/
│   │   ├── (site)/[locale]/   前台（多根布局之一）
│   │   ├── (admin)/admin/     后台（多根布局之二）
│   │   ├── api/               contact / subscribe / upload / download / media / views
│   │   ├── sitemap.ts robots.ts
│   │   └── globals.css        设计系统
│   ├── components/
│   │   ├── motion/            动画原语（Reveal / Stagger / ScrollHighlightText / Counter / Marquee / Magnetic / Parallax / TiltCard）
│   │   ├── site/              前台组件
│   │   ├── admin/             后台组件
│   │   └── ui/                基础组件（shadcn 风格）
│   ├── content/defaults.ts    ★ 兜底内容 + 种子数据源
│   ├── lib/
│   │   ├── data.ts            内容仓库（先查库，失败回退默认内容）
│   │   ├── storage.ts         存储抽象（本地 / S3）
│   │   ├── auth.ts session.ts password.ts
│   │   ├── prisma.ts          Prisma 7 客户端工厂
│   │   └── i18n/              语言配置与字典
│   ├── messages/zh.json en.json
│   └── proxy.ts               Next.js 16 proxy（前身 middleware）
└── docs/
    ├── DEPLOYMENT.md          部署与备案（重点看这个）
    └── ADMIN-GUIDE.md         后台使用说明
```

---

## 5. 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 后台必填 | PostgreSQL 连接串 |
| `AUTH_SECRET` | ✅ | 会话签名密钥，`openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | 站点地址，用于 canonical / sitemap / OG |
| `STORAGE_DRIVER` | | `local`（默认）或 `s3` |
| `STORAGE_LOCAL_DIR` | | 本地存储根目录，默认 `./public/uploads` |
| `S3_REGION` / `S3_ENDPOINT` / `S3_BUCKET` | s3 时必填 | 阿里云 OSS 示例：`oss-cn-shenzhen` / `https://oss-cn-shenzhen.aliyuncs.com` |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | s3 时必填 | 建议使用 RAM 子账号，仅授予该 Bucket 读写 |
| `S3_PUBLIC_BASE_URL` | s3 时必填 | 公网访问前缀，如 `https://cdn.your-domain.com` |
| `MAX_UPLOAD_MB` | | 单文件上限，默认 200 |

---

## 6. 设计系统与开发约定

### 6.1 两层结构：色板 → 语义角色

`src/app/globals.css` 把颜色分成两层，**十六进制只允许出现在第一层**：

```css
/* 1 · 原始色板 —— 唯一出现十六进制的地方 */
:root {
  --brand-500: #22e0ff;
  --ink-950:   #08090b;
  --paper-500: #8a929e;
  /* … */
}

/* 2 · 语义角色 —— 组件只允许使用这一层 */
:root {
  --primary:          var(--brand-500);
  --background:       var(--ink-950);
  --muted-foreground: var(--paper-500);
  /* … */
}
```

组件里写的是语义类名，不是颜色值：

```tsx
<div className="bg-background text-foreground border-border">
  <span className="text-muted-foreground">次要说明文字</span>
  <a className="bg-primary text-primary-foreground">主要按钮</a>
</div>
```

**换配色只需要改色板**，例如把主色从青色改成橙色：

```css
--brand-500: #f97316;   /* 全站按钮、链接、高亮、图标、SVG 一起变 */
```

### 6.2 自动守卫

```bash
pnpm check:tokens   # 已接入 pnpm build，违反时构建直接失败
```

它扫描 `src/` 与 `scripts/`，只要在色板之外发现十六进制颜色就报错并指出行号。
所以「组件里偷偷写死一个颜色」这件事在构建阶段就会被拦住。

> 唯一的例外是 `src/lib/theme-color.ts` —— `<meta name="theme-color">` 渲染在 HTML head 里，
> 无法使用 CSS 变量，只能是一个字面量。

### 6.3 语义角色速查

| 场景 | 类名 |
| --- | --- |
| 页面底色 / 正文 | `bg-background` `text-foreground` |
| 交替区块底色 | `bg-surface` |
| 卡片 / 面板 / 表单 | `bg-card` `border-border` |
| 品牌主色 | `bg-primary` `text-primary` `border-primary/40` |
| 次级面 / 悬停面 | `bg-secondary` `hover:bg-secondary-hover` |
| 轨道 / 缩略图底 | `bg-raised` |
| 正文分级 | `text-foreground` > `text-body` > `text-subtle` > `text-muted-foreground` > `text-faint` > `text-ghost` |
| 状态 | `text-success` `text-signal` `text-destructive` `text-destructive-soft` |

透明度直接用 Tailwind 语法：`bg-primary/10`、`border-destructive/40`。

### 6.4 四条容易踩的坑（都已经踩过一次）

**① `next/image` 的 `fill` 必须放在 `relative` 的父元素里**

`fill` 会渲染成 `position: absolute` 的图片，它相对**最近的定位祖先**定位。如果直接父元素是
默认的 `static`，图片会跑去找更外层的定位元素 —— 而且 Next.js 会在浏览器控制台逐张报警。

```tsx
// ✗ 父元素是 static，控制台会刷警告
<div className={i === 0 ? "aspect-square" : "aspect-4/3"}>
  <Image src={...} fill alt="" />
</div>

// ✓ 父元素定位，比例框同时提供高度
<div className={i === 0 ? "relative aspect-square" : "relative aspect-4/3"}>
  <Image src={...} fill alt="" />
</div>
```

注意条件 className 很容易漏（本项目首页图库与图库页就漏过一次）——
凡是 `fill` 的父元素，务必确认 `relative` 在里面。

**② `scroll-behavior: smooth` 要告诉 Next.js 来源**

`globals.css` 里给 `html` 设了 `scroll-behavior: smooth`。Next.js 需要知道它是来自样式表的，
才能在路由切换时临时挂起，否则会出现「跳转后缓慢滚动到顶部」。本项目已在两个根布局的
`<html>` 上加了 `data-scroll-behavior="smooth"`：

```tsx
<html lang={...} className="dark" data-scroll-behavior="smooth">
```

如果以后新增根布局（例如再开一个 `(xxx)` 路由组），记得同样加上。

**③ 纯装饰层必须加 `pointer-events-none`**

`absolute inset-0` 的网格、光晕、渐变层是**定位元素**，而定位元素会画在**非定位兄弟元素之上**。
如果它后面的内容没有定位（比如表单直接放在一个普通 `div` 里），这个装饰层就会盖住表单，
**吞掉所有点击 —— 输入框点不中、也没法输入**。`aria-hidden="true"` 对命中测试没有任何作用。

```tsx
// ✗ 装饰层挡住表单：输入框完全无法交互
<div className="relative flex min-h-screen items-center justify-center">
  <div className="grid-blueprint absolute inset-0 opacity-40" aria-hidden="true" />
  <form>...</form>            {/* 非定位 → 被上面的层盖住 */}
</div>

// ✓ 装饰层不接收指针事件；内容自身也定位，双保险
<div className="relative flex min-h-screen items-center justify-center">
  <div className="grid-blueprint pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
  <form className="relative">...</form>
</div>
```

同理，`opacity-0` 的悬停工具条**仍然可以点击**，要么加 `pointer-events-none group-hover:pointer-events-auto`，
要么用 `hidden group-hover:block`。

页面上其它 `absolute inset-0` 之所以没问题，是因为内容包在 `container-x relative` 里（定位层之间按 DOM 顺序叠放），
或者装饰层本身在 `<Link>` 内部（点谁都会触发父级链接）。新增区块时注意保持这个前提。

**④ `h-full` 的链条不能被中间层打断**

`h-full` 是 `height: 100%`，**只有当父元素高度是确定值时才生效**。网格项会因为
`align-items: stretch` 被拉伸到整行高度（高度确定），所以它的**直接子元素**写 `h-full` 有效；
但只要中间多一层没设高度的普通 `div`，这一层就退化成"内容高度"，后面所有 `h-full` 全部失效。

本项目首页「业务能力」卡片就踩过：`StaggerItem`（网格项，被拉伸）→ `TiltCard`（普通 div，无高度）
→ `Link h-full`，结果 Link 只有文字那么高，**鼠标移到卡片下方的空白区域没有 hover 反应**，
`.corner-ticks` 的角标也画在了半空中。

```tsx
// ✗ TiltCard 没有高度 → Link 的 h-full 失效
<StaggerItem className="bg-surface">      {/* 网格项，被拉伸到整行高 */}
  <TiltCard max={3}>                       {/* height: auto */}
    <Link className="flex h-full ...">     {/* 100% of auto = 内容高度 */}

// ✓ 把高度传递下去
<StaggerItem className="bg-surface">
  <TiltCard max={3} className="h-full">
    <Link className="flex h-full ...">
```

排查口诀：**从网格项到 `h-full` 元素之间，每一层都要能传递高度**（`h-full`、`flex-1`，
或本身就是网格/弹性子项）。

---

## 7. 你可能想改的地方

| 想改什么 | 改哪里 |
| --- | --- |
| 公司名、电话、邮箱、地址 | `src/content/defaults.ts` 的 `company`，或后台「站点设置」 |
| 配色 | **只改** `src/app/globals.css` 的色板（见下方第 6.1 节），组件无需改动 |
| 圆角 / 字体 | `src/app/globals.css` 的 `--radius` 与 `--font-*` |
| 首页文案 | `src/messages/zh.json` 与 `en.json` |
| 五项业务、案例、新闻等初始内容 | `src/content/defaults.ts`（然后 `pnpm db:seed --force`，会覆盖后台对这些记录的修改） |
| 占位图换成真实照片 | 直接覆盖 `public/media/*.svg`，或在后台媒体库上传后替换引用 |
| 导航结构 | `src/components/site/nav-items.ts` |

---

## 8. 许可证与归属

本项目为深圳市星链自动化有限公司定制开发，代码归甲方所有。
参考站点的视觉与动效为**设计参考**，源码、文案与图形资源均为独立实现，不包含第三方受版权保护的素材。
