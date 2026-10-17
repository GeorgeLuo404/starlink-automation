import { getPrisma } from "@/lib/prisma";
import { saveSettings } from "@/lib/admin-actions";
import { ActionForm } from "@/components/admin/action-form";
import { AdminPageHeader, SetupNotice } from "@/components/admin/ui";
import { FormActions, FormField, FormSection } from "@/components/admin/form-fields";
import { UploadField } from "@/components/admin/upload-field";

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

  const rows = await db.siteSetting.findMany().catch(() => []);
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const read = (key: string, fallback = "") => {
    const value = map.get(key);
    return typeof value === "string" ? value : fallback;
  };

  return (
    <>
      <AdminPageHeader title="站点设置" description="首页视频、联系方式与备案信息。保存后前台会自动刷新。" />

      {saved ? (
        <div className="mb-6 rounded-(--radius) border border-success/30 bg-success/8 px-4 py-3 text-sm text-success">
          设置已保存。
        </div>
      ) : null}

      <ActionForm action={saveSettings} className="space-y-6">
        <FormSection title="首页 Hero" description="留空时使用内置的工业风占位图。">
          <UploadField
            name="heroVideoUrl"
            label="首页背景视频"
            folder="hero"
            defaultValue={read("heroVideoUrl")}
            accept="video/*"
            description="建议 1920×1080、H.264 编码的 MP4，时长 10–20 秒并静音播放。"
          />
          <UploadField
            name="heroPosterUrl"
            label="视频封面图"
            folder="hero"
            defaultValue={read("heroPosterUrl")}
            accept="image/*"
          />
        </FormSection>

        <FormSection title="联系方式">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="业务电话" name="contactPhone" defaultValue={read("contactPhone", "138-0000-0000")} />
            <FormField label="业务邮箱" name="contactEmail" defaultValue={read("contactEmail", "info@starlink-auto.com")} />
          </div>
          <FormField
            label="公司地址"
            name="contactAddress"
            defaultValue={read("contactAddress", "深圳市光明区凤凰街道甲子塘社区力缆科技大楼九层E区")}
          />
        </FormSection>

        <FormSection title="合规与统计" description="域名备案通过后，把备案号填在这里，会显示在网站页脚。">
          <FormField label="ICP 备案号" name="icp" defaultValue={read("icp", "粤ICP备00000000号")} />
          <FormField
            label="统计代码 ID"
            name="analyticsId"
            defaultValue={read("analyticsId")}
            placeholder="例如百度统计 / Google Analytics 的站点 ID"
            description="留空则不加载任何统计脚本。"
          />
        </FormSection>

        <FormActions cancelHref="/admin" submitLabel="保存设置" />
      </ActionForm>
    </>
  );
}
