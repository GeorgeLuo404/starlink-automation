import Link from "next/link";
import { Plus } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { COVER_MEDIA, coverOf } from "@/lib/data";
import { AdminPageHeader, EmptyState, SetupNotice } from "@/components/admin/ui";
import { ServicesTable, type ServiceRow } from "@/components/admin/tables/services-table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const db = getPrisma();
  if (!db) {
    return (
      <>
        <AdminPageHeader title="业务能力" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理业务能力。</p>
        </SetupNotice>
      </>
    );
  }

  let rows: ServiceRow[] = [];
  try {
    const records = await db.service.findMany({
      orderBy: { sortOrder: "asc" },
      include: { media: COVER_MEDIA, _count: { select: { media: true } } },
    });
    rows = records.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      icon: row.icon ?? "",
      sortOrder: row.sortOrder,
      status: row.published ? "PUBLISHED" : "DRAFT",
      cover: coverOf(row),
      mediaCount: row._count.media,
    }));
  } catch {
    rows = [];
  }

  return (
    <>
      <AdminPageHeader
        title="业务能力"
        description="首页与业务页展示的核心能力。"
        action={
          <Button asChild className="px-4">
            <Link href="/admin/services/new">
              <Plus className="size-4" />
              新建业务
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="还没有业务项" description="创建第一项业务能力，或运行 pnpm db:seed 导入内置示例。" />
      ) : (
        <ServicesTable rows={rows} />
      )}
    </>
  );
}
