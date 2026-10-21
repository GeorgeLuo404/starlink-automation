import { getPrisma } from "@/lib/prisma";
import { AdminPageHeader, SetupNotice } from "@/components/admin/ui";
import { PartnersManager, type PartnerRow } from "@/components/admin/partners-manager";

export const dynamic = "force-dynamic";

/** 品牌平台 — the brands shown in the homepage's 支持的品牌与平台 row (Partner table). */
export default async function AdminPartnersPage() {
  const db = getPrisma();
  if (!db) {
    return (
      <>
        <AdminPageHeader title="品牌平台" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理品牌。</p>
        </SetupNotice>
      </>
    );
  }

  let rows: PartnerRow[] = [];
  try {
    rows = await db.partner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, nameZh: true, logoUrl: true, active: true },
    });
  } catch {
    rows = [];
  }

  return <PartnersManager rows={rows} />;
}
