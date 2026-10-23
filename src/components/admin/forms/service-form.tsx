import { saveService } from "@/lib/admin-actions";
import { ActionForm } from "@/components/admin/action-form";
import { FormActions, FormCheckbox, FormField, FormRichText, FormSection, FormSelect, FormTextarea } from "@/components/admin/form-fields";
import { MediaFields, type MediaRecord } from "@/components/admin/media-fields";

type ServiceRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string | null;
  icon: string | null;
  coverUrl: string | null;
  media: MediaRecord[];
  features: string[];
  deliverables: string[];
  faq: unknown;
  published: boolean;
};

function faqToText(faq: unknown) {
  if (!Array.isArray(faq)) return "";
  return faq
    .map((entry) => {
      const item = entry as { q?: string; a?: string };
      return [item.q ?? "", item.a ?? ""].join("|");
    })
    .join("\n");
}

export function ServiceForm({ record }: { record?: ServiceRecord }) {
  return (
    <ActionForm action={saveService} className="space-y-6">
      {record ? <input type="hidden" name="id" value={record.id} /> : null}

      <FormSection title="业务信息">
        <FormField label="名称" name="title" required defaultValue={record?.title} placeholder="例如：PLC 程序调试" />
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
        </div>
        <FormTextarea label="简介" name="summary" rows={2} defaultValue={record?.summary} />
      </FormSection>

      <FormSection title="封面与影像" description="封面显示在详情页顶部与业务卡片上；图片与视频显示在详情页的「现场影像」区。">
        <MediaFields
          folder="services"
          cover={record?.coverUrl}
          media={record?.media}
          shownIn="详情页「现场影像」区"
          whenEmpty="没有图片与视频时不显示该区域。"
        />
      </FormSection>

      <FormSection title="详情" description="在工具栏排版，所见即所得。行首输入 ##、-、1.、> 再加空格，可快速变为标题、列表、引用；Shift+回车 换行不分段。">
        <FormRichText label="详情" name="content" defaultValue={record?.content} />
      </FormSection>

      <FormSection title="服务内容" description="每行一条。">
        <FormTextarea
          label="服务内容清单"
          name="features"
          rows={8}
          defaultValue={record?.features.join("\n")}
          placeholder={"控制方案与 I/O 清单编制\nPLC / HMI 程序开发"}
          mono
        />
      </FormSection>

      <FormSection title="交付物" description="每行一条。">
        <FormTextarea
          label="交付物清单"
          name="deliverables"
          rows={6}
          defaultValue={record?.deliverables.join("\n")}
          placeholder={"带注释的程序源码与版本备份\nI/O 清单与信号地址表"}
          mono
        />
      </FormSection>

      <FormSection title="常见问题" description="每行一条，格式：问题|答案">
        <FormTextarea
          label="FAQ"
          name="faq"
          rows={5}
          defaultValue={faqToText(record?.faq)}
          placeholder={"可以在现有程序上二次开发吗？|可以。"}
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
