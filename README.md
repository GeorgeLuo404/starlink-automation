# 深圳市星链自动化有限公司 · 官方网站

工业风企业官网 + 内容管理后台。仅提供中文内容，支持文章、案例、图库、视频与文件上传下载。

---

## 1. 技术栈与选型说明

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 前端框架 | **Next.js 16**（App Router）+ **TypeScript 5.9** | 服务端组件负责取数与 SEO，客户端组件只负责交互与动画 |
| 样式 | **Tailwind CSS v4** + 自建设计系统 | 墨黑 / 纸白分区 + 朱砂橙单一强调色，写在 `src/app/globals.css`（见第 6 节） |
| 组件 | **shadcn/ui**（Radix UI） | `src/components/ui`，配色接入下方设计令牌；新增组件用 `npx shadcn@latest add <component>` |
| 动画 | CSS + **motion**（原 framer-motion） | 入场与滚动显现用纯 CSS（`.intro` / `.reveal`）；菜单、灯箱与数字滚动用 motion |
| 数据库 | **PostgreSQL** + **Prisma 7** | 见下方「Prisma 7 的变化」 |
| 认证 | `jose`（JWT）+ `node:crypto` scrypt | 无第三方认证服务依赖，会话存 HttpOnly Cookie |
| 文件存储 | 本地磁盘 **或** S3 兼容对象存储 | 阿里云 OSS / MinIO / AWS S3 均可，通过 `STORAGE_DRIVER` 切换 |
| 部署 | Vercel（开发预览）· 阿里云 ECS + RDS + OSS（生产） | 见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |

### 关于你的技术栈：结论与建议

你的选型整体是**合理的**，我基本沿用了它，只做了两处调整，另外有几点需要在动手前想清楚：

1. **shadcn/ui 组件基于 Radix UI**（调整一）
   `src/components/ui` 是 shadcn/ui 组件源码（`radix-ui` 提供焦点管理与键盘交互），
   颜色只使用 `globals.css` 中的语义令牌。字体 Inter / JetBrains Mono 由 `next/font/local`
   从 `src/app/fonts/` 自托管；中文用 `@fontsource-variable/noto-sans-sc`（按 unicode-range
   切片、随站点静态资源一起发布）。构建与访问都不依赖 Google Fonts，阿里云部署可直接使用。

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
   图库视频若直接放 OSS，每次播放都会回源拉取整段视频。量起来之后建议接 VOD 转码 + CDN 加速，
   后台图库里填的视频地址是普通的 URL，换成 VOD 地址即可，无需改代码。

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

### 前台

- **首页**：3D 星座粒子首屏（星点连成机器人工作站，现场总线报文实时流动）+ 遮罩揭示标题、滚动点亮大字、五项业务能力、数字滚动统计、
  六步交付流程、推荐案例、**环形集成能力图**（节点公转、文字始终正向）、
  六条优势手风琴、支持的品牌与平台 Logo 跑马灯、最新动态、现场图库、行动号召
- **业务能力** `/services`、`/services/[slug]`：服务内容、交付物、常见问题
- **项目案例** `/cases`、`/cases/[slug]`：行业、年份、成果指标、服务范围、图集
- **新闻动态** `/news`、`/news/[slug]`：分类筛选、关键词搜索、分页、阅读量
- **现场图库** `/gallery`：相册筛选、瀑布栅格、灯箱（键盘 ←/→/Esc）
- **资料下载** `/downloads`：文件类型/大小/版本展示、下载计数、可选留资弹窗
- **关于我们** `/about`：公司简介、做事方式、发展历程、团队构成、资质
- **联系我们** `/contact`：带校验的表单 + 联系方式 + 位置

技术细节：

- 完整的 **canonical / OpenGraph / Twitter Card**；
  自动生成 `sitemap.xml` 与 `robots.txt`（robots 已屏蔽 `/admin`）
- 旧的 `/zh/...`、`/en/...` 地址会 308 永久跳转到不带语言前缀的新地址
- 语义化标签、跳转到主内容的 skip link、`prefers-reduced-motion` 全量降级
- **数据库不可用时自动降级**到内置内容，站点永远不会白屏或 500

### 后台 `/admin`

| 模块 | 能力 |
| --- | --- |
菜单「网站内容」一组与前台导航同序同名。

| 模块 | 能力 |
| --- | --- |
| 仪表盘 | 内容统计、最新询盘 |
| 客户询盘 | 状态流转（新/跟进中/完成/垃圾）、跟进备注、删除 |
| 首页 | 按页面顺序编辑每个栏目：首屏、理念与数据、服务流程、集成能力、选择理由、行动号召等；品牌平台（Logo 上传、拖拽排序、显示开关） |
| 业务能力 | 增删改、拖动排序、图标、服务内容、交付物、FAQ；列表页页头文字 |
| 项目案例 | 增删改、拖动排序、推荐到首页（最多 5 个）、成果指标、服务范围；列表页页头文字 |
| 新闻动态 | 增删改、草稿/发布/归档、置顶、封面、标签、SEO 字段；列表页页头文字 |
| 现场图库 | 相册归类、图片/视频、拖动排序；页头文字 |
| 资料下载 | 文件上传、类型/大小/版本、下载次数统计、拖动排序；页头文字 |
| 关于我们 | 页头、公司简介与配图、关键数据、做事方式、发展历程、团队构成、资质 |
| 联系我们 | 页头、表单说明、补充联系信息 |
| 媒体库 | **拖拽多文件上传**（带进度）、类型/目录筛选、搜索、复制链接、删除 |
| 站点设置 | 公司信息、联系方式、页脚简介、ICP / 公安备案号、搜索引擎设置、统计 ID |

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

- 前台：<http://localhost:3000>
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
| `pnpm media:placeholders` | 重新生成线稿占位图（`public/media`，见第 6.5 节） |

---

## 4. 目录结构

```
├── prisma/
│   ├── schema.prisma          数据模型（11 张表）
│   └── seed.ts                内容初始化脚本
├── prisma.config.ts           Prisma 7 配置（数据源 URL 在这里）
├── public/media/              线稿占位图（后台上传真实照片后自动替换）
├── scripts/
│   ├── create-admin.ts        管理员创建/重置
│   ├── generate-placeholders.ts  生成线稿占位图
│   └── check-tokens.mjs       设计令牌守卫
├── src/
│   ├── app/
│   │   ├── (site)/            前台（多根布局之一）
│   │   ├── (admin)/admin/     后台（多根布局之二）
│   │   ├── api/               contact / subscribe / upload / download / media / views
│   │   ├── sitemap.ts robots.ts
│   │   └── globals.css        设计系统
│   ├── components/
│   │   ├── motion/            需要 JS 的动画（Counter / useScrolled）
│   │   ├── site/              前台组件（kit.tsx 基础件、卡片、页头页脚）
│   │   │   └── home/          首页各区块（首屏星座动画、六步折叠流程 …）
│   │   ├── admin/             后台组件
│   │   └── ui/                基础组件（shadcn 风格）
│   ├── content/
│   │   ├── defaults.ts        ★ 兜底内容 + 种子数据源
│   │   └── copy.json          页面文案（导航、标题、按钮、表单提示等）
│   ├── lib/
│   │   ├── data.ts            内容仓库（先查库，失败回退默认内容）
│   │   ├── line-art/          线稿插画（几何 + 题材），页面内联与占位图共用
│   │   ├── storage.ts         存储抽象（本地 / S3）
│   │   ├── auth.ts session.ts password.ts
│   │   └── prisma.ts          Prisma 7 客户端工厂
│   └── proxy.ts               Next.js 16 proxy（前身 middleware），守卫 /admin
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
  --orange-500: #f24e1e;   /* 朱砂橙，唯一的强调色 */
  --ink-950:    #0a0a0b;   /* 墨黑区块 */
  --paper-100:  #f1f0ec;   /* 纸白区块 */
  /* … */
}

/* 2 · 语义角色 —— 组件只允许使用这一层 */
:root {
  --primary:          var(--orange-500);
  --background:       var(--ink-950);
  --muted-foreground: var(--stone-400);
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

**换配色只需要改色板**，例如换一种橙色：

```css
--orange-500: #f97316;   /* 全站按钮、链接、高亮、图标、线稿一起变；占位图需重新生成 */
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
| 品牌主色 | `bg-primary` `text-primary` `border-primary/40`；作文字用 `text-primary-text`（白底上自动加深） |
| 次级面 / 悬停面 | `bg-secondary` `hover:bg-secondary-hover` |
| 轨道 / 缩略图底 | `bg-raised` |
| 悬停描边 | `hover:border-lifted` |
| 正文分级 | `text-foreground` > `text-body` > `text-subtle` > `text-muted-foreground` > `text-faint` > `text-ghost` |
| 状态 | `text-success` `text-signal` `text-destructive` `text-destructive-soft` |

透明度直接用 Tailwind 语法：`bg-primary/10`、`border-destructive/40`。

### 6.4 区块主题、字号与基础件

页面由黑白区块交替组成。区块加上主题类，内部所有工具类和 `ui/` 组件就跟着换色：

| 类名 | 用途 |
| --- | --- |
| `theme-dark` | 墨黑区块（页头、首屏、业务能力、流程、页脚） |
| `theme-light` | 纸白区块，卡片为白色（案例、新闻） |
| `theme-white` | 白色区块，卡片为浅纸色（正文、表单） |

字号：`display`（首页大标题）、`title-1`（内页标题）、`title-2`（区块标题）、`title-3`（卡片标题）、
`lead`（导语）、`eyebrow`（小标），区块上下留白用 `section-y`。滚动显现加 `reveal`，首屏入场加 `intro`。

`src/components/site/kit.tsx` 里是各页共用的基础件，全部基于 shadcn：`Eyebrow`、`SectionHead`、
`PillLink`（胶囊按钮链接）、`FilterLink`（分类筛选）、`Cover`（封面图框）、`CornerArrow`、`EmptyState`。

### 6.5 线稿插画与占位图

`src/lib/line-art/` 是一套等轴测线稿（PLC 机架、机器人、装配线、视觉检测……），纯数据、不依赖 React：

- 页面里内联绘制（`components/site/line-art.tsx`），颜色跟随区块主题；
- `pnpm media:placeholders` 把同一批线稿写成 `public/media` 下的 SVG 占位图：
  `service-<slug>.svg`、`case-<slug>.svg`、`article-<slug>.svg`、`gallery-01…09.svg`、`factory.svg`、`og.svg`，
  以及站点图标 `src/app/icon.svg` 与 `src/app/favicon.ico`（16/32/48 像素，图形定义在 `scripts/brand-mark.ts`）。
  颜色读自 `globals.css` 色板，结果是确定的（重复运行文件不变）。

业务能力、项目案例、新闻的封面都经过 `coverSrc()`（`src/lib/utils.ts`）：**后台上传了封面就用照片，
没有就用对应的线稿占位图**，同一个图框，换图不会改变版式。新增一条业务 / 案例 / 文章时，
在脚本的对照表里给它指定一个线稿题材再运行一次即可（未指定的会用默认题材）。

### 6.6 四条容易踩的坑（都已经踩过一次）

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
  <div className="grid-lines absolute inset-0 opacity-40" aria-hidden="true" />
  <form>...</form>            {/* 非定位 → 被上面的层盖住 */}
</div>

// ✓ 装饰层不接收指针事件；内容自身也定位，双保险
<div className="relative flex min-h-screen items-center justify-center">
  <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
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

旧版首页「业务能力」卡片就踩过：网格项被拉伸，但中间一层动画容器没有高度，里面的链接 `h-full`
失效，结果鼠标移到卡片下方的空白区域没有 hover 反应。现在的卡片结构是这样传递高度的：

```tsx
// ✓ 网格项（Link，被拉伸）→ Card h-full → 内容 flex-1
<div className="grid md:grid-cols-3">
  <Link className="group block">            {/* 网格项，被拉伸到整行高 */}
    <Card className="h-full">                {/* 100% of 行高 */}
      <div className="flex flex-1 flex-col">…</div>
```

排查口诀：**从网格项到 `h-full` 元素之间，每一层都要能传递高度**（`h-full`、`flex-1`，
或本身就是网格/弹性子项）。

---

## 7. 你可能想改的地方

| 想改什么 | 改哪里 |
| --- | --- |
| 公司名、电话、邮箱、地址、备案号、SEO | 后台「站点设置」（`src/content/defaults.ts` 的 `company` 只是默认值） |
| 配色 | **只改** `src/app/globals.css` 的色板（见下方第 6.1 节），组件无需改动 |
| 圆角 / 字体 | `src/app/globals.css` 的 `--radius`（后台在 `.admin` 里单独收紧）与 `--font-*` |
| 首页、关于我们、联系我们和列表页页头的文字 | 后台对应菜单（栏目定义在 `src/content/page-sections.ts`，默认文字在 `copy.json` / `defaults.ts`） |
| 按钮、表单提示等界面文字 | `src/content/copy.json` |
| 五项业务、案例、新闻等初始内容 | `src/content/defaults.ts`（然后 `pnpm db:seed --force`，会覆盖后台对这些记录的修改） |
| 占位图换成真实照片 | 在后台对应条目上传「封面图片」即可（见第 6.5 节）；图库在后台「现场图库」里替换 |
| 导航结构 | `src/components/site/nav-items.ts` |
| 服务流程的插图库 | 新插图加到 `src/components/site/home/step-art.tsx` 的 `STEP_ART`，并在 `src/content/step-art.ts` 列出，后台即可选择 |

---

## 8. 许可证与归属

本项目为深圳市星链自动化有限公司定制开发，代码归甲方所有。
参考站点的视觉与动效为**设计参考**，源码、文案与图形资源均为独立实现，不包含第三方受版权保护的素材。
