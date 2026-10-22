import "server-only";
import { cache } from "react";
import { z } from "zod";
import copy from "@/content/copy.json";
import { aboutValues, certifications, milestones, processSteps, teamComposition, whyItems } from "@/content/defaults";
import { SECTIONS, type Field, type SectionKey, type SectionState } from "@/content/page-sections";
import { fromDb } from "@/lib/data";

/*
 * 页面内容 / Editable page copy — defaults, validation and the reader.
 *
 * A PageContent row holds one section's fields as JSON. With no row (or an
 * unreadable one) the site shows the default text below, which is what the
 * site showed before these sections became editable.
 */

const URL_OR_PATH_RE = /^(https?:\/\/|\/)\S*$/i;

/* --------------------------------- defaults -------------------------------- */

const h = copy.home;

export const PAGE_DEFAULTS = {
  "home.hero": {
    eyebrow: h.hero.eyebrow,
    badge: h.hero.badge,
    titleTop: `${h.hero.titleTop}，`,
    titleBottom: h.hero.titleBottom,
    titleAccent: "链接",
    subtitle: h.hero.subtitle,
    ctaPrimary: h.hero.ctaPrimary,
    ctaSecondary: h.hero.ctaSecondary,
    ticker: h.hero.ticker,
  },
  "home.statement": { eyebrow: h.statement.eyebrow, text: h.statement.text, accent: "可验证的模块", stats: h.stats.items },
  "home.services": {
    eyebrow: h.services.eyebrow,
    title: "从图纸到整线，\n一条完整的交付链路",
    titleAccent: "交付链路",
    desc: h.services.desc,
    cta: h.services.cta,
  },
  "home.process": {
    eyebrow: h.process.eyebrow,
    title: h.process.title,
    desc: h.process.desc,
    steps: processSteps.map(({ title, desc, outputs }) => ({ title, desc, outputs })),
  },
  "home.cases": { eyebrow: h.cases.eyebrow, title: h.cases.title, desc: h.cases.desc },
  "home.integration": {
    eyebrow: h.integration.eyebrow,
    title: h.integration.title,
    titleAccent: "一站式集成",
    desc: h.integration.desc,
    nodes: h.integration.nodes,
    protocols: ["PROFINET", "EtherCAT", "EtherNet/IP", "Modbus TCP", "CC-Link IE", "OPC UA"],
  },
  "home.partners": { eyebrow: h.partners.eyebrow, note: h.partners.note },
  "home.why": { eyebrow: h.why.eyebrow, title: h.why.title, items: whyItems.map(({ title, desc }) => ({ title, desc })) },
  "home.news": { eyebrow: h.news.eyebrow, title: h.news.title },
  "home.cta": {
    eyebrow: h.cta.eyebrow,
    title: h.cta.title,
    desc: h.cta.desc,
    primary: h.cta.primary,
    secondary: h.cta.secondary,
    note: h.cta.note,
  },
  "about.hero": { title: copy.about.lead.replace(/。$/, "") },
  "about.intro": { title: copy.about.introTitle, intro: copy.about.intro, intro2: copy.about.intro2, image: "" },
  "about.stats": { items: copy.about.stats },
  "about.values": { title: copy.about.valuesTitle, items: aboutValues },
  "about.milestones": { title: copy.about.milestonesTitle, items: milestones },
  "about.team": { title: copy.about.teamTitle, items: teamComposition },
  "about.certifications": { title: copy.about.certificationsTitle, items: certifications },
  "contact.page": {
    title: h.cta.title,
    lead: copy.contact.lead,
    formTitle: copy.contact.formTitle,
    formDesc: copy.contact.formDesc,
  },
  "contact.info": {
    hoursLabel: copy.contact.hoursLabel,
    hoursValue: copy.contact.hoursValue,
    urgentLabel: copy.contact.urgentLabel,
    urgentValue: copy.contact.urgentValue,
  },
  "services.header": { eyebrow: copy.services.eyebrow, title: copy.services.title, lead: copy.services.lead },
  "cases.header": { eyebrow: copy.cases.eyebrow, title: h.cases.title, lead: copy.cases.lead },
  "news.header": { eyebrow: copy.news.eyebrow, title: h.news.title, lead: copy.news.lead },
  "gallery.header": { eyebrow: copy.gallery.eyebrow, title: h.gallery.title, lead: copy.gallery.lead },
  "downloads.header": { eyebrow: copy.downloads.eyebrow, title: copy.downloads.title, lead: copy.downloads.lead },
} satisfies Record<SectionKey, Record<string, unknown>>;

export type PageContent = typeof PAGE_DEFAULTS;

/* -------------------------------- validation ------------------------------- */

function fieldSchema(field: Field): z.ZodType {
  switch (field.kind) {
    case "text":
    case "textarea": {
      const max = field.max ?? (field.kind === "text" ? 200 : 2000);
      const text = z.string({ error: `请填写${field.label}` }).trim().max(max, `${field.label}不能超过 ${max} 个字`);
      return field.required ? text.min(1, `请填写${field.label}`) : text;
    }
    case "lines": {
      const max = field.max ?? 100;
      const maxItems = field.maxItems ?? 50;
      const lines = z
        .array(z.string().trim().min(1).max(max, `${field.label}每行不能超过 ${max} 个字`))
        .max(maxItems, `${field.label}最多 ${maxItems} 行`);
      return field.required ? lines.min(1, `请至少填写一行${field.label}`) : lines;
    }
    case "number": {
      const min = field.min ?? 0;
      const max = field.max ?? 1_000_000;
      return z
        .number({ error: `请填写${field.label}` })
        .int(`${field.label}必须是整数`)
        .min(min, `${field.label}不能小于 ${min}`)
        .max(max, `${field.label}不能大于 ${max}`);
    }
    case "image":
      return z
        .string()
        .trim()
        .max(2000, `${field.label}地址过长`)
        .refine((value) => !value || URL_OR_PATH_RE.test(value), `${field.label}必须是 http(s):// 开头的网址或以 / 开头的站内路径`);
    case "list": {
      const min = field.min ?? 0;
      const max = field.max ?? 20;
      return z
        .array(z.object(Object.fromEntries(field.fields.map((item) => [item.name, fieldSchema(item)]))))
        .min(min, `请至少添加 ${min} 个${field.itemLabel}`)
        .max(max, `${field.label}最多 ${max} 个`);
    }
  }
}

const schemas = new Map<SectionKey, z.ZodType>();

/** Validation for one section, built from its field definitions. */
export function pageContentSchema(key: SectionKey) {
  let schema = schemas.get(key);
  if (!schema) {
    schema = z.object(Object.fromEntries(SECTIONS[key].fields.map((field) => [field.name, fieldSchema(field)])));
    schemas.set(key, schema);
  }
  return schema;
}

/**
 * Zod issues → messages that say where the problem is ("步骤第 3 项：请填写名称"),
 * keyed by field path ("steps.2.title") for the inline errors.
 */
export function describeIssues(key: SectionKey, issues: z.core.$ZodIssue[]) {
  const fieldErrors: Record<string, string[]> = {};
  const messages = issues.map((issue) => {
    const [name, index] = issue.path;
    const field = SECTIONS[key].fields.find((f) => f.name === name);
    let message = issue.message;
    if (field && typeof index === "number") {
      message = field.kind === "list" ? `${field.label}第 ${index + 1} 项：${message}` : `${field.label}第 ${index + 1} 行：${message}`;
    }
    (fieldErrors[issue.path.join(".")] ??= []).push(message);
    return message;
  });
  return { message: messages[0] ?? "内容无效，请检查后重试", fieldErrors };
}

/* ---------------------------------- reader --------------------------------- */

const loadRows = cache(() =>
  fromDb((db) => db.pageContent.findMany({ select: { key: true, data: true } }), [] as { key: string; data: unknown }[])
);

/**
 * One section's content: what was saved in the admin, else the default. Saved
 * data is checked against the current fields, so a section saved before a
 * field was added still renders (the new field takes its default).
 */
export async function getPageContent<K extends SectionKey>(key: K): Promise<PageContent[K]> {
  const fallback = PAGE_DEFAULTS[key];
  const row = (await loadRows()).find((r) => r.key === key);
  if (!row || typeof row.data !== "object" || row.data === null) return fallback;

  const parsed = pageContentSchema(key).safeParse({ ...fallback, ...row.data });
  if (!parsed.success) {
    console.warn(`[page-content] ${key} no longer matches its fields; showing the default text.`);
    return fallback;
  }
  return parsed.data as PageContent[K];
}

/** Content, defaults and saved flag of several sections, for the admin editors. */
export async function getSectionStates(keys: SectionKey[]): Promise<Partial<Record<SectionKey, SectionState>>> {
  const rows = await loadRows();
  const entries = await Promise.all(
    keys.map(async (key): Promise<[SectionKey, SectionState]> => [
      key,
      { value: await getPageContent(key), defaults: PAGE_DEFAULTS[key], saved: rows.some((r) => r.key === key) },
    ])
  );
  return Object.fromEntries(entries);
}
