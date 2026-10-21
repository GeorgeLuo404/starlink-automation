"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearSessionCookie, getSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { getPrisma, requireDb } from "@/lib/prisma";
import { deleteObject } from "@/lib/storage";
import { isBilibiliShortLink, resolveBilibiliShortLink } from "@/lib/bilibili";
import { slugify } from "@/lib/utils";
import {
  articleSchema,
  articleStatusSchema,
  caseSchema,
  downloadSchema,
  formObject,
  gallerySchema,
  idSchema,
  inquiryUpdateSchema,
  type MediaInput,
  partnerActiveSchema,
  partnerOrderSchema,
  partnerSchema,
  serviceSchema,
  settingsSchema,
} from "@/lib/admin-schemas";

/* ====================================================================== */
/* Helpers                                                                */
/* ====================================================================== */

/**
 * Result of a form action. Success usually ends in a redirect, so the state a
 * form sees is the initial `{ ok: true }` or a failure; actions behind a
 * dialog (savePartner) return `{ ok: true }` instead, and <ActionForm
 * onSuccess> closes the dialog.
 */
export type ActionState = { ok: boolean; message?: string; fieldErrors?: Record<string, string[]> };

async function guard() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Revalidate the whole public site after an edit. */
function bust() {
  revalidatePath("/", "layout");
}

function invalid(error: z.ZodError): ActionState {
  return {
    ok: false,
    message: error.issues[0]?.message ?? "表单内容无效，请检查后重试",
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
  };
}

const NO_DATABASE: ActionState = { ok: false, message: "数据库未连接，请先启动 PostgreSQL 并执行 pnpm db:deploy" };

/** Run a database write and turn known Prisma failures into readable messages. */
async function persist(work: () => Promise<unknown>): Promise<ActionState | null> {
  try {
    await work();
    return null;
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    if (code === "P2002") {
      return {
        ok: false,
        message: "该 Slug 已被其他记录使用，请换一个",
        fieldErrors: { slug: ["该 Slug 已被使用"] },
      };
    }
    if (code === "P2025") return { ok: false, message: "记录不存在，可能已被删除" };
    console.error("[admin] database write failed:", error);
    return { ok: false, message: "保存失败：数据库暂时不可用，请稍后重试" };
  }
}

/**
 * Turn the validated media list into rows for the nested write, in display
 * order. b23.tv short links are followed here — the browser cannot.
 */
async function mediaRows(media: MediaInput[]): Promise<{ rows: (MediaInput & { sortOrder: number })[] } | { failure: ActionState }> {
  const rows = [];
  for (const [index, item] of media.entries()) {
    let url = item.url;
    if (item.kind === "VIDEO" && isBilibiliShortLink(url)) {
      const resolved = await resolveBilibiliShortLink(url);
      if (!resolved) {
        const message = `第 ${index + 1} 项：无法打开这个 B站 短链接，请粘贴视频页的完整链接`;
        return { failure: { ok: false, message, fieldErrors: { media: [message] } } };
      }
      url = resolved;
    }
    rows.push({ ...item, url, sortOrder: index });
  }
  return { rows };
}

/** Zod parse + DB availability check shared by every form action. */
async function prepare<T extends z.ZodType>(schema: T, form: FormData) {
  await guard();
  const parsed = schema.safeParse(formObject(form));
  if (!parsed.success) return { ok: false, failure: invalid(parsed.error) } as const;
  const db = getPrisma();
  if (!db) return { ok: false, failure: NO_DATABASE } as const;
  return { ok: true, data: parsed.data as z.infer<T>, db } as const;
}

/* ====================================================================== */
/* Auth                                                                   */
/* ====================================================================== */

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

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
      error: "数据库未连接，请先启动 PostgreSQL 并执行 pnpm db:deploy 与 pnpm db:seed",
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

export async function saveArticle(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(articleSchema, form);
  if (!ready.ok) return ready.failure;
  const { db, data: input } = ready;
  const { id, media, ...fields } = input;
  const prepared = await mediaRows(media);
  if ("failure" in prepared) return prepared.failure;

  const data = {
    ...fields,
    slug: input.slug || slugify(input.title),
    publishedAt: input.publishedAt ?? (input.status === "PUBLISHED" ? new Date() : null),
  };

  // Nested writes run in one transaction: the old list is replaced as a whole.
  const failure = await persist(() =>
    id
      ? db.article.update({ where: { id }, data: { ...data, media: { deleteMany: {}, create: prepared.rows } } })
      : db.article.create({ data: { ...data, media: { create: prepared.rows } } })
  );
  if (failure) return failure;

  bust();
  redirect("/admin/articles");
}

export async function deleteArticle(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(idSchema, form);
  if (!ready.ok) return ready.failure;
  const failure = await persist(() => ready.db.article.delete({ where: { id: ready.data.id } }));
  if (failure) return failure;
  bust();
  redirect("/admin/articles");
}

export async function setArticleStatus(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(articleStatusSchema, form);
  if (!ready.ok) return ready.failure;
  const { db, data } = ready;

  const failure = await persist(async () => {
    const current = await db.article.findUniqueOrThrow({ where: { id: data.id }, select: { publishedAt: true } });
    await db.article.update({
      where: { id: data.id },
      // Keep the original publish date when an article is taken down and re-published.
      data: {
        status: data.status,
        publishedAt: data.status === "PUBLISHED" && !current.publishedAt ? new Date() : undefined,
      },
    });
  });
  if (failure) return failure;

  bust();
  redirect("/admin/articles");
}

/* ====================================================================== */
/* Projects / 案例                                                        */
/* ====================================================================== */

export async function saveCase(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(caseSchema, form);
  if (!ready.ok) return ready.failure;
  const { db, data: input } = ready;
  const { id, media, ...fields } = input;
  const prepared = await mediaRows(media);
  if ("failure" in prepared) return prepared.failure;

  const data = {
    ...fields,
    slug: input.slug || slugify(input.title),
    metrics: input.metrics.map(([value, label]) => ({ value, label })),
  };

  // Nested writes run in one transaction: the old list is replaced as a whole.
  const failure = await persist(() =>
    id
      ? db.project.update({ where: { id }, data: { ...data, media: { deleteMany: {}, create: prepared.rows } } })
      : db.project.create({ data: { ...data, media: { create: prepared.rows } } })
  );
  if (failure) return failure;

  bust();
  redirect("/admin/cases");
}

export async function deleteCase(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(idSchema, form);
  if (!ready.ok) return ready.failure;
  const failure = await persist(() => ready.db.project.delete({ where: { id: ready.data.id } }));
  if (failure) return failure;
  bust();
  redirect("/admin/cases");
}

/* ====================================================================== */
/* Services / 业务能力                                                    */
/* ====================================================================== */

export async function saveService(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(serviceSchema, form);
  if (!ready.ok) return ready.failure;
  const { db, data: input } = ready;
  const { id, media, ...fields } = input;
  const prepared = await mediaRows(media);
  if ("failure" in prepared) return prepared.failure;

  const data = {
    ...fields,
    slug: input.slug || slugify(input.title),
    faq: input.faq.map(([q, a]) => ({ q, a })),
  };

  // Nested writes run in one transaction: the old list is replaced as a whole.
  const failure = await persist(() =>
    id
      ? db.service.update({ where: { id }, data: { ...data, media: { deleteMany: {}, create: prepared.rows } } })
      : db.service.create({ data: { ...data, media: { create: prepared.rows } } })
  );
  if (failure) return failure;

  bust();
  redirect("/admin/services");
}

export async function deleteService(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(idSchema, form);
  if (!ready.ok) return ready.failure;
  const failure = await persist(() => ready.db.service.delete({ where: { id: ready.data.id } }));
  if (failure) return failure;
  bust();
  redirect("/admin/services");
}

/* ====================================================================== */
/* Downloads / 资料                                                       */
/* ====================================================================== */

export async function saveDownload(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(downloadSchema, form);
  if (!ready.ok) return ready.failure;
  const { db, data: input } = ready;
  const { id, ...fields } = input;

  const data = {
    ...fields,
    slug: input.slug || slugify(input.title),
    // Empty means "no file yet": the download route then serves a placeholder PDF.
    fileUrl: input.fileUrl ?? "",
  };

  const failure = await persist(() =>
    id ? db.downloadFile.update({ where: { id }, data }) : db.downloadFile.create({ data })
  );
  if (failure) return failure;

  bust();
  redirect("/admin/downloads");
}

export async function deleteDownload(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(idSchema, form);
  if (!ready.ok) return ready.failure;
  const failure = await persist(() => ready.db.downloadFile.delete({ where: { id: ready.data.id } }));
  if (failure) return failure;
  bust();
  redirect("/admin/downloads");
}

/* ====================================================================== */
/* Gallery / 图库                                                         */
/* ====================================================================== */

export async function saveGalleryItem(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(gallerySchema, form);
  if (!ready.ok) return ready.failure;
  const { db, data: input } = ready;
  const { id, ...data } = input;

  const failure = await persist(() =>
    id ? db.galleryItem.update({ where: { id }, data }) : db.galleryItem.create({ data })
  );
  if (failure) return failure;

  bust();
  redirect("/admin/gallery");
}

export async function deleteGalleryItem(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(idSchema, form);
  if (!ready.ok) return ready.failure;
  const failure = await persist(() => ready.db.galleryItem.delete({ where: { id: ready.data.id } }));
  if (failure) return failure;
  bust();
  redirect("/admin/gallery");
}

/* ====================================================================== */
/* Media library / 媒体库                                                 */
/* ====================================================================== */

export async function deleteMediaAsset(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(idSchema, form);
  if (!ready.ok) return ready.failure;
  const { db, data } = ready;

  // The storage key always comes from the database record, never from the form,
  // so a crafted request cannot delete arbitrary files.
  const failure = await persist(async () => {
    const asset = await db.mediaAsset.delete({ where: { id: data.id } });
    await deleteObject(asset.storageKey);
  });
  if (failure) return failure;

  bust();
  redirect("/admin/media");
}

/* ====================================================================== */
/* Inquiries / 询盘                                                       */
/* ====================================================================== */

export async function updateInquiry(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(inquiryUpdateSchema, form);
  if (!ready.ok) return ready.failure;
  const { db, data } = ready;
  const failure = await persist(() =>
    db.inquiry.update({ where: { id: data.id }, data: { status: data.status, note: data.note } })
  );
  if (failure) return failure;
  redirect("/admin/inquiries");
}

export async function deleteInquiry(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(idSchema, form);
  if (!ready.ok) return ready.failure;
  const failure = await persist(() => ready.db.inquiry.delete({ where: { id: ready.data.id } }));
  if (failure) return failure;
  redirect("/admin/inquiries");
}

/* ====================================================================== */
/* Supported brands / 品牌平台 (Partner table)                            */
/* ====================================================================== */

/**
 * Add or edit a brand from the admin dialog. Returns instead of redirecting,
 * so the dialog can close itself; the list refreshes through revalidation.
 * New brands go to the end of the list.
 */
export async function savePartner(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(partnerSchema, form);
  if (!ready.ok) return ready.failure;
  const { db, data: input } = ready;
  const { id, ...data } = input;

  const failure = await persist(async () => {
    if (id) return db.partner.update({ where: { id }, data });
    const last = await db.partner.aggregate({ _max: { sortOrder: true } });
    return db.partner.create({ data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 } });
  });
  if (failure) return failure;

  bust();
  return { ok: true, message: id ? "已保存" : "已添加" };
}

/** Persist the order after a drag: `ids` is the whole list, top to bottom. */
export async function reorderPartners(ids: string[]): Promise<ActionState> {
  await guard();
  const parsed = partnerOrderSchema.safeParse(ids);
  if (!parsed.success) return invalid(parsed.error);
  const db = getPrisma();
  if (!db) return NO_DATABASE;

  const failure = await persist(() =>
    db.$transaction(parsed.data.map((id, sortOrder) => db.partner.update({ where: { id }, data: { sortOrder } })))
  );
  if (failure) return failure;
  bust();
  return { ok: true };
}

/** Show or hide a brand on the homepage without deleting it. */
export async function setPartnerActive(id: string, active: boolean): Promise<ActionState> {
  await guard();
  const parsed = partnerActiveSchema.safeParse({ id, active });
  if (!parsed.success) return invalid(parsed.error);
  const db = getPrisma();
  if (!db) return NO_DATABASE;

  const failure = await persist(() => db.partner.update({ where: { id }, data: { active: parsed.data.active } }));
  if (failure) return failure;
  bust();
  return { ok: true };
}

export async function deletePartner(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(idSchema, form);
  if (!ready.ok) return ready.failure;
  const failure = await persist(() => ready.db.partner.delete({ where: { id: ready.data.id } }));
  if (failure) return failure;
  bust();
  redirect("/admin/partners");
}

/* ====================================================================== */
/* Site settings / 站点设置                                               */
/* ====================================================================== */

export async function saveSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ready = await prepare(settingsSchema, form);
  if (!ready.ok) return ready.failure;
  const { db, data } = ready;

  const failure = await persist(() =>
    db.$transaction(
      Object.entries(data).map(([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          // SiteSetting.value is a non-nullable Json column, so "unset" is stored as "".
          create: { key, value: value ?? "" },
          update: { value: value ?? "" },
        })
      )
    )
  );
  if (failure) return failure;

  bust();
  redirect("/admin/settings?saved=1");
}
