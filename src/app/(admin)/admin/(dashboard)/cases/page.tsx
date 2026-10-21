import Link from "next/link";
import { Plus } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { COVER_MEDIA, coverOf } from "@/lib/data";
import { AdminPageHeader, EmptyState, SetupNotice } from "@/components/admin/ui";
import { CasesTable, type CaseRow } from "@/components/admin/tables/cases-table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminCasesPage() {
  const db = getPrisma();
  if (!db) {
    return (
      <>
        <AdminPageHeader title="项目案例" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理案例。</p>
        </SetupNotice>
      </>
    );
  }

  let rows: CaseRow[] = [];
  try {
    const records = await db.project.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { media: COVER_MEDIA, _count: { select: { media: true } } },
    });
    rows = records.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      industry: row.industry ?? "",
      year: row.year ?? 0,
      status: row.status,
      featured: row.featured,
      sortOrder: row.sortOrder,
      cover: coverOf(row),
      mediaCount: row._count.media,
    }));
  } catch {
    rows = [];
  }

  return (
    <>
      <AdminPageHeader
        title="项目案例"
        description="展示交付过的真实项目，含行业、成果指标与现场影像。"
        action={
          <Button asChild className="px-4">
            <Link href="/admin/cases/new">
              <Plus className="size-4" />
              新建案例
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="还没有案例" description="创建第一个项目案例，或运行 pnpm db:seed 导入内置示例。" />
      ) : (
        <CasesTable rows={rows} />
      )}
    </>
  );
}
