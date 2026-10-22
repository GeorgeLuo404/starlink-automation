/*
 * 页面内容 / Editable page copy — what admin can change on 首页、关于我们、联系我们
 * and the list pages' headers, section by section.
 *
 * Each section is a list of fields. The same definition drives the admin form
 * (src/components/admin/page-content) and the server-side validation
 * (src/lib/page-content.ts); the default text lives in copy.json / defaults.ts.
 * Kept free of runtime imports so admin client components can use it.
 */

type Base = { name: string; label: string; hint?: string; required?: boolean };

export type TextField = Base & { kind: "text"; max?: number; half?: boolean; placeholder?: string };
export type TextareaField = Base & { kind: "textarea"; max?: number; rows?: number };
/** A list of short strings, edited one per line. */
export type LinesField = Base & { kind: "lines"; maxItems?: number; max?: number };
export type NumberField = Base & { kind: "number"; min?: number; max?: number; half?: boolean };
export type ImageField = Base & { kind: "image"; folder?: string };
export type ItemField = TextField | TextareaField | LinesField | NumberField;
/** Repeatable cards (milestones, steps …), reorderable by drag. */
export type ListField = Base & { kind: "list"; itemLabel: string; fields: ItemField[]; min?: number; max?: number };
export type Field = ItemField | ImageField | ListField;

export type SectionDef = {
  key: SectionKey;
  title: string;
  /** Shown above the form — where the section appears, what is managed elsewhere. */
  description?: string;
  fields: Field[];
};

/** What an admin editor gets for a section: current content, the default text, and whether it was ever saved. */
export type SectionState = { value: Record<string, unknown>; defaults: Record<string, unknown>; saved: boolean };

export type PageDef = {
  id: "home" | "about" | "contact";
  title: string;
  description: string;
  /** Public path, for the 在前台查看 link. */
  path: string;
  /** In page order. `brands` is the 品牌平台 list, rendered by the page itself. */
  sections: (SectionDef | { key: "brands"; title: string })[];
};

/* ------------------------------ shared fields ------------------------------ */

const eyebrow: TextField = { kind: "text", name: "eyebrow", label: "眉标", hint: "标题上方的小字。", max: 30, half: true };
const title: TextField = { kind: "text", name: "title", label: "标题", required: true, max: 60 };
const accent: TextField = {
  kind: "text",
  name: "titleAccent",
  label: "强调文字",
  hint: "标题里用主色显示的那几个字，须与标题中的文字完全一致；留空则不强调。",
  max: 20,
};
const desc: TextareaField = { kind: "textarea", name: "desc", label: "说明", max: 300, rows: 3 };

const statFields: ItemField[] = [
  { kind: "number", name: "value", label: "数值", required: true, min: 0, max: 1_000_000, half: true },
  { kind: "text", name: "suffix", label: "单位", hint: "例如 +、%、 年", max: 8, half: true },
  { kind: "text", name: "label", label: "名称", required: true, max: 20 },
];

/* ---------------------------------- 首页 ---------------------------------- */

const home: PageDef = {
  id: "home",
  title: "首页",
  description: "按首页从上到下的顺序排列；业务能力、案例与新闻的内容在各自菜单中管理。",
  path: "/",
  sections: [
    {
      key: "home.hero",
      title: "首屏",
      fields: [
        { kind: "text", name: "eyebrow", label: "眉标", max: 40, half: true },
        { kind: "text", name: "badge", label: "眉标补充", hint: "接在眉标后面，用「·」隔开。", max: 30, half: true },
        { kind: "text", name: "titleTop", label: "标题第一行", required: true, max: 16, half: true },
        { kind: "text", name: "titleBottom", label: "标题第二行", required: true, max: 16, half: true },
        accent,
        { kind: "textarea", name: "subtitle", label: "副标题", required: true, max: 200, rows: 3 },
        { kind: "text", name: "ctaPrimary", label: "主按钮", hint: "链接到「联系我们」。", required: true, max: 12, half: true },
        { kind: "text", name: "ctaSecondary", label: "次按钮", hint: "链接到「项目案例」。", required: true, max: 12, half: true },
        { kind: "lines", name: "ticker", label: "底部关键词", hint: "每行一个。", maxItems: 10, max: 20 },
      ],
    },
    {
      key: "home.statement",
      title: "理念与数据",
      fields: [
        eyebrow,
        { kind: "textarea", name: "text", label: "理念", hint: "在中文逗号「，」处换行。", required: true, max: 80, rows: 2 },
        { ...accent, name: "accent", hint: "理念里用主色显示的文字，须与原文完全一致；留空则不强调。" },
        { kind: "list", name: "stats", label: "交付数据", itemLabel: "数据", min: 1, max: 8, hint: "宽屏一行 4 项。", fields: [...statFields, { kind: "text", name: "desc", label: "补充说明", max: 40 }] },
      ],
    },
    {
      key: "home.services",
      title: "业务能力",
      description: "这里只改栏目文字；业务卡片在左侧「业务能力」中管理。",
      fields: [
        eyebrow,
        { kind: "textarea", name: "title", label: "标题", hint: "可以换行。", required: true, max: 60, rows: 2 },
        accent,
        desc,
        { kind: "text", name: "cta", label: "按钮文字", required: true, max: 12, half: true },
      ],
    },
    {
      key: "home.process",
      title: "服务流程",
      description: "同时显示在「业务能力」列表页。前 6 步配有线稿插图。",
      fields: [
        eyebrow,
        title,
        desc,
        {
          kind: "list",
          name: "steps",
          label: "步骤",
          itemLabel: "步骤",
          min: 1,
          max: 10,
          fields: [
            { kind: "text", name: "title", label: "名称", required: true, max: 20 },
            { kind: "textarea", name: "desc", label: "说明", required: true, max: 300, rows: 3 },
            { kind: "lines", name: "outputs", label: "交付物", hint: "每行一个。", maxItems: 8, max: 30 },
          ],
        },
      ],
    },
    {
      key: "home.cases",
      title: "项目案例",
      description: "这里只改栏目文字；首页显示最新的 5 个案例，在「项目案例」中管理。",
      fields: [eyebrow, title, desc],
    },
    {
      key: "home.integration",
      title: "集成能力",
      fields: [
        eyebrow,
        title,
        accent,
        desc,
        { kind: "lines", name: "nodes", label: "集成节点", hint: "每行一个；宽屏一行 4 个，建议 4 或 8 个。", required: true, maxItems: 12, max: 20 },
        { kind: "lines", name: "protocols", label: "协议标签", hint: "每行一个。", maxItems: 12, max: 20 },
      ],
    },
    { key: "brands", title: "品牌平台" },
    {
      key: "home.why",
      title: "选择理由",
      fields: [
        eyebrow,
        title,
        {
          kind: "list",
          name: "items",
          label: "理由",
          itemLabel: "理由",
          min: 1,
          max: 12,
          fields: [
            { kind: "text", name: "title", label: "标题", required: true, max: 30 },
            { kind: "textarea", name: "desc", label: "说明", required: true, max: 300, rows: 3 },
          ],
        },
      ],
    },
    {
      key: "home.news",
      title: "新闻动态",
      description: "这里只改栏目文字；首页显示最新的 3 篇文章，在「新闻动态」中管理。",
      fields: [eyebrow, title],
    },
    {
      key: "home.cta",
      title: "行动号召",
      description: "首页与大多数内页底部的「开始合作」卡片。",
      fields: [
        eyebrow,
        title,
        desc,
        { kind: "text", name: "primary", label: "主按钮", hint: "链接到「联系我们」。", required: true, max: 12, half: true },
        { kind: "text", name: "secondary", label: "次按钮", hint: "链接到「资料下载」。", required: true, max: 12, half: true },
        { kind: "text", name: "note", label: "底部说明", max: 60 },
      ],
    },
  ],
};

/** The partners row's heading and trademark note, edited on the 品牌平台 tab. */
export const brandsSection: SectionDef = {
  key: "home.partners",
  title: "栏目文字",
  fields: [
    { ...eyebrow, required: true },
    {
      kind: "textarea",
      name: "note",
      label: "商标声明",
      hint: "显示在 Logo 行下方的小字。",
      max: 200,
      rows: 2,
    },
  ],
};

/* -------------------------------- 关于我们 -------------------------------- */

const about: PageDef = {
  id: "about",
  title: "关于我们",
  description: "公司全称、成立年份、地址和邮箱在「站点设置」中修改。",
  path: "/about",
  sections: [
    {
      key: "about.hero",
      title: "页头",
      fields: [{ kind: "text", name: "title", label: "标题", hint: "同时用作搜索引擎摘要。", required: true, max: 40 }],
    },
    {
      key: "about.intro",
      title: "公司简介",
      fields: [
        { ...title, label: "栏目标题", max: 20 },
        { kind: "textarea", name: "intro", label: "第一段", required: true, max: 600, rows: 5 },
        { kind: "textarea", name: "intro2", label: "第二段", max: 600, rows: 5 },
        { kind: "image", name: "image", label: "配图", hint: "留空则使用默认的线稿插图；建议 4:3 横图。", folder: "about" },
      ],
    },
    {
      key: "about.stats",
      title: "关键数据",
      fields: [{ kind: "list", name: "items", label: "数据", itemLabel: "数据", min: 1, max: 8, hint: "宽屏一行 4 项。", fields: statFields }],
    },
    {
      key: "about.values",
      title: "做事方式",
      fields: [
        { ...title, max: 20 },
        {
          kind: "list",
          name: "items",
          label: "原则",
          itemLabel: "原则",
          min: 1,
          max: 6,
          hint: "宽屏一行 3 项。",
          fields: [
            { kind: "text", name: "title", label: "标题", required: true, max: 30 },
            { kind: "textarea", name: "desc", label: "说明", required: true, max: 300, rows: 3 },
          ],
        },
      ],
    },
    {
      key: "about.milestones",
      title: "发展历程",
      fields: [
        { ...title, max: 20 },
        {
          kind: "list",
          name: "items",
          label: "里程碑",
          itemLabel: "里程碑",
          min: 1,
          max: 12,
          hint: "按时间先后排列；宽屏一行 6 项。",
          fields: [
            { kind: "text", name: "year", label: "年份", required: true, max: 10, half: true },
            { kind: "text", name: "title", label: "事件", required: true, max: 30, half: true },
            { kind: "textarea", name: "desc", label: "说明", max: 200, rows: 2 },
          ],
        },
      ],
    },
    {
      key: "about.team",
      title: "团队构成",
      fields: [
        { ...title, max: 20 },
        { kind: "list", name: "items", label: "岗位", itemLabel: "岗位", min: 1, max: 8, hint: "两列排列。", fields: statFields },
      ],
    },
    {
      key: "about.certifications",
      title: "资质与认证",
      fields: [
        { ...title, max: 20 },
        { kind: "lines", name: "items", label: "资质", hint: "每行一项。", required: true, maxItems: 20, max: 60 },
      ],
    },
  ],
};

/* -------------------------------- 联系我们 -------------------------------- */

const contact: PageDef = {
  id: "contact",
  title: "联系我们",
  description: "电话、邮箱和地址在「站点设置」中修改，全站共用。",
  path: "/contact",
  sections: [
    {
      key: "contact.page",
      title: "页头与表单",
      fields: [
        { kind: "text", name: "title", label: "标题", required: true, max: 40 },
        { kind: "textarea", name: "lead", label: "说明", hint: "同时用作搜索引擎摘要。", required: true, max: 200, rows: 2 },
        { kind: "text", name: "formTitle", label: "表单标题", required: true, max: 20, half: true },
        { kind: "text", name: "formDesc", label: "表单说明", max: 60, half: true },
      ],
    },
    {
      key: "contact.info",
      title: "补充信息",
      description: "显示在电话、邮箱、地址下方；内容留空的那一行不显示。",
      fields: [
        { kind: "text", name: "hoursLabel", label: "第一行名称", max: 12, half: true },
        { kind: "text", name: "hoursValue", label: "第一行内容", max: 40, half: true },
        { kind: "text", name: "urgentLabel", label: "第二行名称", max: 12, half: true },
        { kind: "text", name: "urgentValue", label: "第二行内容", max: 40, half: true },
      ],
    },
  ],
};

export const PAGES = { home, about, contact };

/* ------------------------------ 列表页页头 ------------------------------ */

const headerFields: Field[] = [
  eyebrow,
  { ...title, max: 40 },
  { kind: "textarea", name: "lead", label: "说明", hint: "同时用作搜索引擎摘要。", required: true, max: 200, rows: 2 },
];

const header = (key: HeaderKey, page: string): SectionDef => ({
  key,
  title: `${page}页头`,
  description: `「${page}」列表页顶部的文字。`,
  fields: headerFields,
});

/** The list pages' headers, edited from each list's admin page (页头文字). */
export const HEADERS = {
  services: header("services.header", "业务能力"),
  cases: header("cases.header", "项目案例"),
  news: header("news.header", "新闻动态"),
  gallery: header("gallery.header", "现场图库"),
  downloads: header("downloads.header", "资料下载"),
};

export type HeaderKey = `${"services" | "cases" | "news" | "gallery" | "downloads"}.header`;

export type SectionKey =
  | "home.hero"
  | "home.statement"
  | "home.services"
  | "home.process"
  | "home.cases"
  | "home.integration"
  | "home.partners"
  | "home.why"
  | "home.news"
  | "home.cta"
  | "about.hero"
  | "about.intro"
  | "about.stats"
  | "about.values"
  | "about.milestones"
  | "about.team"
  | "about.certifications"
  | "contact.page"
  | "contact.info"
  | HeaderKey;

/** Every editable section, by key. */
export const SECTIONS: Record<SectionKey, SectionDef> = Object.fromEntries(
  [
    ...Object.values(PAGES).flatMap((page) => page.sections.filter((s): s is SectionDef => "fields" in s)),
    brandsSection,
    ...Object.values(HEADERS),
  ].map((section) => [section.key, section])
) as Record<SectionKey, SectionDef>;
