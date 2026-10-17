/**
 * 数据初始化 / Database seed
 *
 *   pnpm db:deploy && pnpm db:seed
 *
 * 内容来源为 src/content/defaults.ts —— 与站点在无数据库时使用的兜底内容完全一致，
 * 因此初始化后的数据库与站点默认展示不会出现差异。
 *
 * 默认只写入空表：某张表已有数据（例如已在后台编辑过）时整张表跳过，不会覆盖。
 * 需要用 defaults.ts 覆盖同 slug 的记录时，显式执行：pnpm db:seed --force
 *
 * By default each table is seeded only while it is empty, so re-running the seed
 * never clobbers content edited in the admin. Pass --force to overwrite the
 * seeded rows (matched by slug) with the bundled defaults.
 */
import path from "node:path";
import { getPrisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import {
  articles,
  cases,
  downloads,
  galleryItems,
  partners,
  services,
} from "../src/content/defaults";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // .env is optional — CI and containers provide real environment variables.
}

/** Stable, human-readable slugs for the seeded categories. */
const CATEGORY_SLUGS: Record<string, string> = {
  公司新闻: "company-news",
  技术分享: "technical-notes",
};

const FORCE = process.argv.includes("--force");

/** Seed one table only while it is empty, unless --force asks to overwrite. */
async function seedTable(label: string, count: () => Promise<number>, run: () => Promise<void>) {
  const existing = await count();
  if (existing > 0 && !FORCE) {
    console.log(`→ Skipping ${label}: already has ${existing} row(s) (use --force to overwrite)`);
    return;
  }
  console.log(`→ Seeding ${label}…`);
  await run();
}

async function main() {
  const db = getPrisma();
  if (!db) {
    console.error(
      "\n✗ DATABASE_URL is not set. Copy .env.example to .env, start PostgreSQL\n" +
        "  (docker compose up -d db), then run: pnpm db:deploy && pnpm db:seed\n"
    );
    process.exit(1);
  }

  console.log("→ Seeding categories…");
  const articleCategories = [...new Set(articles.map((a) => a.category))];
  const categoryIds = new Map<string, string>();

  for (const [index, name] of articleCategories.entries()) {
    const slug = CATEGORY_SLUGS[name] ?? `category-${index + 1}`;
    const row = await db.category.upsert({
      where: { kind_slug: { kind: "ARTICLE", slug } },
      create: { kind: "ARTICLE", slug, name, sortOrder: index },
      update: FORCE ? { name, sortOrder: index } : {},
    });
    categoryIds.set(name, row.id);
  }

  const downloadCategory = await db.category.upsert({
    where: { kind_slug: { kind: "DOWNLOAD", slug: "brochures" } },
    create: { kind: "DOWNLOAD", slug: "brochures", name: "宣传资料" },
    update: {},
  });

  await seedTable("services", () => db.service.count(), async () => {
    for (const [index, service] of services.entries()) {
      const data = {
        title: service.title,
        summary: service.summary,
        content: service.content,
        icon: service.icon,
        coverUrl: `/media/service-${service.slug}.svg`,
        features: service.features,
        deliverables: service.deliverables,
        faq: service.faq,
        published: true,
        sortOrder: index,
      };
      await db.service.upsert({ where: { slug: service.slug }, create: { slug: service.slug, ...data }, update: data });
    }
  });

  await seedTable("projects", () => db.project.count(), async () => {
    for (const [index, item] of cases.entries()) {
      const data = {
        title: item.title,
        client: item.client,
        industry: item.industry,
        summary: item.summary,
        content: item.content,
        coverUrl: `/media/case-${item.slug}.svg`,
        gallery: [] as string[],
        tags: item.tags,
        scope: item.scope,
        metrics: item.metrics,
        year: item.year,
        location: item.location,
        status: "PUBLISHED" as const,
        featured: item.featured,
        sortOrder: index,
      };
      await db.project.upsert({ where: { slug: item.slug }, create: { slug: item.slug, ...data }, update: data });
    }
  });

  await seedTable("articles", () => db.article.count(), async () => {
    for (const [index, article] of articles.entries()) {
      const data = {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverUrl: `/media/article-${article.slug}.svg`,
        tags: article.tags,
        status: "PUBLISHED" as const,
        featured: article.featured,
        pinned: index === 0,
        readMinutes: article.readMinutes,
        publishedAt: new Date(article.publishedAt),
        categoryId: categoryIds.get(article.category) ?? null,
      };
      await db.article.upsert({ where: { slug: article.slug }, create: { slug: article.slug, ...data }, update: data });
    }
  });

  await seedTable("downloads", () => db.downloadFile.count(), async () => {
    for (const item of downloads) {
      const data = {
        title: item.title,
        description: item.description,
        fileUrl: "", // no file yet → the download route serves a placeholder PDF
        fileType: item.fileType,
        fileSize: item.fileSize,
        version: item.version,
        status: "PUBLISHED" as const,
        sortOrder: item.sortOrder,
        categoryId: downloadCategory.id,
      };
      await db.downloadFile.upsert({ where: { slug: item.slug }, create: { slug: item.slug, ...data }, update: data });
    }
  });

  await seedTable("gallery", () => db.galleryItem.count(), async () => {
    for (const [index, item] of galleryItems.entries()) {
      const url = `/media/gallery-${String(index + 1).padStart(2, "0")}.svg`;
      const existing = await db.galleryItem.findFirst({ where: { url } });
      const data = {
        title: item.title,
        caption: item.caption,
        url,
        mediaKind: item.mediaKind,
        album: item.album,
        status: "PUBLISHED" as const,
        sortOrder: index,
      };
      if (existing) await db.galleryItem.update({ where: { id: existing.id }, data });
      else await db.galleryItem.create({ data });
    }
  });

  await seedTable("partners", () => db.partner.count(), async () => {
    for (const [index, partner] of partners.entries()) {
      const existing = await db.partner.findFirst({ where: { name: partner.name } });
      const data = { name: partner.name, sortOrder: index, active: true };
      if (existing) await db.partner.update({ where: { id: existing.id }, data });
      else await db.partner.create({ data });
    }
  });

  console.log("→ Seeding site settings…");
  const settings: Record<string, string> = {
    contactPhone: "138-0000-0000",
    contactEmail: "info@starlink-auto.com",
    contactAddress: "深圳市光明区凤凰街道甲子塘社区力缆科技大楼九层E区",
    icp: "粤ICP备00000000号",
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.upsert({ where: { key }, create: { key, value }, update: {} });
  }

  console.log("→ Ensuring an administrator exists…");
  const email = (process.env.ADMIN_EMAIL || "admin@starlink-auto.com").toLowerCase();
  const existingAdmin = await db.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log(`  · administrator already exists: ${email}`);
  } else {
    const password = process.env.ADMIN_PASSWORD || "Starlink@2026";
    await db.user.create({
      data: {
        email,
        name: process.env.ADMIN_NAME || "系统管理员",
        passwordHash: await hashPassword(password),
        role: "ADMIN",
      },
    });
    console.log(`  · created administrator ${email} with password "${password}" — change it after first login`);
  }

  console.log("\n✓ Seed complete. 后台地址：http://localhost:3000/admin\n");
}

main()
  .catch((error) => {
    console.error("\n✗ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    // Prisma 7 keeps a connection pool through the adapter; exit explicitly.
    process.exit(0);
  });
