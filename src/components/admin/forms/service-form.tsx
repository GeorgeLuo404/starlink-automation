import { saveService } from "@/lib/admin-actions";
import { ActionForm } from "@/components/admin/action-form";
import { FormActions, FormCheckbox, FormField, FormSection, FormSelect, FormTextarea } from "@/components/admin/form-fields";
import { UploadField } from "@/components/admin/upload-field";

type ServiceRecord = {
  id: string;
  slug: string;
  titleZh: string;
  titleEn: string | null;
  summaryZh: string | null;
  summaryEn: string | null;
  contentZh: string | null;
  contentEn: string | null;
  icon: string | null;
  coverUrl: string | null;
  videoUrl: string | null;
  features: unknown;
  deliverables: unknown;
  faq: unknown;
  published: boolean;
  sortOrder: number;
};

function deliverablesToText(deliverables: unknown) {
  if (!Array.isArray(deliverables)) return "";
  return deliverables
    .map((entry) => {
      const item = entry as { zh?: string; en?: string };
      return [item.zh ?? "", item.en ?? ""].join("|");
    })
    .join("\n");
}

function faqToText(faq: unknown) {
  if (!Array.isArray(faq)) return "";
  return faq
    .map((entry) => {
      const item = entry as { q?: { zh?: string; en?: string }; a?: { zh?: string; en?: string } };
      return [item.q?.zh ?? "", item.q?.en ?? "", item.a?.zh ?? "", item.a?.en ?? ""].join("|");
    })
    .join("\n");
}

function featuresToText(features: unknown) {
  if (!Array.isArray(features)) return "";
  return features
    .map((entry) => {
      const item = entry as { zh?: string; en?: string };
      return [item.zh ?? "", item.en ?? ""].join("|");
    })
    .join("\n");
}

export function ServiceForm({ record }: { record?: ServiceRecord }) {
  return (
    <ActionForm action={saveService} className="space-y-6">
      {record ? <input type="hidden" name="id" value={record.id} /> : null}

      <FormSection title="业务信息">
        <FormField label="名称（中文）" name="titleZh" required defaultValue={record?.titleZh} placeholder="例如：PLC 程序调试" />
        <FormField label="名称（英文）" name="titleEn" defaultValue={record?.titleEn} placeholder="PLC Programming & Commissioning" />
        <FormField label="URL 别名 / Slug" name="slug" defaultValue={record?.slug} placeholder="留空自动生成，例如 plc" />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormSelect
            label="图标"
            name="icon"
            defaultValue={record?.icon ?? "Cpu"}
            options={[
              { value: "Cpu", label: "Cpu — 控制 / 程序" },
              { value: "Bot", label: "Bot — 机器人" },
              { value: "Ruler", label: "Ruler — 设计 / 图纸" },
              { value: "BatteryCharging", label: "BatteryCharging — 电池" },
              { value: "Flame", label: "Flame — 热压 / 温度" },
            ]}
          />
          <FormField label="排序" name="sortOrder" type="number" defaultValue={record?.sortOrder ?? 0} />
        </div>
        <FormTextarea label="简介（中文）" name="summaryZh" rows={2} defaultValue={record?.summaryZh} />
        <FormTextarea label="简介（英文）" name="summaryEn" rows={2} defaultValue={record?.summaryEn} />
      </FormSection>

      <FormSection title="配图">
        <UploadField name="coverUrl" label="封面图片" folder="services" defaultValue={record?.coverUrl ?? ""} accept="image/*" />
        <UploadField name="videoUrl" label="介绍视频" folder="services" defaultValue={record?.videoUrl ?? ""} accept="video/*" />
      </FormSection>

      <FormSection title="详情" description="支持 ## 标题、- 列表等轻量标记。">
        <FormTextarea label="详情（中文）" name="contentZh" rows={10} defaultValue={record?.contentZh} mono />
        <FormTextarea label="详情（英文）" name="contentEn" rows={10} defaultValue={record?.contentEn} mono />
      </FormSection>

      <FormSection title="服务内容" description="每行一条，格式：中文|English">
        <FormTextarea
          label="服务内容清单"
          name="features"
          rows={8}
          defaultValue={featuresToText(record?.features)}
          placeholder={"控制方案与 I/O 清单编制|Control concept and I/O list\nPLC / HMI 程序开发|PLC & HMI development"}
          mono
        />
      </FormSection>

      <FormSection title="交付物" description="每行一条，格式：中文|English">
        <FormTextarea
          label="交付物清单"
          name="deliverables"
          rows={6}
          defaultValue={deliverablesToText(record?.deliverables)}
          placeholder={"带注释的程序源码与版本备份|Commented source code\nI/O 清单与信号地址表|I/O list"}
          mono
        />
      </FormSection>

      <FormSection title="常见问题" description="每行一条，格式：问题中文|Question EN|答案中文|Answer EN">
        <FormTextarea
          label="FAQ"
          name="faq"
          rows={5}
          defaultValue={faqToText(record?.faq)}
          placeholder={"可以在现有程序上二次开发吗？|Can you extend our program?|可以。|Yes."}
          mono
        />
      </FormSection>

      <FormSection title="发布设置">
        <FormCheckbox label="在前台显示" name="published" defaultChecked={record?.published ?? true} />
      </FormSection>

      <FormActions cancelHref="/admin/services" submitLabel={record ? "保存修改" : "创建业务"} />
    </ActionForm>
  );
}
