import { getPrisma } from "@/lib/prisma";
import type { Locale } from "@/lib/i18n/config";
import {
  articles as defaultArticles,
  cases as defaultCases,
  downloads as defaultDownloads,
  galleryItems as defaultGallery,
  partners as defaultPartners,
  services as defaultServices,
  type ArticleContent,
  type CaseContent,
  type DownloadContent,
  type GalleryContent,
  type Localized,
  type ServiceContent,
  unpackLocalized,
} from "@/content/defaults";

/**
 * Content repository.
 *
 * Every reader tries PostgreSQL first and silently falls back to the bundled
 * content in src/content/defaults.ts. That means:
 *   · the marketing site never shows a 500 because the DB is down;
 *   · a fresh clone is fully browsable before you provision a database;
 *   · the admin writes to the database, and the public site picks it up.
 */

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number; totalPages: number };

async function fromDb<T>(query: (db: NonNullable<ReturnType<typeof getPrisma>>) => Promise<T>, fallback: T): Promise<T> {
  const db = getPrisma();
  if (!db) return fallback;
  try {
    const result = await query(db);
    return result;
  } catch {
    return fallback;
  }
}

function localPair<T extends Record<string, unknown>>(row: T, field: string) {
  return {
    zh: String(row[`${field}Zh`] ?? ""),
    en: String(row[`${field}En`] ?? row[`${field}Zh`] ?? ""),
  };
}

/* --------------------------------- 业务能力 -------------------------------- */

function toService(row: Record<string, unknown>): ServiceContent {
  return {
    slug: String(row.slug),
    title: localPair(row, "title"),
    summary: localPair(row, "summary"),
    content: localPair(row, "content"),
    icon: String(row.icon ?? "Cpu"),
    features: Array.isArray(row.features) ? (row.features as ServiceContent["features"]) : [],
    deliverables: Array.isArray(row.deliverables)
      ? (row.deliverables as ServiceContent["deliverables"])
      : [],
    faq: Array.isArray(row.faq) ? (row.faq as ServiceContent["faq"]) : [],
  };
}

export async function listServices(): Promise<ServiceContent[]> {
  return fromDb(async (db) => {
    const rows = await db.service.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
    if (!rows.length) return defaultServices;
    return rows.map((row) => toService(row as unknown as Record<string, unknown>));
  }, defaultServices);
}

export async function getService(slug: string): Promise<ServiceContent | null> {
  return fromDb(async (db) => {
    const row = await db.service.findUnique({ where: { slug } });
    if (!row) return defaultServices.find((s) => s.slug === slug) ?? null;
    return toService(row as unknown as Record<string, unknown>);
  }, defaultServices.find((s) => s.slug === slug) ?? null);
}

/* --------------------------------- 项目案例 -------------------------------- */

function toCase(row: Record<string, unknown>): CaseContent {
  const metrics = Array.isArray(row.metrics)
    ? (row.metrics as { value: string; label: { zh: string; en: string } }[])
    : [];
  return {
    slug: String(row.slug),
    title: localPair(row, "title"),
    client: localPair(row, "client"),
    industry: localPair(row, "industry"),
    year: Number(row.year ?? new Date().getFullYear()),
    location: unpackLocalized(String(row.location ?? "")),
    summary: { zh: String(row.summaryZh ?? ""), en: String(row.summaryEn ?? row.summaryZh ?? "") },
    content: { zh: String(row.contentZh ?? ""), en: String(row.contentEn ?? row.contentZh ?? "") },
    scope: Array.isArray(row.scope) ? (row.scope as string[]).map(unpackLocalized) : [],
    metrics,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    featured: Boolean(row.featured),
  };
}

export async function listCases(options?: { featuredOnly?: boolean; limit?: number }): Promise<CaseContent[]> {
  const fallback = (() => {
    let items = defaultCases;
    if (options?.featuredOnly) items = items.filter((c) => c.featured);
    if (options?.limit) items = items.slice(0, options.limit);
    return items;
  })();

  return fromDb(async (db) => {
    const rows = await db.project.findMany({
      where: { status: "PUBLISHED", ...(options?.featuredOnly ? { featured: true } : {}) },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: options?.limit,
    });
    if (!rows.length) return fallback;
    return rows.map((row) => toCase(row as unknown as Record<string, unknown>));
  }, fallback);
}

export async function getCase(slug: string): Promise<CaseContent | null> {
  return fromDb(async (db) => {
    const row = await db.project.findUnique({ where: { slug } });
    if (!row) return defaultCases.find((c) => c.slug === slug) ?? null;
    return toCase(row as unknown as Record<string, unknown>);
  }, defaultCases.find((c) => c.slug === slug) ?? null);
}

/* ---------------------------------- 新闻 ---------------------------------- */

export type ArticleView = ArticleContent & { id?: string; views?: number; coverUrl?: string | null; categoryLabel?: { zh: string; en: string } };

function toArticle(row: Record<string, unknown>): ArticleView {
  const category = row.category as Record<string, unknown> | undefined | null;
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug),
    title: localPair(row, "title"),
    excerpt: localPair(row, "excerpt"),
    content: localPair(row, "content"),
    category: category
      ? { zh: String(category.nameZh ?? ""), en: String(category.nameEn ?? category.nameZh ?? "") }
      : { zh: "公司新闻", en: "Company news" },
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    publishedAt: row.publishedAt ? new Date(row.publishedAt as string).toISOString() : new Date().toISOString(),
    readMinutes: Number(row.readMinutes ?? 3),
    featured: Boolean(row.featured),
    views: Number(row.viewCount ?? 0),
    coverUrl: (row.coverUrl as string) ?? null,
  };
}

export async function listArticles(options?: {
  page?: number;
  pageSize?: number;
  category?: string;
  query?: string;
  featuredOnly?: boolean;
}): Promise<Paginated<ArticleView>> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, Math.min(options?.pageSize ?? 9, 50));

  const fallbackAll = (() => {
    let items: ArticleView[] = defaultArticles.map((a) => ({ ...a }));
    if (options?.featuredOnly) items = items.filter((a) => a.featured);
    if (options?.category) items = items.filter((a) => a.category.zh === options.category);
    if (options?.query) {
      const q = options.query.toLowerCase();
      items = items.filter(
        (a) => a.title.zh.toLowerCase().includes(q) || a.title.en.toLowerCase().includes(q) || a.excerpt.zh.includes(q)
      );
    }
    items.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
    return items;
  })();

  const fallback: Paginated<ArticleView> = {
    items: fallbackAll.slice((page - 1) * pageSize, page * pageSize),
    total: fallbackAll.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(fallbackAll.length / pageSize)),
  };

  return fromDb(async (db) => {
    const where = {
      status: "PUBLISHED" as const,
      ...(options?.featuredOnly ? { featured: true } : {}),
      ...(options?.query
        ? {
            OR: [
              { titleZh: { contains: options.query, mode: "insensitive" as const } },
              { titleEn: { contains: options.query, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(options?.category ? { category: { slug: options.category } } : {}),
    };

    const [rows, total] = await Promise.all([
      db.article.findMany({
        where,
        include: { category: true },
        orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.article.count({ where }),
    ]);

    if (!rows.length && page === 1) return fallback;
    return {
      items: rows.map((row) => toArticle(row as unknown as Record<string, unknown>)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }, fallback);
}

export async function getArticle(slug: string): Promise<ArticleView | null> {
  return fromDb(async (db) => {
    const row = await db.article.findUnique({ where: { slug }, include: { category: true } });
    if (!row) return defaultArticles.find((a) => a.slug === slug) ?? null;
    return toArticle(row as unknown as Record<string, unknown>);
  }, defaultArticles.find((a) => a.slug === slug) ?? null);
}

export async function listArticleCategories(): Promise<{ slug: string; nameZh: string; nameEn: string }[]> {
  const fallback = [...new Set(defaultArticles.map((a) => a.category.zh))].map((zh) => ({
    slug: zh,
    nameZh: zh,
    nameEn: defaultArticles.find((a) => a.category.zh === zh)?.category.en ?? zh,
  }));
  return fromDb(async (db) => {
    const rows = await db.category.findMany({ where: { kind: "ARTICLE" }, orderBy: { sortOrder: "asc" } });
    if (!rows.length) return fallback;
    return rows.map((r) => ({ slug: r.slug, nameZh: r.nameZh, nameEn: r.nameEn }));
  }, fallback);
}

/* ---------------------------------- 图库 ---------------------------------- */

export type GalleryView = GalleryContent & { url?: string; thumbUrl?: string };

export async function listGallery(album?: string): Promise<GalleryView[]> {
  const fallback = album && album !== "all" ? defaultGallery.filter((g) => g.album.zh === album) : defaultGallery;
  return fromDb(async (db) => {
    const rows = await db.galleryItem.findMany({
      where: { status: "PUBLISHED", ...(album && album !== "all" ? { album } : {}) },
      orderBy: { sortOrder: "asc" },
    });
    if (!rows.length) return fallback;
    return rows.map((r) => ({
      title: { zh: r.titleZh, en: r.titleEn ?? r.titleZh },
      caption: { zh: r.captionZh ?? "", en: r.captionEn ?? r.captionZh ?? "" },
      album: { zh: r.album, en: r.album },
      mediaKind: r.mediaKind === "VIDEO" ? "VIDEO" : "IMAGE",
      url: r.url,
      thumbUrl: r.thumbUrl ?? r.url,
    }));
  }, fallback);
}

/* --------------------------------- 下载资料 -------------------------------- */

export type DownloadView = DownloadContent & { id?: string; fileUrl?: string; downloadCount?: number };

export async function listDownloads(): Promise<DownloadView[]> {
  const fallback: DownloadView[] = defaultDownloads.map((d) => ({ ...d }));
  return fromDb(async (db) => {
    const rows = await db.downloadFile.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    });
    if (!rows.length) return fallback;
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: { zh: r.titleZh, en: r.titleEn ?? r.titleZh },
      description: { zh: r.descriptionZh ?? "", en: r.descriptionEn ?? r.descriptionZh ?? "" },
      fileType: r.fileType,
      fileSize: r.fileSize,
      version: r.version ?? "",
      sortOrder: r.sortOrder,
      fileUrl: r.fileUrl,
      downloadCount: r.downloadCount,
    }));
  }, fallback);
}

export async function getDownload(slug: string): Promise<DownloadView | null> {
  return fromDb(async (db) => {
    const r = await db.downloadFile.findUnique({ where: { slug } });
    if (!r) return defaultDownloads.find((d) => d.slug === slug) ?? null;
    return {
      id: r.id,
      slug: r.slug,
      title: { zh: r.titleZh, en: r.titleEn ?? r.titleZh },
      description: { zh: r.descriptionZh ?? "", en: r.descriptionEn ?? r.descriptionZh ?? "" },
      fileType: r.fileType,
      fileSize: r.fileSize,
      version: r.version ?? "",
      sortOrder: r.sortOrder,
      fileUrl: r.fileUrl,
      downloadCount: r.downloadCount,
    };
  }, defaultDownloads.find((d) => d.slug === slug) ?? null);
}

/* --------------------------------- 合作伙伴 -------------------------------- */

export async function listPartners(): Promise<{ name: string; sub: Localized }[]> {
  return fromDb(async (db) => {
    const rows = await db.partner.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
    if (!rows.length) return defaultPartners;
    // In the admin, Partner.url carries the Chinese brand name (see admin/partners),
    // so it doubles as the localised secondary line.
    return rows.map((r) => ({ name: r.name, sub: { zh: r.url ?? r.name, en: r.name } }));
  }, defaultPartners);
}

/* ---------------------------------- 询盘 ---------------------------------- */

export type InquiryInput = {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  service?: string;
  message: string;
  locale?: Locale;
  source?: string;
};

export async function createInquiry(input: InquiryInput): Promise<{ ok: boolean; stored: boolean }> {
  const db = getPrisma();
  if (!db) {
    // No database yet — log it so nothing is silently lost in development.
    console.warn("[inquiry] DATABASE_URL not configured, message not persisted:", input);
    return { ok: true, stored: false };
  }
  try {
    await db.inquiry.create({
      data: {
        name: input.name,
        company: input.company || null,
        phone: input.phone || null,
        email: input.email || null,
        service: input.service || null,
        message: input.message,
        locale: input.locale ?? "zh",
        source: input.source ?? "contact",
      },
    });
    return { ok: true, stored: true };
  } catch (error) {
    console.error("[inquiry] failed to persist:", error);
    return { ok: false, stored: false };
  }
}

export async function incrementArticleViews(slug: string) {
  const db = getPrisma();
  if (!db) return;
  try {
    await db.article.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
  } catch {
    /* view counting must never break a page render */
  }
}

export async function incrementDownloadCount(slug: string) {
  const db = getPrisma();
  if (!db) return;
  try {
    await db.downloadFile.update({ where: { slug }, data: { downloadCount: { increment: 1 } } });
  } catch {
    /* ignore */
  }
}
