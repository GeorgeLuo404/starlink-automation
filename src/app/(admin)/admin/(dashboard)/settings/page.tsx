import { getPrisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/data";
import { saveSettings } from "@/lib/admin-actions";
import { ActionForm } from "@/components/admin/action-form";
import { AdminPageHeader, SetupNotice } from "@/components/admin/ui";
import { FormActions, FormField, FormSection, FormTextarea } from "@/components/admin/form-fields";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const db = getPrisma();

  if (!db) {
    return (
      <>
        <AdminPageHeader title="站点设置" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可保存站点设置。</p>
        </SetupNotice>
      </>
    );
  }

  // What the site shows now: saved values, else the defaults. Filing numbers stay empty until filed.
  const settings = await getSiteSettings();

  return (
    <>
      <AdminPageHeader title="站点设置" description="全站共用的公司信息、联系方式、备案与搜索引擎设置。保存后前台会自动刷新。" />

      {saved ? (
        <div className="mb-6 rounded-(--radius) border border-success/30 bg-success/8 px-4 py-3 text-sm text-success">
          设置已保存。
        </div>
      ) : null}

      <ActionForm action={saveSettings} className="space-y-6">
        <FormSection title="公司信息" description="显示在页脚版权、「关于我们」和浏览器标题中。">
          <div className="grid gap-5 sm:grid-cols-[2fr_1fr_1fr]">
            <FormField label="公司全称" name="companyName" defaultValue={settings.companyName} />
            <FormField label="公司简称" name="companyShort" defaultValue={settings.companyShort} description="用在浏览器标签页标题末尾。" />
            <FormField label="成立年份" name="founded" defaultValue={settings.founded} placeholder="2024" />
          </div>
          <FormTextarea label="页脚简介" name="footerDesc" defaultValue={settings.footerDesc} rows={3} />
        </FormSection>

        <FormSection title="联系方式" description="页脚、「联系我们」和「关于我们」共用。">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="业务电话" name="contactPhone" defaultValue={settings.phone} />
            <FormField label="业务邮箱" name="contactEmail" defaultValue={settings.email} />
          </div>
          <FormField label="公司地址" name="contactAddress" defaultValue={settings.address} />
        </FormSection>

        <FormSection title="备案信息" description="备案通过后填写，会显示在网站页脚；留空则页脚不显示。">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="ICP 备案号" name="icp" defaultValue={settings.icp} placeholder="例如 粤ICP备2024000000号-1" />
            <FormField
              label="公安备案号"
              name="policeRecord"
              defaultValue={settings.policeRecord}
              placeholder="例如 粤公网安备44030000000000号"
              description="页脚会链接到全国互联网安全管理平台的查询页。"
            />
          </div>
        </FormSection>

        <FormSection title="搜索引擎" description="网站在百度等搜索结果和分享卡片中的显示。">
          <FormField label="首页标语" name="seoTagline" defaultValue={settings.seo.tagline} description="首页标题为「公司全称 | 标语」。" />
          <FormTextarea label="网站描述" name="seoDescription" defaultValue={settings.seo.description} rows={3} />
          <FormField label="关键词" name="seoKeywords" defaultValue={settings.seo.keywords} description="用英文逗号分隔。" />
        </FormSection>

        <FormSection title="统计">
          <FormField
            label="统计代码 ID"
            name="analyticsId"
            defaultValue={settings.analyticsId}
            placeholder="例如百度统计 / Google Analytics 的站点 ID"
            description="留空则不加载任何统计脚本。"
          />
        </FormSection>

        <FormActions cancelHref="/admin" submitLabel="保存设置" />
      </ActionForm>
    </>
  );
}
