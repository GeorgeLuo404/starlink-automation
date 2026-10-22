import { saveDownload } from "@/lib/admin-actions";
import { ActionForm } from "@/components/admin/action-form";
import { FormActions, FormCheckbox, FormField, FormSection, FormSelect, FormTextarea } from "@/components/admin/form-fields";
import { UploadField } from "@/components/admin/upload-field";

type DownloadRecord = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  fileUrl: string;
  storageKey: string | null;
  fileType: string;
  fileSize: number;
  version: string | null;
  requiresForm: boolean;
  status: string;
};

export function DownloadForm({ record }: { record?: DownloadRecord }) {
  return (
    <ActionForm action={saveDownload} className="space-y-6">
      {record ? <input type="hidden" name="id" value={record.id} /> : null}

      <FormSection title="资料信息">
        <FormField label="标题" name="title" required defaultValue={record?.title} placeholder="例如：星链自动化公司宣传册 2026" />
        <FormField label="URL 别名 / Slug" name="slug" defaultValue={record?.slug} placeholder="留空自动生成，用于下载地址 /api/download/slug" />
        <FormTextarea label="简介" name="description" rows={3} defaultValue={record?.description} />
      </FormSection>

      <FormSection title="文件" description="上传后会自动填入地址；若未上传文件，前台下载会生成一份占位 PDF。">
        <UploadField name="fileUrl" label="文件地址" folder="downloads" defaultValue={record?.fileUrl === "#" ? "" : record?.fileUrl ?? ""} accept=".pdf,.zip,.docx,.xlsx,.pptx,.csv,.txt" showPreview={false} />
        <div className="grid gap-5 sm:grid-cols-3">
          <FormSelect
            label="文件类型"
            name="fileType"
            defaultValue={record?.fileType ?? "PDF"}
            options={["PDF", "ZIP", "DOCX", "XLSX", "PPTX", "CSV", "TXT"].map((v) => ({ value: v, label: v }))}
          />
          <FormField label="文件大小（字节）" name="fileSize" type="number" defaultValue={record?.fileSize ?? 0} description="上传后可手动填写，用于前台显示" />
          <FormField label="版本" name="version" defaultValue={record?.version} placeholder="v1.0" />
        </div>
      </FormSection>

      <FormSection title="发布设置">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormSelect
            label="状态"
            name="status"
            defaultValue={record?.status ?? "PUBLISHED"}
            options={[
              { value: "PUBLISHED", label: "已发布" },
              { value: "DRAFT", label: "草稿" },
              { value: "ARCHIVED", label: "已归档" },
            ]}
          />
        </div>
        <FormCheckbox
          label="下载前需要填写联系方式"
          name="requiresForm"
          defaultChecked={record?.requiresForm}
          description="开启后访客需提交姓名与联系方式才能下载。"
        />
      </FormSection>

      <FormActions cancelHref="/admin/downloads" submitLabel={record ? "保存修改" : "创建资料"} />
    </ActionForm>
  );
}
