import { z } from "zod";

/**
 * Validation for every admin form.
 *
 * Server actions receive raw FormData, so each schema accepts strings (or a
 * missing key) and normalises them: blanks become null, numbers are coerced,
 * checkboxes become booleans and the "中文|English" line formats are split.
 * Messages are Chinese because the admin UI is Chinese-only.
 */

export const PUBLISH_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const INQUIRY_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "SPAM"] as const;
export const SERVICE_ICONS = ["Cpu", "Bot", "Ruler", "BatteryCharging", "Flame"] as const;
export const DOWNLOAD_FILE_TYPES = ["PDF", "ZIP", "DOCX", "XLSX", "PPTX", "CSV", "TXT"] as const;

const SLUG_RE = /^[a-z0-9_一-龥]+(?:-[a-z0-9_一-龥]+)*$/;
/** Absolute http(s) URL or a site-relative path — rejects javascript:, data: and friends. */
const URL_OR_PATH_RE = /^(https?:\/\/|\/)\S*$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-\s\d]{6,20}$/;

const blank = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);

/* ------------------------------ field builders ------------------------------ */

const required = (label: string, max = 200) =>
  z
    .string({ error: `请填写${label}` })
    .trim()
    .min(1, `请填写${label}`)
    .max(max, `${label}不能超过 ${max} 个字符`);

/** Optional text — blank input becomes null. */
const optional = (label: string, max = 500) =>
  z
    .preprocess(blank, z.string().trim().max(max, `${label}不能超过 ${max} 个字符`).optional())
    .transform((value) => value ?? null);

const link = (label: string) =>
  z
    .preprocess(
      blank,
      z
        .string()
        .trim()
        .max(2000, `${label}过长`)
        .regex(URL_OR_PATH_RE, `${label}必须是 http(s):// 开头的网址或以 / 开头的站内路径`)
        .optional()
    )
    .transform((value) => value ?? null);

const requiredLink = (label: string) =>
  required(label, 2000).regex(URL_OR_PATH_RE, `${label}必须是 http(s):// 开头的网址或以 / 开头的站内路径`);

const int = (label: string, min: number, max: number, fallback: number) =>
  z.preprocess(
    (value) => blank(value) ?? fallback,
    z.coerce
      .number({ error: `${label}必须是数字` })
      .int(`${label}必须是整数`)
      .min(min, `${label}不能小于 ${min}`)
      .max(max, `${label}不能大于 ${max}`)
  );

const checkbox = z.preprocess((value) => value === "on" || value === "true" || value === "1", z.boolean());

const recordId = z.preprocess(blank, z.string().max(64).optional());
const requiredId = z.string({ error: "缺少记录 ID" }).min(1, "缺少记录 ID").max(64);

const slug = z.preprocess(
  blank,
  z
    .string()
    .trim()
    .toLowerCase()
    .max(120, "Slug 不能超过 120 个字符")
    .regex(SLUG_RE, "Slug 只能包含小写字母、数字、中文和连字符，例如 plc-commissioning")
    .optional()
);

const publishStatus = z.enum(PUBLISH_STATUSES, { error: "请选择有效的状态" });

const date = (label: string) =>
  z
    .preprocess(blank, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label}格式应为 YYYY-MM-DD`).optional())
    .transform((value) => (value ? new Date(value) : null));

/** Comma / newline separated list → string[]. */
const list = (label: string, max = 5000) =>
  optional(label, max).transform((value) =>
    value
      ? value
          .split(/[,，\n]/)
          .map((item) => item.trim())
          .filter(Boolean)
      : []
  );

/** One entry per line, fields separated by "|" → string[][]. */
const pipeLines = (label: string, max = 10000) =>
  optional(label, max).transform((value) =>
    value
      ? value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => line.split("|").map((part) => part.trim()))
      : []
  );

/* --------------------------------- schemas --------------------------------- */

export const articleSchema = z.object({
  id: recordId,
  titleZh: required("中文标题"),
  titleEn: optional("英文标题", 200),
  slug,
  excerptZh: optional("中文摘要", 500),
  excerptEn: optional("英文摘要", 500),
  contentZh: required("中文正文", 100_000),
  contentEn: optional("英文正文", 100_000),
  coverUrl: link("封面图片"),
  tags: list("标签", 500),
  status: publishStatus,
  publishedAt: date("发布日期"),
  readMinutes: int("阅读时长", 1, 240, 3),
  featured: checkbox,
  pinned: checkbox,
  seoTitle: optional("SEO 标题", 200),
  seoDesc: optional("SEO 描述", 500),
});

export const caseSchema = z.object({
  id: recordId,
  titleZh: required("项目名称（中文）"),
  titleEn: optional("项目名称（英文）", 200),
  slug,
  clientZh: optional("客户（中文）", 120),
  clientEn: optional("客户（英文）", 120),
  industryZh: optional("行业（中文）", 120),
  industryEn: optional("行业（英文）", 120),
  year: int("交付年份", 1990, 2100, new Date().getFullYear()),
  location: optional("项目地点", 200),
  summaryZh: optional("项目简介（中文）", 2000),
  summaryEn: optional("项目简介（英文）", 2000),
  contentZh: optional("详情（中文）", 100_000),
  contentEn: optional("详情（英文）", 100_000),
  coverUrl: link("封面图片"),
  videoUrl: link("项目视频"),
  gallery: list("图库链接").refine(
    (urls) => urls.every((url) => URL_OR_PATH_RE.test(url)),
    "图库链接中有无效地址：每项都必须是 http(s):// 网址或以 / 开头的路径"
  ),
  scope: pipeLines("服务范围", 5000),
  metrics: pipeLines("关键指标", 5000).refine(
    (rows) => rows.every((row) => row[0]),
    "关键指标每行格式应为：数值|中文说明|English label"
  ),
  tags: list("标签", 500),
  status: publishStatus,
  featured: checkbox,
  sortOrder: int("排序", -9999, 9999, 0),
});

export const serviceSchema = z.object({
  id: recordId,
  titleZh: required("名称（中文）"),
  titleEn: optional("名称（英文）", 200),
  slug,
  icon: z.enum(SERVICE_ICONS, { error: "请选择有效的图标" }),
  sortOrder: int("排序", -9999, 9999, 0),
  summaryZh: optional("简介（中文）", 2000),
  summaryEn: optional("简介（英文）", 2000),
  contentZh: optional("详情（中文）", 100_000),
  contentEn: optional("详情（英文）", 100_000),
  coverUrl: link("封面图片"),
  videoUrl: link("介绍视频"),
  features: pipeLines("服务内容"),
  deliverables: pipeLines("交付物"),
  faq: pipeLines("FAQ").refine(
    (rows) => rows.every((row) => row[0] && row[2]),
    "FAQ 每行格式应为：问题中文|Question EN|答案中文|Answer EN（问题与答案的中文必填）"
  ),
  published: checkbox,
});

export const downloadSchema = z.object({
  id: recordId,
  titleZh: required("标题（中文）"),
  titleEn: optional("标题（英文）", 200),
  slug,
  descriptionZh: optional("简介（中文）", 2000),
  descriptionEn: optional("简介（英文）", 2000),
  fileUrl: link("文件地址"),
  storageKey: optional("存储键", 500),
  fileType: z.enum(DOWNLOAD_FILE_TYPES, { error: "请选择有效的文件类型" }),
  fileSize: int("文件大小", 0, 2_147_483_647, 0),
  version: optional("版本", 40),
  status: publishStatus,
  sortOrder: int("排序", -9999, 9999, 0),
  requiresForm: checkbox,
});

export const gallerySchema = z.object({
  id: recordId,
  titleZh: required("标题（中文）"),
  titleEn: optional("标题（英文）", 200),
  captionZh: optional("说明（中文）", 500),
  captionEn: optional("说明（英文）", 500),
  mediaKind: z.enum(["IMAGE", "VIDEO"], { error: "请选择有效的类型" }),
  url: requiredLink("图片 / 视频封面"),
  thumbUrl: link("缩略图"),
  videoUrl: link("视频文件"),
  album: required("相册", 60),
  status: publishStatus,
  sortOrder: int("排序", -9999, 9999, 0),
});

export const partnerSchema = z.object({
  id: recordId,
  name: required("名称", 80),
  url: optional("品牌中文名", 80),
  logoUrl: link("Logo 地址"),
  active: checkbox,
  sortOrder: int("排序", -9999, 9999, 0),
});

export const settingsSchema = z.object({
  heroVideoUrl: link("首页背景视频"),
  heroPosterUrl: link("视频封面图"),
  contactPhone: optional("业务电话", 32).refine(
    (value) => !value || PHONE_RE.test(value),
    "业务电话格式不正确"
  ),
  contactEmail: optional("业务邮箱", 128).refine(
    (value) => !value || EMAIL_RE.test(value),
    "业务邮箱格式不正确"
  ),
  contactAddressZh: optional("公司地址（中文）", 300),
  contactAddressEn: optional("公司地址（英文）", 300),
  icp: optional("ICP 备案号", 60),
  analyticsId: optional("统计代码 ID", 100).refine(
    (value) => !value || /^[\w-]+$/.test(value),
    "统计代码 ID 只能包含字母、数字、下划线和连字符"
  ),
});

export const idSchema = z.object({ id: requiredId });

export const articleStatusSchema = z.object({ id: requiredId, status: publishStatus });

export const inquiryUpdateSchema = z.object({
  id: requiredId,
  status: z.enum(INQUIRY_STATUSES, { error: "请选择有效的状态" }),
  note: optional("跟进备注", 1000),
});

/* --------------------------------- helpers --------------------------------- */

/** FormData → plain object for zod. Unknown keys (e.g. Next's $ACTION_ fields) are stripped by the schemas. */
export function formObject(form: FormData) {
  const result: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}
