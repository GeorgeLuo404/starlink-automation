import { saveCase } from "@/lib/admin-actions";
import { ActionForm } from "@/components/admin/action-form";
import { FormActions, FormCheckbox, FormField, FormSection, FormSelect, FormTextarea } from "@/components/admin/form-fields";
import { UploadField } from "@/components/admin/upload-field";

type CaseRecord = {
  id: string;
  slug: string;
  titleZh: string;
  titleEn: string | null;
  clientZh: string | null;
  clientEn: string | null;
  industryZh: string | null;
  industryEn: string | null;
  summaryZh: string | null;
  summaryEn: string | null;
  contentZh: string | null;
  contentEn: string | null;
  coverUrl: string | null;
  videoUrl: string | null;
  tags: string[];
  metrics: unknown;
  year: number | null;
  location: string | null;
  gallery: string[];
  scope: string[];
  status: string;
  featured: boolean;
  sortOrder: number;
};

function metricsToText(metrics: unknown) {
  if (!Array.isArray(metrics)) return "";
  return metrics
    .map((entry) => {
      const item = entry as { value?: string; label?: { zh?: string; en?: string } };
      return [item.value ?? "", item.label?.zh ?? "", item.label?.en ?? ""].join("|");
    })
    .join("\n");
}

/** Stored as packed "zh||en" strings → one "中文|English" line each. */
function scopeToText(scope: string[] | undefined) {
  return (scope ?? []).map((entry) => entry.split("||").join("|")).join("\n");
}

export function CaseForm({ record }: { record?: CaseRecord }) {
  return (
    <ActionForm action={saveCase} className="space-y-6">
      {record ? <input type="hidden" name="id" value={record.id} /> : null}

      <FormSection title="项目信息">
        <FormField label="项目名称（中文）" name="titleZh" required defaultValue={record?.titleZh} placeholder="例如：方形铝壳电芯装配线控制系统" />
        <FormField label="项目名称（英文）" name="titleEn" defaultValue={record?.titleEn} />
        <FormField label="URL 别名 / Slug" name="slug" defaultValue={record?.slug} placeholder="留空自动生成" />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="客户（中文）" name="clientZh" defaultValue={record?.clientZh} placeholder="国内头部动力电池企业" />
          <FormField label="客户（英文）" name="clientEn" defaultValue={record?.clientEn} />
          <FormField label="行业（中文）" name="industryZh" defaultValue={record?.industryZh} placeholder="新能源锂电" />
          <FormField label="行业（英文）" name="industryEn" defaultValue={record?.industryEn} />
          <FormField label="交付年份" name="year" type="number" defaultValue={record?.year ?? new Date().getFullYear()} />
          <FormField label="项目地点" name="location" defaultValue={record?.location} placeholder="广东 · 惠州" />
        </div>
        <FormTextarea label="项目简介（中文）" name="summaryZh" rows={3} defaultValue={record?.summaryZh} />
        <FormTextarea label="项目简介（英文）" name="summaryEn" rows={3} defaultValue={record?.summaryEn} />
      </FormSection>

      <FormSection title="封面与影像">
        <UploadField name="coverUrl" label="封面图片" folder="cases" defaultValue={record?.coverUrl ?? ""} accept="image/*" />
        <UploadField name="videoUrl" label="项目视频" folder="cases" defaultValue={record?.videoUrl ?? ""} accept="video/*" />
        <FormField label="图库链接" name="gallery" defaultValue={record?.gallery?.join(", ")} placeholder="用逗号分隔多个图片地址" description="可选，用于项目详情页的现场影像区" />
      </FormSection>

      <FormSection title="项目详情" description="支持 ## 标题、- 列表、**加粗** 等轻量标记。">
        <FormTextarea label="详情（中文）" name="contentZh" rows={12} defaultValue={record?.contentZh} mono />
        <FormTextarea label="详情（英文）" name="contentEn" rows={10} defaultValue={record?.contentEn} mono />
        <FormTextarea
          label="服务范围"
          name="scope"
          rows={4}
          defaultValue={scopeToText(record?.scope)}
          placeholder="每行一项，中文|English"
          description="每行一条，例如：整线控制方案与状态机设计|Full-line control concept"
          mono
        />
      </FormSection>

      <FormSection title="项目成果" description="每行一条，格式：数值|中文说明|English label">
        <FormTextarea
          label="关键指标"
          name="metrics"
          rows={4}
          defaultValue={metricsToText(record?.metrics)}
          placeholder={"-20%|节拍时间|Cycle time\n99.6%|设备综合效率|OEE"}
          mono
        />
      </FormSection>

      <FormSection title="发布设置">
        <div className="grid gap-5 sm:grid-cols-3">
          <FormSelect
            label="状态"
            name="status"
            defaultValue={record?.status ?? "DRAFT"}
            options={[
              { value: "DRAFT", label: "草稿" },
              { value: "PUBLISHED", label: "已发布" },
              { value: "ARCHIVED", label: "已归档" },
            ]}
          />
          <FormField label="排序" name="sortOrder" type="number" defaultValue={record?.sortOrder ?? 0} />
          <FormField label="标签" name="tags" defaultValue={record?.tags?.join(", ")} placeholder="S7-1500, MES" />
        </div>
        <FormCheckbox label="推荐到首页" name="featured" defaultChecked={record?.featured} />
      </FormSection>

      <FormActions cancelHref="/admin/cases" submitLabel={record ? "保存修改" : "创建案例"} />
    </ActionForm>
  );
}
