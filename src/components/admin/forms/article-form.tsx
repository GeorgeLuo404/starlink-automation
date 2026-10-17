import { saveArticle } from "@/lib/admin-actions";
import { ActionForm } from "@/components/admin/action-form";
import { FormActions, FormCheckbox, FormField, FormSection, FormSelect, FormTextarea } from "@/components/admin/form-fields";
import { UploadField } from "@/components/admin/upload-field";

type ArticleRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  tags: string[];
  status: string;
  featured: boolean;
  pinned: boolean;
  readMinutes: number;
  seoTitle: string | null;
  seoDesc: string | null;
  publishedAt: Date | null;
};

function toDateInput(value: Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function ArticleForm({ article }: { article?: ArticleRecord }) {
  const isEdit = Boolean(article);

  return (
    <ActionForm action={saveArticle} className="space-y-6">
      {article ? <input type="hidden" name="id" value={article.id} /> : null}

      <FormSection title="基本信息">
        <FormField label="标题" name="title" required defaultValue={article?.title} placeholder="例如：公司完成某头部电池企业热压机产线交付" />
        <FormField
          label="URL 别名 / Slug"
          name="slug"
          defaultValue={article?.slug}
          placeholder="留空则根据中文标题自动生成"
          description="用于生成链接：/zh/news/你的-slug"
        />
        <FormTextarea label="摘要" name="excerpt" rows={3} defaultValue={article?.excerpt} placeholder="列表页与分享卡片上显示的简介" />
      </FormSection>

      <FormSection title="封面" description="建议尺寸 1600×1000，支持上传到媒体库或直接填写 CDN 地址。">
        <UploadField name="coverUrl" label="封面图片" folder="articles" defaultValue={article?.coverUrl ?? ""} accept="image/*" />
      </FormSection>

      <FormSection
        title="正文"
        description="支持轻量标记：## 二级标题、### 三级标题、- 无序列表、1. 有序列表、> 引用、**加粗**、`代码`"
      >
        <FormTextarea label="正文" name="content" rows={16} required defaultValue={article?.content} mono />
      </FormSection>

      <FormSection title="发布设置">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormSelect
            label="状态"
            name="status"
            defaultValue={article?.status ?? "DRAFT"}
            options={[
              { value: "DRAFT", label: "草稿" },
              { value: "PUBLISHED", label: "已发布" },
              { value: "ARCHIVED", label: "已归档" },
            ]}
          />
          <FormField label="发布日期" name="publishedAt" type="date" defaultValue={toDateInput(article?.publishedAt ?? null)} />
          <FormField label="阅读时长（分钟）" name="readMinutes" type="number" defaultValue={article?.readMinutes ?? 3} />
          <FormField label="标签" name="tags" defaultValue={article?.tags?.join(", ")} placeholder="热压机, 锂电, 交付" description="用逗号分隔" />
        </div>
        <div className="space-y-3 pt-2">
          <FormCheckbox label="推荐到首页 / 精选" name="featured" defaultChecked={article?.featured} />
          <FormCheckbox label="置顶" name="pinned" defaultChecked={article?.pinned} />
        </div>
      </FormSection>

      <FormSection title="SEO">
        <FormField label="SEO 标题" name="seoTitle" defaultValue={article?.seoTitle} />
        <FormTextarea label="SEO 描述" name="seoDesc" rows={3} defaultValue={article?.seoDesc} />
      </FormSection>

      <FormActions cancelHref="/admin/articles" submitLabel={isEdit ? "保存修改" : "创建文章"} />
    </ActionForm>
  );
}
