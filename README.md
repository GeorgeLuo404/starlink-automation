# 深圳市星链自动化有限公司 · 官方网站

企业官网 + 内容管理后台（仅中文）。前台展示业务能力、项目案例、新闻、现场图库与资料下载；后台 `/admin` 管理全部内容与客户询盘。

| 环境 | 地址 | 组成 |
| --- | --- | --- |
| MVP（当前） | <https://starlinkautomation.space> | Vercel + Supabase，供客户预览，已禁止搜索引擎收录 |
| 正式环境（ICP 备案后） | 待定 | 阿里云 ECS + RDS PostgreSQL + OSS |

部署细节见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Next.js 16（App Router）· React 19 · TypeScript 5.9 |
| 界面 | Tailwind CSS v4 · shadcn/ui（Radix）· motion · 自托管字体 |
| 数据 | PostgreSQL 17 · Prisma 7（`@prisma/adapter-pg`） |
| 认证 | `jose` JWT 会话（HttpOnly Cookie）+ scrypt 密码哈希，无第三方认证服务 |
| 文件 | 本地磁盘或 S3 兼容存储（Supabase Storage / 阿里云 OSS），对外地址统一为 `/uploads/<key>` |
| 运行时 | Node.js 24（`.nvmrc`）· pnpm 10（`packageManager`） |

## 本地开发

需要 Node.js 24、pnpm 10 和 Docker（本地数据库）。

```bash
pnpm install               # 安装依赖，并自动执行 prisma generate
cp .env.example .env       # 本地环境变量，默认值即可运行
docker compose up -d db    # 启动 PostgreSQL 17
pnpm db:deploy             # 建表
pnpm db:seed               # 导入默认内容并创建管理员
pnpm dev                   # http://localhost:3000，后台 /admin
```

管理员账号取自 `.env` 的 `ADMIN_EMAIL` / `ADMIN_PASSWORD`。没有数据库时前台仍可浏览（使用 `src/content/defaults.ts` 的内置内容），后台会提示初始化步骤。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` · `pnpm build` · `pnpm start` | 开发 · 生产构建 · 运行构建产物 |
| `pnpm check` | 类型检查 + 设计令牌检查（`pnpm build` 也会检查令牌） |
| `pnpm db:migrate --name <名称>` | 修改 `prisma/schema.prisma` 后生成迁移文件（需提交） |
| `pnpm db:deploy` | 应用迁移 |
| `pnpm db:seed` | 导入默认内容（只写空表）；`--force` 用默认内容覆盖同 slug 的记录 |
| `pnpm db:reset` | 清空本地库、重新迁移并导入（仅限本地） |
| `pnpm db:studio` | Prisma Studio |
| `pnpm admin:create` | 创建或重置管理员（读取 `ADMIN_EMAIL` / `ADMIN_PASSWORD`） |
| `pnpm media:placeholders` | 重新生成线稿占位图与站点图标 |

## 环境变量

带注释的模板：`.env.example`（本地）、`.env.production.example`（阿里云）。Vercel 上的取值见 [部署文档](docs/DEPLOYMENT.md#13-环境变量)。

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | 应用使用的 PostgreSQL 连接串；未设置时前台使用内置内容 |
| `DIRECT_URL` | 可选，迁移使用的连接串。应用经事务模式连接池访问数据库时必须设置 |
| `DATABASE_CA_CERT` | 可选，数据库服务端根证书（PEM）。设置后加密连接并校验服务器证书 |
| `AUTH_SECRET` | 会话签名密钥：`openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | 站点地址，用于 canonical、sitemap 和分享卡片 |
| `SITE_NOINDEX` | `true` 时禁止搜索引擎收录（预览 / MVP 环境） |
| `STORAGE_DRIVER` | `local`（默认，写入 `public/uploads`）或 `s3` |
| `S3_ENDPOINT` · `S3_REGION` · `S3_BUCKET` · `S3_FORCE_PATH_STYLE` | S3 兼容存储的地址与存储桶 |
| `S3_ACCESS_KEY_ID` · `S3_SECRET_ACCESS_KEY` | 存储访问密钥，仅服务端使用 |
| `S3_PUBLIC_BASE_URL` | 存储桶的公开访问前缀，`/uploads/*` 代理到这里（构建时读取） |
| `MAX_UPLOAD_MB` | 单文件上限，默认 200 |

## 目录结构

```
prisma/               schema.prisma · migrations/ · seed.ts
prisma.config.ts      Prisma CLI 配置（迁移所用连接串）
public/media/         线稿占位图          public/brands/  品牌 Logo（来源见 docs/BRAND-LOGOS.md）
scripts/              管理员创建 · 占位图生成 · 设计令牌检查 · Vercel 构建前迁移
src/app/(site)/       前台                src/app/(admin)/admin/  后台
src/app/api/          contact · subscribe · views · download · upload（sign / complete）
src/components/       site/ 前台 · admin/ 后台 · ui/ shadcn 组件
src/content/          defaults.ts 默认内容与种子数据 · copy.json 界面文案 · page-sections.ts 页面栏目
src/lib/              data.ts 内容读写 · storage.ts 文件存储 · prisma.ts 数据库连接 · auth.ts / session.ts 登录会话
src/proxy.ts          守卫 /admin 的 Next.js proxy
vercel.json           Vercel 构建命令与函数区域
```

## 常见修改

| 想改什么 | 改哪里 |
| --- | --- |
| 公司信息、联系方式、备案号、SEO 文案 | 后台「站点设置」 |
| 各页面的文字与栏目 | 后台对应菜单（栏目定义在 `src/content/page-sections.ts`） |
| 按钮、表单提示等界面文字 | `src/content/copy.json` |
| 初始内容（业务、案例、新闻……） | `src/content/defaults.ts`，然后 `pnpm db:seed --force` |
| 配色、字号、圆角 | `src/app/globals.css`，见[设计系统](docs/DESIGN-SYSTEM.md) |
| 导航 | `src/components/site/nav-items.ts` |
| 服务流程插图库 | `src/components/site/home/step-art.tsx` 与 `src/content/step-art.ts` |

## 文档

- [部署](docs/DEPLOYMENT.md)：Vercel + Supabase（当前）与阿里云（备案后）
- [后台使用说明](docs/ADMIN-GUIDE.md)
- [设计系统与开发约定](docs/DESIGN-SYSTEM.md)
- [品牌标识来源](docs/BRAND-LOGOS.md)

---

本项目为深圳市星链自动化有限公司定制开发，代码归甲方所有。参考站点的视觉与动效仅作设计参考，源码、文案与图形资源均为独立实现。
