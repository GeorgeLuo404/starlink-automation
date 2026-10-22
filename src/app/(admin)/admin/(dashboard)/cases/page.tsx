import Link from "next/link";
import { Plus } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { COVER_MEDIA, coverOf, HOME_CASES, pickHomeCases } from "@/lib/data";
import { AdminPageHeader, EmptyState, SetupNotice } from "@/components/admin/ui";
import { CasesTable, type CaseRow } from "@/components/admin/tables/cases-table";
import { ListHeaderButton } from "@/components/admin/page-content/list-header-button";
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
    // Same rule as the homepage, so the 首页 badge marks exactly what it shows.
    const onHome = new Set(pickHomeCases(records.filter((row) => row.status === "PUBLISHED")).map((row) => row.id));
    rows = records.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      industry: row.industry ?? "",
      year: row.year ?? 0,
      status: row.status,
      onHome: onHome.has(row.id),
      // Ticked but not on the homepage: say why.
      homeNote:
        row.featured && !onHome.has(row.id)
          ? row.status === "PUBLISHED"
            ? `首页最多显示 ${HOME_CASES} 个推荐案例，这个排在后面`
            : "已勾选推荐到首页，发布后才会显示"
          : null,
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
          <div className="flex flex-wrap gap-2">
            <ListHeaderButton page="cases" />
            <Button asChild className="px-4">
              <Link href="/admin/cases/new">
                <Plus className="size-4" />
                新建案例
              </Link>
            </Button>
          </div>
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
