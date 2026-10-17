# 部署与备案指南

面向 **深圳市星链自动化有限公司官网** 从开发到上线的完整流程。
按时间顺序执行，可以避免最常见的返工。

---

## 0. 先读这一页（决策要点）

| 问题 | 结论 |
| --- | --- |
| Vercel 能作为正式环境吗？ | **不能。** 面向中国大陆的站点必须用大陆服务器 + 已备案域名。Vercel 仅用于开发预览与 PR 预览。 |
| 备案要多久？ | 阿里云初审 1–2 个工作日 → 工信部审核 5–20 个工作日。**预留 3–4 周**，建议与开发并行启动。 |
| 备案需要什么前提？ | ① 已实名认证的域名（且未过期）② 阿里云大陆节点服务器（ECS/轻量，**包月 3 个月以上**）③ 主体资料。 |
| 数据库放哪？ | 阿里云 **RDS PostgreSQL**，不要用 ECS 上的自建库（备份、监控、故障恢复都更麻烦）。 |
| 文件放哪？ | 阿里云 **OSS**（`STORAGE_DRIVER=s3`）。**不要放 ECS 本地磁盘**，扩容/换机器会丢文件。 |
| 视频放哪？ | 建议 **VOD + CDN**；起步阶段放 OSS + CDN 也能用。 |
| 服务器配置？ | 2 核 4G 起步（Next.js 生产运行约 300–500MB）。 |

**推荐节奏**

```
第 1 周  购买域名 + 购买 ECS（包月 3 个月以上）→ 立即提交备案
第 1 周  Vercel 上跑预览，边开发边给客户看
第 2 周  备案审核中：配置 RDS / OSS，本地跑通 Docker 生产构建
第 3 周  备案通过 → 解析域名 → 上线 HTTPS → 提交公安备案
```

---

## 1. 阶段一：Vercel 开发预览

用于内部验收和给客户看效果，**不要绑定正式域名**。

```bash
npm i -g vercel
vercel link
```

在 Vercel 项目 **Settings → Environment Variables** 中配置：

| 变量 | 值 |
| --- | --- |
| `DATABASE_URL` | 云数据库连接串（Neon / Supabase / 阿里云 RDS 公网地址均可） |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://<project>.vercel.app` |
| `STORAGE_DRIVER` | **必须为 `s3`**（Vercel 文件系统只读且不持久） |

首次部署后执行建表与初始化（本地连同一个库）：

```bash
DATABASE_URL="<云端连接串>" pnpm db:deploy
DATABASE_URL="<云端连接串>" pnpm db:seed
```

> ⚠️ Vercel 上 `pnpm build` 会执行 `prisma generate`。本项目的 `build` 脚本已经包含这一步。

---

## 2. 阶段二：域名与 ICP 备案

### 2.1 购买域名

- 在阿里云（万网）购买，`.com` / `.cn` 均可。
- **必须完成域名实名认证**，且认证主体与备案主体一致。
- 域名注册商如果不是阿里云，需要先把域名转入或做「域名转移」到阿里云，否则无法在阿里云备案。

### 2.2 购买大陆节点服务器

- 阿里云 **ECS**（推荐）或 **轻量应用服务器**。
- **必须是包年包月且剩余时长 ≥ 3 个月**，按量付费的实例无法备案。
- 地域选择离客户近的（如 `华南1（深圳）`）。
- 备案期间服务器需要放一个能访问的页面，且**备案通过前不能开放 80/443 给未备案域名**。

### 2.3 提交备案

入口：阿里云控制台 → 备案 → 开始备案。

需要准备：

| 材料 | 说明 |
| --- | --- |
| 营业执照 | 彩色扫描件，加盖公章 |
| 法定代表人身份证 | 正反面 |
| 网站负责人身份证 | 非法人时需提供，并附授权书 |
| 网站负责人核验 | 阿里云 App 人脸核验（部分地区需幕布拍照） |
| 网站备案信息真实性核验单 | 系统生成，打印盖章后上传 |
| 域名证书 | 在域名控制台下载 |

填写要点：

- **网站名称**：`深圳市星链自动化有限公司`（企业备案不能用「XX的博客」这类名称）
- **主办单位性质**：企业
- **网站服务内容**：企业官网 / 单位门户网站
- **服务项目**：仅选「网站应用」即可
- **网站语言**：中文简体

审核时间：阿里云初审 1–2 个工作日 → 短信核验 → 管局审核 5–20 个工作日。
期间保持手机畅通，管局可能电话核实。

### 2.4 备案通过后

1. 在阿里云备案控制台下载**备案号**（形如 `粤ICP备2026000000号-1`）。
2. **把备案号填到网站页脚** —— 这是法定义务。本项目在
   后台「站点设置 → ICP 备案号」中填写即可，前台页脚会自动显示并链接到 `beian.miit.gov.cn`。
3. 解析域名：`A` 记录指向 ECS 公网 IP，`www` 与裸域都要解析。
4. **公安备案**：备案通过后 30 日内在
   [全国互联网安全管理服务平台](https://beian.mps.gov.cn/) 提交公安联网备案，
   拿到公安备案号后同样填到页脚（本项目模板中已预留位置）。
5. 申请 HTTPS 证书（阿里云免费 DV 证书即可），配置到 Nginx。

---

## 3. 阶段三：阿里云生产部署

### 3.1 创建 RDS PostgreSQL

1. 控制台 → 云数据库 RDS → 创建实例 → **PostgreSQL 16**。
2. 规格：`pg.n2.medium.1c`（2 核 4G）起步，存储 50GB。
3. **网络类型选 VPC**，与 ECS 同一个 VPC、同一个交换机 → 走内网，不计流量费且更快。
4. 创建数据库 `starlink`，创建高权限账号。
5. **白名单**：填入 ECS 的内网 IP（不是 0.0.0.0/0）。
6. 连接串：

```
postgresql://starlink:密码@rm-xxxxxx.pg.rds.aliyuncs.com:5432/starlink?schema=public&sslmode=require&connection_limit=10
```

> 小规模（日访问 < 5000）也可以用单机 compose 里的 `db` 服务起步，但务必配置定时
> `pg_dump` 并同步到 OSS。**没有备份的数据库等于没有数据库。**

### 3.2 创建 OSS Bucket 与 RAM 子账号

1. OSS 控制台 → 创建 Bucket：
   - 名称：`starlink-automation`
   - 地域：与 ECS 同地域（如 `oss-cn-shenzhen`）
   - 读写权限：**公共读**（或私有读 + CDN 回源鉴权）
   - 开启 **版本控制**（误删可恢复）
2. RAM 控制台 → 创建用户（**仅编程访问**）→ 授予最小权限策略：

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

3. 记录 AccessKeyId / AccessKeySecret，填入 `.env.production`。
4. **CORS 设置**（后台需要直传时）：来源填你的域名，方法 `GET, POST, PUT, HEAD`。
5. （可选但推荐）绑定自定义域名 `cdn.starlink-auto.com` 并开启 CDN 加速，
   填入 `S3_PUBLIC_BASE_URL`。

### 3.3 部署到 ECS

```bash
# --- ECS 上准备环境 ---
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER && newgrp docker

# --- 拉取代码 ---
git clone <你的仓库地址> /opt/starlink && cd /opt/starlink

# --- 配置生产环境变量 ---
cp .env.production.example .env.production
vim .env.production        # 填 DATABASE_URL / AUTH_SECRET / OSS 密钥
openssl rand -base64 32    # 生成 AUTH_SECRET

# --- 启动（会自动先跑数据库迁移） ---
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# --- 导入初始内容（仅首次） ---
docker compose -f docker-compose.prod.yml run --rm \
  -e ADMIN_EMAIL=admin@starlink-auto.com \
  -e ADMIN_PASSWORD='一个强密码' \
  web node -e "console.log('use: pnpm db:seed locally against RDS')"

# --- 查看状态 ---
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f web
curl -s http://127.0.0.1:3000/api/health
```

> **初始数据**：`db:seed` 需要 prisma CLI，镜像里没有。请在本地（能连 RDS 公网地址的环境）
> 执行 `DATABASE_URL="..." pnpm db:seed`，或者使用 `migrator` 镜像临时安装。
> 更简单的做法：先在本地库 seed 好，再用 `pg_dump` / `pg_restore` 迁移到 RDS。

### 3.4 配置 Nginx 与 HTTPS

```bash
mkdir -p deploy/certs
# 把阿里云下载的证书改名为 fullchain.pem / privkey.pem 放进去
cp /path/to/域名.pem  deploy/certs/fullchain.pem
cp /path/to/域名.key  deploy/certs/privkey.pem
chmod 600 deploy/certs/privkey.pem

docker compose -f docker-compose.prod.yml restart nginx
```

`deploy/nginx.conf` 已经包含：HTTP→HTTPS 跳转、HSTS、安全响应头、
gzip、`/_next/static` 长缓存、`/uploads` 静态托管、`client_max_body_size 210m`。

**免费证书自动续期**（可选）：

```bash
sudo apt install -y certbot
sudo certbot certonly --webroot -w /var/www/certbot -d www.starlink-auto.com -d starlink-auto.com
# 续期后重载容器
echo "0 3 * * 1 docker compose -f /opt/starlink/docker-compose.prod.yml exec nginx nginx -s reload" | crontab -
```

### 3.5 安全组

| 端口 | 来源 | 用途 |
| --- | --- | --- |
| 22 | 你的办公 IP | SSH |
| 80 | 0.0.0.0/0 | HTTP（跳转 + 证书校验） |
| 443 | 0.0.0.0/0 | HTTPS |
| 3000 | **仅内网** | 应用（不要对公网开放） |
| 5432 | 仅 ECS 内网 IP | RDS（在 RDS 白名单里控制） |

---

## 4. 数据库迁移与备份

所有结构变更都通过 `prisma/migrations` 中的迁移文件完成，不要使用 `prisma db push`
（它不记录迁移历史，会导致本地与生产库结构漂移）。

```bash
# 修改 prisma/schema.prisma 后，在本地生成并应用迁移文件，然后提交到 Git
pnpm db:migrate --name add_something

# 服务器上应用迁移（compose 的 migrate 服务会自动执行）
docker compose -f docker-compose.prod.yml run --rm migrate
```

### 备份

**RDS 自动备份**：控制台 → 备份恢复 → 设置备份策略，保留 7–30 天，开启日志备份（可做时间点恢复）。

**异地备份到 OSS**（强烈建议，防止误删）：

```bash
# /opt/starlink/scripts/backup.sh
#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%F-%H%M)
pg_dump "$DATABASE_URL" | gzip > /tmp/starlink-$STAMP.sql.gz
ossutil cp /tmp/starlink-$STAMP.sql.gz oss://starlink-backup/db/ --force
rm -f /tmp/starlink-$STAMP.sql.gz
find /tmp -name 'starlink-*.sql.gz' -mtime +2 -delete
```

```bash
chmod +x /opt/starlink/scripts/backup.sh
# 每天 3:30 备份
echo "30 3 * * * /opt/starlink/scripts/backup.sh" | crontab -
```

---

## 5. 上线检查清单

- [ ] `AUTH_SECRET` 已改为随机值（**不要用默认值**）
- [ ] 管理员密码已修改（`pnpm admin:create`）
- [ ] `NEXT_PUBLIC_SITE_URL` 是正式域名（影响 canonical / sitemap / OG）
- [ ] `STORAGE_DRIVER=s3` 且 OSS 读写验证通过（后台上传一张图试试）
- [ ] 页脚 ICP 备案号已填写且链接正确
- [ ] 公安备案号已填写
- [ ] HTTPS 证书有效，HTTP 自动跳转
- [ ] `/robots.txt` 正常，`/sitemap.xml` 可访问并已提交到百度搜索资源平台
- [ ] RDS 自动备份 + 异地备份任务已配置并**验证过恢复流程**
- [ ] 安全组 3000 端口未对公网开放
- [ ] 手机端、微信内置浏览器各访问一遍
- [ ] 提交百度站长平台 + 必应站长平台，提交 sitemap

---

## 6. 常见问题

**Q：Vercel 部署后刷新页面 404？**
本项目使用多根布局 + `proxy.ts` 处理语言路由，Vercel 上无需额外配置。
如果出现 404，检查 `NEXT_PUBLIC_SITE_URL` 是否包含多余路径。

**Q：上传大视频失败？**
三个地方都要放开：`MAX_UPLOAD_MB`、Nginx 的 `client_max_body_size`、OSS 单次 PutObject 上限（5GB）。
另外 Next.js 的 `serverActions.bodySizeLimit` 与 Route Handler 无关，本项目上传走
`/api/upload` Route Handler，不受该限制影响。

**Q：后台登录提示「数据库未配置」？**
`DATABASE_URL` 没读到。检查 `.env.production` 是否被 compose 正确传入
（`docker compose config` 可以打印最终解析结果）。

**Q：中文 SEO 要做什么？**
① `sitemap.xml` 提交百度；② 页面已有 `canonical`；
③ 首页 `<title>` 与 `description` 已包含「PLC 程序调试 / 机器人调试 / 锂电池检测 / 热压机」等关键词；
④ 建议再做一个「百度统计」ID 填入后台站点设置。

**Q：备案期间网站能访问吗？**
可以用 **IP 直接访问** 或临时用境外服务器，但**域名不能解析到未备案的服务器**，
否则会被拦截。建议备案期间只在本地与 Vercel 预览。
