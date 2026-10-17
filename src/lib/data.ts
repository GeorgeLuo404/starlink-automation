import { cache } from "react";
import { getPrisma } from "@/lib/prisma";
import {
  articles as defaultArticles,
  cases as defaultCases,
  company,
  downloads as defaultDownloads,
  galleryItems as defaultGallery,
  partners as defaultPartners,
  services as defaultServices,
  type ArticleContent,
  type CaseContent,
  type DownloadContent,
  type GalleryContent,
  type ServiceContent,
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

/* --------------------------------- 业务能力 -------------------------------- */

function toService(row: Record<string, unknown>): ServiceContent {
  return {
    slug: String(row.slug),
    title: String(row.title ?? ""),
    summary: String(row.summary ?? ""),
    content: String(row.content ?? ""),
    icon: String(row.icon ?? "Cpu"),
    coverUrl: (row.coverUrl as string | null) ?? null,
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    deliverables: Array.isArray(row.deliverables) ? (row.deliverables as string[]) : [],
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
  return {
    slug: String(row.slug),
    title: String(row.title ?? ""),
    client: String(row.client ?? ""),
    industry: String(row.industry ?? ""),
    year: Number(row.year ?? new Date().getFullYear()),
    location: String(row.location ?? ""),
    summary: String(row.summary ?? ""),
    content: String(row.content ?? ""),
    scope: Array.isArray(row.scope) ? (row.scope as string[]) : [],
    metrics: Array.isArray(row.metrics) ? (row.metrics as CaseContent["metrics"]) : [],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    featured: Boolean(row.featured),
    coverUrl: (row.coverUrl as string | null) ?? null,
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

export type ArticleView = ArticleContent & { id?: string; views?: number; coverUrl?: string | null };

function toArticle(row: Record<string, unknown>): ArticleView {
  const category = row.category as Record<string, unknown> | undefined | null;
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    content: String(row.content ?? ""),
    category: category ? String(category.name ?? "") : "公司新闻",
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
    if (options?.category) items = items.filter((a) => a.category === options.category);
    if (options?.query) {
      const q = options.query.toLowerCase();
      items = items.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
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
              { title: { contains: options.query, mode: "insensitive" as const } },
              { excerpt: { contains: options.query, mode: "insensitive" as const } },
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

export async function listArticleCategories(): Promise<{ slug: string; name: string }[]> {
  const fallback = [...new Set(defaultArticles.map((a) => a.category))].map((name) => ({ slug: name, name }));
  return fromDb(async (db) => {
    const rows = await db.category.findMany({ where: { kind: "ARTICLE" }, orderBy: { sortOrder: "asc" } });
    if (!rows.length) return fallback;
    return rows.map((r) => ({ slug: r.slug, name: r.name }));
  }, fallback);
}

/* ---------------------------------- 图库 ---------------------------------- */

export type GalleryView = GalleryContent & { url?: string; thumbUrl?: string };

export async function listGallery(album?: string): Promise<GalleryView[]> {
  const fallback = album && album !== "all" ? defaultGallery.filter((g) => g.album === album) : defaultGallery;
  return fromDb(async (db) => {
    const rows = await db.galleryItem.findMany({
      where: { status: "PUBLISHED", ...(album && album !== "all" ? { album } : {}) },
      orderBy: { sortOrder: "asc" },
    });
    if (!rows.length) return fallback;
    return rows.map((r) => ({
      title: r.title,
      caption: r.caption ?? "",
      album: r.album,
      mediaKind: r.mediaKind === "VIDEO" ? "VIDEO" : "IMAGE",
      url: r.url,
      thumbUrl: r.thumbUrl ?? r.url,
    }));
  }, fallback);
}

/* --------------------------------- 下载资料 -------------------------------- */

export type DownloadView = DownloadContent & {
  id?: string;
  fileUrl?: string;
  downloadCount?: number;
  /** Ask for name and a contact method before the download starts. */
  requiresForm?: boolean;
};

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
      title: r.title,
      description: r.description ?? "",
      fileType: r.fileType,
      fileSize: r.fileSize,
      version: r.version ?? "",
      sortOrder: r.sortOrder,
      fileUrl: r.fileUrl,
      downloadCount: r.downloadCount,
      requiresForm: r.requiresForm,
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
      title: r.title,
      description: r.description ?? "",
      fileType: r.fileType,
      fileSize: r.fileSize,
      version: r.version ?? "",
      sortOrder: r.sortOrder,
      fileUrl: r.fileUrl,
      downloadCount: r.downloadCount,
      requiresForm: r.requiresForm,
    };
  }, defaultDownloads.find((d) => d.slug === slug) ?? null);
}

/* --------------------------------- 站点设置 -------------------------------- */

/** Values edited under 后台 → 站点设置. Empty strings fall back to the bundled defaults. */
export type SiteSettings = {
  phone: string;
  email: string;
  address: string;
  /** null → the placeholder in messages (footer.icp). */
  icp: string | null;
  analyticsId: string | null;
  heroVideoUrl: string | null;
  heroPosterUrl: string | null;
};

const defaultSettings: SiteSettings = {
  phone: company.phone,
  email: company.email,
  address: company.address,
  icp: null,
  analyticsId: null,
  heroVideoUrl: null,
  heroPosterUrl: null,
};

/** Cached per request, so the layout and the page share one query. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return fromDb(async (db) => {
    const rows = await db.siteSetting.findMany();
    const map = new Map(rows.map((row) => [row.key, row.value]));
    const read = (key: string) => {
      const value = map.get(key);
      return typeof value === "string" && value.trim() ? value.trim() : null;
    };
    return {
      phone: read("contactPhone") ?? defaultSettings.phone,
      email: read("contactEmail") ?? defaultSettings.email,
      address: read("contactAddress") ?? defaultSettings.address,
      icp: read("icp"),
      analyticsId: read("analyticsId"),
      heroVideoUrl: read("heroVideoUrl"),
      heroPosterUrl: read("heroPosterUrl"),
    };
  }, defaultSettings);
});

/* --------------------------------- 合作伙伴 -------------------------------- */

export async function listPartners(): Promise<{ name: string; nameZh: string }[]> {
  return fromDb(async (db) => {
    const rows = await db.partner.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
    if (!rows.length) return defaultPartners;
    return rows.map((r) => ({ name: r.name, nameZh: r.nameZh ?? "" }));
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
