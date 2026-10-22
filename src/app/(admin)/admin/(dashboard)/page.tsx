import Link from "next/link";
import { ArrowUpRight, Briefcase, Download, FileText, Image as ImageIcon, Inbox, Plus } from "lucide-react";
import { getPrisma, isDatabaseReady } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader, EmptyState, SetupNotice, StatusPill } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const ready = await isDatabaseReady();
  const db = getPrisma();

  if (!ready || !db) {
    return (
      <>
        <AdminPageHeader title="仪表盘" description="欢迎使用星链自动化内容管理后台。" />
        <SetupNotice title="数据库尚未连接">
          <p>
            当前没有可用的 PostgreSQL 连接，后台的增删改查功能需要数据库。请按以下步骤初始化：
          </p>
          <ol className="list-decimal space-y-1.5 pl-5 font-mono text-xs">
            <li>复制 .env.example 为 .env，并填写 DATABASE_URL</li>
            <li>docker compose up -d db （或使用本机 / 阿里云 RDS 的 PostgreSQL）</li>
            <li>pnpm db:deploy</li>
            <li>pnpm db:seed</li>
            <li>pnpm admin:create</li>
          </ol>
          <p className="text-muted-foreground">
            前台网站不依赖数据库，未配置时会自动使用内置的默认内容，因此站点始终可以正常访问。
          </p>
        </SetupNotice>
      </>
    );
  }

  const [articles, publishedArticles, cases, downloads, media, inquiries, newInquiries, recent] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.project.count(),
    db.downloadFile.count(),
    db.mediaAsset.count(),
    db.inquiry.count(),
    db.inquiry.count({ where: { status: "NEW" } }),
    db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const stats = [
    { label: "新闻动态", value: articles, sub: `${publishedArticles} 篇已发布`, href: "/admin/articles", icon: FileText },
    { label: "项目案例", value: cases, sub: "案例库总数", href: "/admin/cases", icon: Briefcase },
    { label: "资料下载", value: downloads, sub: "可下载文件", href: "/admin/downloads", icon: Download },
    { label: "媒体资源", value: media, sub: "图片与视频", href: "/admin/media", icon: ImageIcon },
    { label: "客户询盘", value: inquiries, sub: `${newInquiries} 条待处理`, href: "/admin/inquiries", icon: Inbox },
  ];

  return (
    <>
      <AdminPageHeader
        title="仪表盘"
        description="内容概览与最新的客户询盘。"
        action={
          <Button asChild className="px-4">
            <Link href="/admin/articles/new">
              <Plus className="size-4" />
              新建文章
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <Card className="h-full p-5 transition-colors group-hover:border-primary/40">
                <div className="flex items-start justify-between">
                  <span className="inline-flex size-9 items-center justify-center rounded-(--radius) border border-border bg-surface text-primary">
                    <Icon className="size-4" strokeWidth={1.6} />
                  </span>
                  <ArrowUpRight className="size-4 text-ghost transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-5 text-2xl font-semibold text-white tabular-nums">{stat.value}</p>
                <p className="mt-1 text-sm text-body">{stat.label}</p>
                <p className="mt-0.5 font-mono text-[0.625rem] text-faint">{stat.sub}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">最新询盘</h2>
          <Link href="/admin/inquiries" className="text-sm text-primary hover:underline">
            查看全部
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState title="暂无询盘" description="当访客通过网站表单提交需求后，会显示在这里。" />
        ) : (
          <Card className="divide-y divide-border">
            {recent.map((inquiry) => (
              <div key={inquiry.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-white">{inquiry.name}</span>
                    {inquiry.company ? (
                      <span className="text-xs text-muted-foreground">· {inquiry.company}</span>
                    ) : null}
                    <StatusPill status={inquiry.status} />
                  </div>
                  <p className="mt-1.5 line-clamp-1 text-sm text-muted-foreground">{inquiry.message}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4 font-mono text-[0.625rem] text-faint">
                  <span>{inquiry.phone ?? inquiry.email ?? ""}</span>
                  <span>{formatDate(inquiry.createdAt)}</span>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </>
  );
}
