import { saveGalleryItem } from "@/lib/admin-actions";
import { ActionForm } from "@/components/admin/action-form";
import { FormActions, FormField, FormSection, FormSelect, FormTextarea } from "@/components/admin/form-fields";
import { UploadField } from "@/components/admin/upload-field";

type GalleryRecord = {
  id: string;
  title: string;
  caption: string | null;
  url: string;
  thumbUrl: string | null;
  mediaKind: string;
  videoUrl: string | null;
  album: string;
  status: string;
  sortOrder: number;
};

export function GalleryForm({ record }: { record?: GalleryRecord }) {
  return (
    <ActionForm action={saveGalleryItem} className="space-y-6">
      {record ? <input type="hidden" name="id" value={record.id} /> : null}

      <FormSection title="图片信息">
        <FormField label="标题" name="title" required defaultValue={record?.title} placeholder="例如：电芯装配线整线调试" />
        <FormTextarea label="说明" name="caption" rows={2} defaultValue={record?.caption} />
      </FormSection>

      <FormSection title="资源">
        <FormSelect
          label="类型"
          name="mediaKind"
          defaultValue={record?.mediaKind ?? "IMAGE"}
          options={[
            { value: "IMAGE", label: "图片" },
            { value: "VIDEO", label: "视频" },
          ]}
        />
        <UploadField name="url" label="图片 / 视频封面" folder="gallery" defaultValue={record?.url ?? ""} />
        <UploadField name="videoUrl" label="视频文件" folder="gallery" defaultValue={record?.videoUrl ?? ""} accept="video/*" />
      </FormSection>

      <FormSection title="归类与发布">
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="相册" name="album" defaultValue={record?.album ?? "产线现场"} placeholder="产线现场" />
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
          <FormField label="排序" name="sortOrder" type="number" defaultValue={record?.sortOrder ?? 0} />
        </div>
      </FormSection>

      <FormActions cancelHref="/admin/gallery" submitLabel={record ? "保存修改" : "添加到图库"} />
    </ActionForm>
  );
}
