import { ExternalLink } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { getSectionStates } from "@/lib/page-content";
import { brandsSection, type PageDef, type SectionKey } from "@/content/page-sections";
import { AdminPageHeader, SetupNotice } from "@/components/admin/ui";
import { PageEditor } from "@/components/admin/page-content/page-editor";
import { buttonVariants } from "@/components/ui/button";

/** Admin screen for one page's editable copy (首页、关于我们、联系我们). */
export async function PageContentScreen({ page, brands }: { page: PageDef; brands?: React.ReactNode }) {
  if (!getPrisma()) {
    return (
      <>
        <AdminPageHeader title={page.title} />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可编辑页面内容。</p>
        </SetupNotice>
      </>
    );
  }

  const keys = page.sections.flatMap((s): SectionKey[] => (s.key === "brands" ? [brandsSection.key] : [s.key]));
  const states = await getSectionStates(keys);

  return (
    <>
      <AdminPageHeader
        title={page.title}
        description={page.description}
        action={
          <a href={page.path} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", className: "px-4" })}>
            <ExternalLink className="size-4" />
            在前台查看
          </a>
        }
      />
      <PageEditor page={page} states={states} brands={brands} />
    </>
  );
}
