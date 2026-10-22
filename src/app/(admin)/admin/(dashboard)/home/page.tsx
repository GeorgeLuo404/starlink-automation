import { getPrisma } from "@/lib/prisma";
import { PAGES } from "@/content/page-sections";
import { PageContentScreen } from "@/components/admin/page-content/page-screen";
import { PartnersManager, type PartnerRow } from "@/components/admin/partners-manager";

export const dynamic = "force-dynamic";

/** 首页 — every homepage section in page order; the brands tab holds the 品牌平台 list (Partner table). */
export default async function AdminHomePage() {
  let rows: PartnerRow[] = [];
  try {
    rows =
      (await getPrisma()?.partner.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true, nameZh: true, logoUrl: true, active: true },
      })) ?? [];
  } catch {
    rows = [];
  }

  return <PageContentScreen page={PAGES.home} brands={<PartnersManager key="brands" rows={rows} />} />;
}
