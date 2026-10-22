# 部署

| 环境 | 组成 | 用途 |
| --- | --- | --- |
| 本地 | Docker PostgreSQL 17 · 本地磁盘存储 | 开发，见 [README](../README.md#本地开发) |
| MVP（当前） | Vercel（函数区域 `sin1`）· Supabase（新加坡，PostgreSQL 17 + Storage） | 客户预览 |
| 正式（ICP 备案后） | 阿里云 ECS（Docker）· RDS PostgreSQL 17 · OSS | 面向中国大陆的正式站点 |

三套环境运行同一份代码，差异全部在环境变量。文件地址在所有环境中都是 `/uploads/<key>`，数据库里不出现存储域名，
因此从 Supabase 迁到阿里云时只需复制数据和文件，不用改链接。

---

## 1. Vercel + Supabase（当前）

### 1.1 资源一览

| 项 | 值 |
| --- | --- |
| Vercel 项目 | 团队 Staro AI（`staroai`）· 项目 `starlink-automation`，关联 GitHub `GeorgeLuo404/starlink-automation`，生产分支 `main` |
| 线上地址 | <https://starlinkautomation.space>（公开；`www.` 永久跳转到主域名，原 `starlink-automation.vercel.app` 仍可访问）；预览部署需登录 Vercel 查看（Standard Protection） |
| 域名 | `starlinkautomation.space`，在 Vercel 购买，DNS 由 Vercel 托管（记录与 HTTPS 证书自动维护）；到期前在 Vercel → Domains 续费 |
| 构建 | `vercel.json`：构建命令 `pnpm vercel-build`，函数区域 `sin1`；Node.js 24.x |
| Supabase 项目 | 组织 Staro AI · 项目 `starlink-automation`（ref 见控制台项目设置，下文记作 `<project-ref>`），`ap-southeast-1`，PostgreSQL 17，Free 计划 |
| 数据库用户 | `prisma`（应用与迁移都使用它；所有表归它所有） |
| 连接池 | `aws-0-ap-southeast-1.pooler.supabase.com`：6543 事务模式（应用）、5432 会话模式（迁移） |
| 存储桶 | `uploads`：公开读，单文件 50 MB |
| Data API | 已关闭（本项目只通过 Prisma 访问数据库） |

### 1.2 发布流程

- **推送分支 / 提交 PR**：Vercel 自动构建预览部署。预览与生产**共用同一个数据库和存储桶**，构建时不执行迁移。
- **合并到 `main`**：生产构建。`pnpm vercel-build` 先运行 `scripts/vercel-migrate.mjs`，经 `DIRECT_URL` 执行
  `prisma migrate deploy`；迁移失败则构建失败，线上继续运行上一版本。
- **回滚**：Vercel 控制台 → Deployments → 选择上一个生产部署 → Instant Rollback。数据库迁移不会随之回滚，
  所以迁移必须向后兼容（见第 3 节）。

### 1.3 环境变量

Vercel → 项目 Settings → Environment Variables，Production 与 Preview 两个环境取值相同。
带「敏感」标记的变量以 Sensitive 类型保存，保存后无法在控制台查看。

| 变量 | 取值 | |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://prisma.<project-ref>:<密码>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require` | 敏感 |
| `DIRECT_URL` | 同上，端口改为 `5432` | 敏感 |
| `DATABASE_CA_CERT` | Supabase Root 2021 CA（PEM，有效期至 2031-04-26；控制台 Database Settings → SSL 可下载） | |
| `AUTH_SECRET` | `openssl rand -base64 32` | 敏感 |
| `NEXT_PUBLIC_SITE_URL` | `https://starlinkautomation.space` | |
| `SITE_NOINDEX` | `true` | |
| `STORAGE_DRIVER` | `s3` | |
| `S3_ENDPOINT` | `https://<project-ref>.storage.supabase.co/storage/v1/s3` | |
| `S3_REGION` | `ap-southeast-1` | |
| `S3_BUCKET` | `uploads` | |
| `S3_FORCE_PATH_STYLE` | `true` | |
| `S3_PUBLIC_BASE_URL` | `https://<project-ref>.supabase.co/storage/v1/object/public/uploads` | |
| `S3_ACCESS_KEY_ID` · `S3_SECRET_ACCESS_KEY` | Supabase → Storage → S3 → Access keys | 敏感 |
| `MAX_UPLOAD_MB` | `50`（Supabase Free 计划的单文件上限） | |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1`（让 Vercel 使用 `packageManager` 指定的 pnpm 版本） | |

修改环境变量后需要重新部署才生效（`S3_PUBLIC_BASE_URL`、`STORAGE_DRIVER` 在构建时读取）。

**本机副本**：同样的值保存在项目根目录的 `.env.supabase.local`（被 `.gitignore` 与 `.dockerignore` 排除，切勿提交或外发），
用于在本机对线上库执行命令。更换任何密钥时，Vercel 与这个文件要一起改。

### 1.4 在本机操作线上数据库

在子 shell 里加载 `.env.supabase.local`，命令结束后当前终端不会残留线上连接串：

```bash
# 查看 / 应用迁移（生产部署会自动执行，一般不需要手动）
(set -a && source .env.supabase.local && set +a && pnpm exec prisma migrate status)

# 重置线上管理员密码
(set -a && source .env.supabase.local && set +a && ADMIN_PASSWORD='新的强密码' pnpm admin:create)

# 备份到本地文件（使用 Docker 里的 pg_dump 17）
(set -a && source .env.supabase.local && set +a && docker run --rm postgres:17-alpine pg_dump "$DIRECT_URL" --schema=public --no-owner --no-privileges) > backup-$(date +%F).sql
```

**更换数据库密码**：在 Supabase SQL Editor 执行 `alter user "prisma" with password '<新密码>';`，
然后更新 Vercel 与 `.env.supabase.local` 中的 `DATABASE_URL`、`DIRECT_URL`，再重新部署。

### 1.5 文件上传与访问

- **上传**：后台先请求 `/api/upload/sign`，服务端校验类型与大小后签发预签名 PUT 地址（10 分钟有效，签名锁定文件大小）；
  浏览器把文件直接传到存储桶，再请求 `/api/upload/complete`，服务端确认文件已存在后写入媒体库。
  文件不经过 Vercel 函数（函数请求体上限 4.5 MB）。本地存储时，同一流程改为表单上传到 `/api/upload`。
- **访问**：所有文件都通过本站的 `/uploads/<key>` 访问，`next.config.ts` 的 rewrite 把它代理到存储桶，
  访客只需要能打开网站域名。上传时为文件设置了一年的 immutable 缓存，Vercel CDN 会据此缓存。
- **上限**：Supabase Free 计划单文件 50 MB。升级 Pro 后在 Storage 设置中提高全局上限，
  并同步调大存储桶 `uploads` 的 `file_size_limit` 和 `MAX_UPLOAD_MB`。

### 1.6 数据库连接与权限

- 应用走事务模式连接池（6543），迁移走会话模式（5432）；两者都启用 TLS，并用 `DATABASE_CA_CERT` 校验服务器证书
  （`src/lib/prisma.ts`）。
- 迁移只能用 `prisma` 用户执行。所有表由它创建，Supabase 的 `anon`、`authenticated` 角色对这些表没有任何权限。
  如果用 `postgres` 用户建表，Supabase 的默认授权会把新表开放给 `anon`。
- Supabase 安全顾问会对每张表提示「RLS disabled」。在本项目中这不构成暴露：Data API 已关闭，且 `anon` / `authenticated` 没有表权限。
- `prisma` 用户的授权按 [Supabase 的 Prisma 指南](https://supabase.com/docs/guides/database/prisma)，
  另外加了 `grant create on database postgres to prisma;`，因为初始迁移包含 `CREATE SCHEMA IF NOT EXISTS "public"`。

### 1.7 当前方案的限制

- **中国大陆访问**：`*.vercel.app` 在大陆通常无法直接打开，因此绑定了 `starlinkautomation.space`。自有域名一般可以访问，
  但 Vercel 在大陆没有节点，速度与稳定性不作保证，请在大陆网络下实测。
- **Free 计划**：一周内数据库访问过少的项目会被暂停（Supabase 会提前约一周发邮件提醒）；暂停后 90 天内可在控制台
  点 Resume project 恢复。暂停期间前台显示内置的默认内容，后台不可用。数据库 500 MB、存储 1 GB。
  付费计划的项目不会被暂停。备份请定期按 1.4 节导出。
- **预览部署**与生产共用数据库：带结构变更的 PR，其预览部署在合并前可能因缺少新表或新字段而报错。

---

## 2. 阿里云（ICP 备案后）

### 2.1 ICP 备案

预留 **3–4 周**：阿里云初审 1–2 个工作日 → 短信核验 → 管局审核 5–20 个工作日，期间保持手机畅通。

**前提**

- 域名已实名认证，认证主体与备案主体一致；不在阿里云注册的域名需先转入（顶级域名与注册商都须在工信部批复名单内）
- 阿里云中国大陆地域的服务器（ECS 或轻量应用服务器），**包年包月且剩余时长 ≥ 3 个月**
- 营业执照、法定代表人及网站负责人身份证（非法人负责人需授权书）、阿里云 App 人脸核验、真实性核验单（系统生成，盖章上传）、域名证书

**填写要点**：网站名称 `深圳市星链自动化有限公司`；主办单位性质「企业」；服务内容「企业官网」；网站语言「中文简体」。

**备案期间**主域名不要解析到未备案或境外的服务器。

**沿用 `starlinkautomation.space` 备案时**：先到工信部网站确认 `.space` 仍在批复的顶级域名列表中；域名注册满 60 天后从 Vercel
转入阿里云并完成实名认证；提交备案前把域名从 Vercel 项目移除或改为不解析，MVP 改用 `*.vercel.app` 地址。

**通过后**

1. 后台「站点设置 → ICP 备案号」填入备案号，页脚自动显示并链接到 `beian.miit.gov.cn`
2. 30 日内在 [全国互联网安全管理服务平台](https://beian.mps.gov.cn/) 办理公安联网备案，备案号同样填入站点设置
3. 申请 HTTPS 证书（阿里云免费 DV 证书即可）

### 2.2 准备资源

| 资源 | 配置 |
| --- | --- |
| ECS | 华南 1（深圳），2 核 4 GB 起步，安装 Docker |
| RDS PostgreSQL | **17**，与 ECS 同 VPC、同交换机（走内网）；白名单只填 ECS 内网 IP；创建数据库 `starlink` 与账号 |
| OSS | 与 ECS 同地域；读写权限「公共读」；开启版本控制 |
| RAM 子账号 | 仅编程访问，授权策略见下 |

RAM 最小权限策略：

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["oss:PutObject", "oss:GetObject", "oss:DeleteObject", "oss:ListObjects"],
      "Resource": ["acs:oss:*:*:starlink-automation", "acs:oss:*:*:starlink-automation/*"]
    }
  ]
}
```

**OSS 跨域（CORS）**：后台由浏览器直接上传到存储桶，需在 OSS → 数据安全 → 跨域设置中添加规则：
来源填站点域名，方法 `PUT, GET, HEAD`，允许 Headers 填 `content-type, cache-control`。

### 2.3 部署到 ECS

```bash
git clone https://github.com/GeorgeLuo404/starlink-automation.git /opt/starlink && cd /opt/starlink
cp .env.production.example .env.production   # 填写数据库、AUTH_SECRET、OSS 等
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build   # migrate 服务会先执行迁移
curl -s http://127.0.0.1:3000/api/health
```

**HTTPS**：把证书放到 `deploy/certs/fullchain.pem` 与 `deploy/certs/privkey.pem`（`chmod 600`），
`docker compose -f docker-compose.prod.yml restart nginx`。`deploy/nginx.conf` 已包含 HTTP→HTTPS 跳转、HSTS、安全响应头、gzip 与静态资源长缓存。

**`/uploads` 与 OSS**：`STORAGE_DRIVER=s3` 时，把 `deploy/nginx.conf` 中的 `location /uploads/` 改为代理到存储桶
（文件内有注释示例，同地域用 `-internal` 内网地址），或在 CDN 上为 `/uploads/` 配置回源到 OSS。

### 2.4 从 Supabase 迁移

1. 通知客户暂停在后台编辑内容
2. **数据库**：按 1.4 节导出 `backup.sql`，再在能访问 RDS 的机器上导入：
   `docker run --rm -i postgres:17-alpine psql "<RDS 连接串>" < backup.sql`。
   导入后 `pnpm exec prisma migrate status` 应显示无待执行的迁移
3. **文件**：用 rclone 把存储桶原样复制到 OSS，对象 key 不变，数据库里的 `/uploads/...` 地址无需修改：

   ```ini
   # ~/.config/rclone/rclone.conf
   [supabase]
   type = s3
   provider = Other
   endpoint = https://<project-ref>.storage.supabase.co/storage/v1/s3
   region = ap-southeast-1
   force_path_style = true
   access_key_id = <Supabase S3 Access key>
   secret_access_key = <Supabase S3 Secret>

   [oss]
   type = s3
   provider = Alibaba
   endpoint = oss-cn-shenzhen.aliyuncs.com
   access_key_id = <RAM AccessKey>
   secret_access_key = <RAM Secret>
   ```

   ```bash
   rclone copy supabase:uploads oss:starlink-automation --progress
   ```

4. 正式域名解析到 ECS，后台上传一张图片确认存储正常

### 2.5 安全组

| 端口 | 来源 | 用途 |
| --- | --- | --- |
| 22 | 办公网 IP | SSH |
| 80 / 443 | 0.0.0.0/0 | HTTP 跳转与 HTTPS |
| 3000 | 仅内网 | 应用，不对公网开放 |
| 5432 | 仅 ECS 内网 IP | RDS（在 RDS 白名单控制） |

### 2.6 备份

- **RDS 自动备份**：控制台 → 备份恢复，保留 7–30 天，开启日志备份（支持按时间点恢复）
- **异地备份**：每天 `pg_dump` 一份到另一个 OSS 存储桶：

  ```bash
  # /opt/starlink/scripts/backup.sh，crontab：30 3 * * * /opt/starlink/scripts/backup.sh
  #!/usr/bin/env bash
  set -euo pipefail
  STAMP=$(date +%F-%H%M)
  pg_dump "$DATABASE_URL" | gzip > /tmp/starlink-$STAMP.sql.gz
  ossutil cp /tmp/starlink-$STAMP.sql.gz oss://starlink-backup/db/ --force
  rm -f /tmp/starlink-$STAMP.sql.gz
  ```

---

## 3. 数据库迁移规范

- 结构变更只通过 `prisma/migrations` 中的迁移文件完成：`pnpm db:migrate --name <名称>`，生成的文件提交到 Git。
  不使用 `prisma db push`。
- **迁移只增不改**：已应用到线上库的迁移文件不再修改、合并或删除，变更一律新增迁移。
- **向后兼容**：新版本上线前，旧版本仍在运行（Vercel 回滚也不会回滚数据库），因此先加字段、后删字段，
  删除或重命名分两次发布。
- 自动执行：Vercel 生产构建（`scripts/vercel-migrate.mjs`）；ECS 上由 compose 的 `migrate` 服务执行。

---

## 4. 正式上线检查清单

- [ ] `AUTH_SECRET` 为随机值，管理员密码已修改
- [ ] `NEXT_PUBLIC_SITE_URL` 为正式域名，**未设置** `SITE_NOINDEX`
- [ ] 后台上传一张图片与一个视频，前台能正常显示
- [ ] 页脚 ICP 备案号与公安备案号已填写，链接正确
- [ ] 「站点设置」中的电话、邮箱、地址已换成真实信息（默认内容里的电话是占位号码）
- [ ] HTTPS 证书有效，HTTP 自动跳转
- [ ] `/robots.txt`、`/sitemap.xml` 正常，sitemap 已提交百度与必应站长平台
- [ ] 数据库自动备份与异地备份已配置，并**实际演练过一次恢复**
- [ ] 安全组 3000 端口未对公网开放
- [ ] 手机浏览器与微信内置浏览器各访问一遍

---

## 5. 常见问题

**构建或运行时报 `self-signed certificate in certificate chain`**
`DATABASE_CA_CERT` 未设置或内容不完整（需包含 `-----BEGIN CERTIFICATE-----` 到 `-----END CERTIFICATE-----`）。

**迁移报 `permission denied for database postgres`**
`prisma` 用户缺少建 schema 权限，在 Supabase SQL Editor 执行 `grant create on database postgres to prisma;`。

**后台上传失败**
看提示：「文件超过 N MB 上限」→ 调整 `MAX_UPLOAD_MB` 与存储桶上限；「上传到存储失败（HTTP 403）」→
检查 `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_BUCKET`；浏览器控制台出现 CORS 错误 → 检查存储桶跨域规则（OSS 见 2.2）。

**图片 404**
`/uploads/*` 的代理在构建时生成：确认 `STORAGE_DRIVER=s3` 与 `S3_PUBLIC_BASE_URL` 在构建时已设置，修改后需重新部署。

**后台提示「数据库未配置」**
当前环境没有读到 `DATABASE_URL`。Vercel 检查对应环境（Production / Preview）的变量；ECS 用 `docker compose config` 查看最终配置。

**中文 SEO**
sitemap 提交百度搜索资源平台；页面已有 canonical 与关键词；在「站点设置 → 统计代码 ID」填入百度统计 ID。
