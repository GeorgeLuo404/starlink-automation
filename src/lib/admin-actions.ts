"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, getSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { requireDb } from "@/lib/prisma";
import { deleteObject } from "@/lib/storage";
import { slugify } from "@/lib/utils";

/* ====================================================================== */
/* Helpers                                                                */
/* ====================================================================== */

export type ActionState = { ok: boolean; message?: string };

async function guard() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Revalidate the whole public site after an edit. */
function bust() {
  revalidatePath("/", "layout");
}

function str(form: FormData, key: string, fallback = "") {
  const value = form.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optional(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function bool(form: FormData, key: string) {
  const value = form.get(key);
  return value === "on" || value === "true" || value === "1";
}

function num(form: FormData, key: string, fallback = 0) {
  const parsed = Number(form.get(key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function list(form: FormData, key: string) {
  return str(form, key)
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/* ====================================================================== */
/* Auth                                                                   */
/* ====================================================================== */

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");

  if (!email || !password) return { error: "invalid" };

  let user: { id: string; email: string; name: string; role: "ADMIN" | "EDITOR"; passwordHash: string } | null = null;
  try {
    const db = requireDb();
    user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, passwordHash: true },
    });
  } catch (error) {
    console.error("[login] database unavailable:", error);
    return {
      error: "数据库未连接，请先配置 DATABASE_URL 并执行 pnpm db:push 与 pnpm db:seed / Database unavailable.",
    };
  }

  if (!user) return { error: "invalid" };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "invalid" };

  await setSessionCookie({ sub: user.id, email: user.email, name: user.name, role: user.role });

  try {
    requireDb().user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {});
  } catch {
    /* non-fatal */
  }

  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

/* ====================================================================== */
/* Articles / 新闻                                                        */
/* ====================================================================== */

export async function saveArticle(form: FormData) {
  await guard();
  const db = requireDb();

  const id = optional(form, "id");
  const titleZh = str(form, "titleZh");
  const slug = str(form, "slug") || slugify(titleZh);

  const status = str(form, "status", "DRAFT") as "DRAFT" | "PUBLISHED" | "ARCHIVED";
  const publishedAtRaw = optional(form, "publishedAt");

  const data = {
    slug,
    titleZh,
    titleEn: optional(form, "titleEn"),
    excerptZh: optional(form, "excerptZh"),
    excerptEn: optional(form, "excerptEn"),
    contentZh: str(form, "contentZh", " "),
    contentEn: optional(form, "contentEn"),
    coverUrl: optional(form, "coverUrl"),
    tags: list(form, "tags"),
    status,
    featured: bool(form, "featured"),
    pinned: bool(form, "pinned"),
    readMinutes: num(form, "readMinutes", 3),
    seoTitle: optional(form, "seoTitle"),
    seoDesc: optional(form, "seoDesc"),
    publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : status === "PUBLISHED" ? new Date() : null,
  };

  if (id) {
    await db.article.update({ where: { id }, data });
  } else {
    await db.article.create({ data });
  }

  bust();
  redirect("/admin/articles");
}

export async function deleteArticle(form: FormData) {
  await guard();
  const id = str(form, "id");
  if (id) {
    await requireDb().article.delete({ where: { id } });
    bust();
  }
  redirect("/admin/articles");
}

export async function setArticleStatus(form: FormData) {
  await guard();
  const id = str(form, "id");
  const status = str(form, "status", "DRAFT") as "DRAFT" | "PUBLISHED" | "ARCHIVED";
  if (id) {
    await requireDb().article.update({
      where: { id },
      data: { status, publishedAt: status === "PUBLISHED" ? new Date() : undefined },
    });
    bust();
  }
  redirect("/admin/articles");
}

/* ====================================================================== */
/* Projects / 案例                                                        */
/* ====================================================================== */

export async function saveCase(form: FormData) {
  await guard();
  const db = requireDb();

  const id = optional(form, "id");
  const titleZh = str(form, "titleZh");
  const slug = str(form, "slug") || slugify(titleZh);

  const metrics = list(form, "metrics")
    .map((entry) => {
      const [value, zh, en] = entry.split("|").map((part) => part?.trim() ?? "");
      return value ? { value, label: { zh: zh || value, en: en || zh || value } } : null;
    })
    .filter(Boolean) as { value: string; label: { zh: string; en: string } }[];

  const data = {
    slug,
    titleZh,
    titleEn: optional(form, "titleEn"),
    clientZh: optional(form, "clientZh"),
    clientEn: optional(form, "clientEn"),
    industryZh: optional(form, "industryZh"),
    industryEn: optional(form, "industryEn"),
    summaryZh: optional(form, "summaryZh"),
    summaryEn: optional(form, "summaryEn"),
    contentZh: optional(form, "contentZh"),
    contentEn: optional(form, "contentEn"),
    coverUrl: optional(form, "coverUrl"),
    gallery: list(form, "gallery"),
    videoUrl: optional(form, "videoUrl"),
    tags: list(form, "tags"),
    scope: str(form, "scope")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [zh, en] = line.split("|").map((part) => part?.trim() ?? "");
        return `${zh ?? ""}||${en || zh || ""}`;
      }),
    metrics,
    year: num(form, "year", new Date().getFullYear()),
    location: optional(form, "location"),
    status: str(form, "status", "DRAFT") as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    featured: bool(form, "featured"),
    sortOrder: num(form, "sortOrder", 0),
  };

  if (id) await db.project.update({ where: { id }, data });
  else await db.project.create({ data });

  bust();
  redirect("/admin/cases");
}

export async function deleteCase(form: FormData) {
  await guard();
  const id = str(form, "id");
  if (id) {
    await requireDb().project.delete({ where: { id } });
    bust();
  }
  redirect("/admin/cases");
}

/* ====================================================================== */
/* Services / 业务能力                                                    */
/* ====================================================================== */

export async function saveService(form: FormData) {
  await guard();
  const db = requireDb();

  const id = optional(form, "id");
  const titleZh = str(form, "titleZh");
  const slug = str(form, "slug") || slugify(titleZh);

  const features = list(form, "features").map((entry) => {
    const [zh, en] = entry.split("|").map((part) => part?.trim() ?? "");
    return { zh: zh ?? "", en: en || zh || "" };
  });

  const pairLines = (key: string) =>
    str(form, key)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [zh, en] = line.split("|").map((part) => part?.trim() ?? "");
        return { zh: zh ?? "", en: en || zh || "" };
      });

  const faq = str(form, "faq")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [qZh, qEn, aZh, aEn] = line.split("|").map((part) => part?.trim() ?? "");
      return { q: { zh: qZh ?? "", en: qEn || qZh || "" }, a: { zh: aZh ?? "", en: aEn || aZh || "" } };
    })
    .filter((entry) => entry.q.zh && entry.a.zh);

  const data = {
    slug,
    titleZh,
    titleEn: optional(form, "titleEn"),
    summaryZh: optional(form, "summaryZh"),
    summaryEn: optional(form, "summaryEn"),
    contentZh: optional(form, "contentZh"),
    contentEn: optional(form, "contentEn"),
    icon: str(form, "icon", "Cpu"),
    coverUrl: optional(form, "coverUrl"),
    videoUrl: optional(form, "videoUrl"),
    features,
    deliverables: pairLines("deliverables"),
    faq,
    published: bool(form, "published"),
    sortOrder: num(form, "sortOrder", 0),
  };

  if (id) await db.service.update({ where: { id }, data });
  else await db.service.create({ data });

  bust();
  redirect("/admin/services");
}

export async function deleteService(form: FormData) {
  await guard();
  const id = str(form, "id");
  if (id) {
    await requireDb().service.delete({ where: { id } });
    bust();
  }
  redirect("/admin/services");
}

/* ====================================================================== */
/* Downloads / 资料                                                       */
/* ====================================================================== */

export async function saveDownload(form: FormData) {
  await guard();
  const db = requireDb();

  const id = optional(form, "id");
  const titleZh = str(form, "titleZh");
  const slug = str(form, "slug") || slugify(titleZh);

  const data = {
    slug,
    titleZh,
    titleEn: optional(form, "titleEn"),
    descriptionZh: optional(form, "descriptionZh"),
    descriptionEn: optional(form, "descriptionEn"),
    fileUrl: str(form, "fileUrl", "#"),
    storageKey: optional(form, "storageKey"),
    fileType: str(form, "fileType", "PDF").toUpperCase(),
    fileSize: num(form, "fileSize", 0),
    version: optional(form, "version"),
    requiresForm: bool(form, "requiresForm"),
    status: str(form, "status", "PUBLISHED") as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    sortOrder: num(form, "sortOrder", 0),
  };

  if (id) await db.downloadFile.update({ where: { id }, data });
  else await db.downloadFile.create({ data });

  bust();
  redirect("/admin/downloads");
}

export async function deleteDownload(form: FormData) {
  await guard();
  const id = str(form, "id");
  if (id) {
    await requireDb().downloadFile.delete({ where: { id } });
    bust();
  }
  redirect("/admin/downloads");
}

/* ====================================================================== */
/* Gallery / 图库                                                         */
/* ====================================================================== */

export async function saveGalleryItem(form: FormData) {
  await guard();
  const db = requireDb();

  const id = optional(form, "id");
  const url = str(form, "url");
  const kind = str(form, "mediaKind", "IMAGE") as "IMAGE" | "VIDEO" | "DOCUMENT";

  const data = {
    titleZh: str(form, "titleZh"),
    titleEn: optional(form, "titleEn"),
    captionZh: optional(form, "captionZh"),
    captionEn: optional(form, "captionEn"),
    url,
    thumbUrl: optional(form, "thumbUrl"),
    mediaKind: kind,
    videoUrl: optional(form, "videoUrl"),
    album: str(form, "album", "general"),
    status: str(form, "status", "PUBLISHED") as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    sortOrder: num(form, "sortOrder", 0),
  };

  if (id) await db.galleryItem.update({ where: { id }, data });
  else await db.galleryItem.create({ data });

  bust();
  redirect("/admin/gallery");
}

export async function deleteGalleryItem(form: FormData) {
  await guard();
  const id = str(form, "id");
  if (id) {
    await requireDb().galleryItem.delete({ where: { id } });
    bust();
  }
  redirect("/admin/gallery");
}

/* ====================================================================== */
/* Media library / 媒体库                                                 */
/* ====================================================================== */

export async function deleteMediaAsset(form: FormData) {
  await guard();
  const id = str(form, "id");
  const storageKey = optional(form, "storageKey");
  const redirectTo = str(form, "redirectTo", "/admin/media");

  const db = requireDb();
  const asset = id ? await db.mediaAsset.findUnique({ where: { id } }) : null;

  if (asset) {
    await db.mediaAsset.delete({ where: { id: asset.id } });
    await deleteObject(asset.storageKey);
  } else if (storageKey) {
    await deleteObject(storageKey);
  }

  bust();
  redirect(redirectTo);
}

export async function updateMediaMeta(form: FormData) {
  await guard();
  const id = str(form, "id");
  if (!id) redirect("/admin/media");
  await requireDb().mediaAsset.update({
    where: { id },
    data: { alt: optional(form, "alt"), folder: str(form, "folder", "general") },
  });
  redirect("/admin/media");
}

/* ====================================================================== */
/* Inquiries / 询盘                                                       */
/* ====================================================================== */

export async function updateInquiry(form: FormData) {
  await guard();
  const id = str(form, "id");
  if (!id) redirect("/admin/inquiries");
  await requireDb().inquiry.update({
    where: { id },
    data: {
      status: str(form, "status", "NEW") as "NEW" | "IN_PROGRESS" | "DONE" | "SPAM",
      note: optional(form, "note"),
    },
  });
  redirect("/admin/inquiries");
}

export async function deleteInquiry(form: FormData) {
  await guard();
  const id = str(form, "id");
  if (id) await requireDb().inquiry.delete({ where: { id } });
  redirect("/admin/inquiries");
}

/* ====================================================================== */
/* Partners / 合作伙伴                                                    */
/* ====================================================================== */

export async function savePartner(form: FormData) {
  await guard();
  const db = requireDb();
  const id = optional(form, "id");
  const data = {
    name: str(form, "name"),
    logoUrl: optional(form, "logoUrl"),
    url: optional(form, "url"),
    active: bool(form, "active"),
    sortOrder: num(form, "sortOrder", 0),
  };
  if (id) await db.partner.update({ where: { id }, data });
  else await db.partner.create({ data });
  bust();
  redirect("/admin/partners");
}

export async function deletePartner(form: FormData) {
  await guard();
  const id = str(form, "id");
  if (id) {
    await requireDb().partner.delete({ where: { id } });
    bust();
  }
  redirect("/admin/partners");
}

/* ====================================================================== */
/* Site settings / 站点设置                                               */
/* ====================================================================== */

export async function saveSettings(form: FormData) {
  await guard();
  const db = requireDb();

  const entries: Record<string, unknown> = {
    heroVideoUrl: optional(form, "heroVideoUrl"),
    heroPosterUrl: optional(form, "heroPosterUrl"),
    contactPhone: str(form, "contactPhone"),
    contactEmail: str(form, "contactEmail"),
    contactAddressZh: str(form, "contactAddressZh"),
    contactAddressEn: str(form, "contactAddressEn"),
    icp: str(form, "icp"),
    analyticsId: optional(form, "analyticsId"),
  };

  await Promise.all(
    Object.entries(entries).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        create: { key, value: value as never },
        update: { value: value as never },
      })
    )
  );

  bust();
  redirect("/admin/settings?saved=1");
}
