/**
 * 数据初始化 / Database seed
 *
 *   pnpm db:push && pnpm db:seed
 *
 * 内容来源为 src/content/defaults.ts —— 与站点在无数据库时使用的兜底内容完全一致，
 * 因此初始化后的数据库与站点默认展示不会出现差异。
 *
 * The seed is idempotent: running it repeatedly updates the same rows instead of
 * creating duplicates.
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

function pair(value: { zh: string; en: string }) {
  return { zh: value.zh, en: value.en || value.zh };
}

/** Projects store their scope as "zh||en" strings so both languages survive. */
function scopeLine(value: { zh: string; en: string }) {
  return `${value.zh}||${value.en || value.zh}`;
}

async function main() {
  const db = getPrisma();
  if (!db) {
    console.error(
      "\n✗ DATABASE_URL is not set. Copy .env.example to .env, start PostgreSQL\n" +
        "  (docker compose up -d db), then run: pnpm db:push && pnpm db:seed\n"
    );
    process.exit(1);
  }

  console.log("→ Seeding categories…");
  const articleCategories = [...new Set(articles.map((a) => a.category.zh))];
  const categoryIds = new Map<string, string>();

  for (const [index, nameZh] of articleCategories.entries()) {
    const source = articles.find((a) => a.category.zh === nameZh)!;
    const slug = CATEGORY_SLUGS[nameZh] ?? `category-${index + 1}`;
    const row = await db.category.upsert({
      where: { kind_slug: { kind: "ARTICLE", slug } },
      create: { kind: "ARTICLE", slug, nameZh, nameEn: source.category.en, sortOrder: index },
      update: { nameZh, nameEn: source.category.en, sortOrder: index },
    });
    categoryIds.set(nameZh, row.id);
  }

  const downloadCategory = await db.category.upsert({
    where: { kind_slug: { kind: "DOWNLOAD", slug: "brochures" } },
    create: { kind: "DOWNLOAD", slug: "brochures", nameZh: "宣传资料", nameEn: "Brochures & datasheets" },
    update: {},
  });

  console.log("→ Seeding services…");
  for (const [index, service] of services.entries()) {
    const data = {
      titleZh: service.title.zh,
      titleEn: service.title.en,
      summaryZh: service.summary.zh,
      summaryEn: service.summary.en,
      contentZh: service.content.zh,
      contentEn: service.content.en,
      icon: service.icon,
      coverUrl: `/media/service-${service.slug}.svg`,
      features: service.features.map(pair),
      deliverables: service.deliverables.map(pair),
      faq: service.faq.map((entry) => ({ q: pair(entry.q), a: pair(entry.a) })),
      published: true,
      sortOrder: index,
    };
    await db.service.upsert({ where: { slug: service.slug }, create: { slug: service.slug, ...data }, update: data });
  }

  console.log("→ Seeding projects…");
  for (const [index, item] of cases.entries()) {
    const data = {
      titleZh: item.title.zh,
      titleEn: item.title.en,
      clientZh: item.client.zh,
      clientEn: item.client.en,
      industryZh: item.industry.zh,
      industryEn: item.industry.en,
      summaryZh: item.summary.zh,
      summaryEn: item.summary.en,
      contentZh: item.content.zh,
      contentEn: item.content.en,
      coverUrl: `/media/case-${item.slug}.svg`,
      gallery: [] as string[],
      tags: item.tags,
      scope: item.scope.map(scopeLine),
      metrics: item.metrics.map((metric) => ({ value: metric.value, label: pair(metric.label) })),
      year: item.year,
      location: item.location,
      status: "PUBLISHED" as const,
      featured: item.featured,
      sortOrder: index,
    };
    await db.project.upsert({ where: { slug: item.slug }, create: { slug: item.slug, ...data }, update: data });
  }

  console.log("→ Seeding articles…");
  for (const [index, article] of articles.entries()) {
    const data = {
      titleZh: article.title.zh,
      titleEn: article.title.en,
      excerptZh: article.excerpt.zh,
      excerptEn: article.excerpt.en,
      contentZh: article.content.zh,
      contentEn: article.content.en,
      coverUrl: `/media/article-${article.slug}.svg`,
      tags: article.tags,
      status: "PUBLISHED" as const,
      featured: article.featured,
      pinned: index === 0,
      readMinutes: article.readMinutes,
      publishedAt: new Date(article.publishedAt),
      categoryId: categoryIds.get(article.category.zh) ?? null,
    };
    await db.article.upsert({ where: { slug: article.slug }, create: { slug: article.slug, ...data }, update: data });
  }

  console.log("→ Seeding downloads…");
  for (const item of downloads) {
    const data = {
      titleZh: item.title.zh,
      titleEn: item.title.en,
      descriptionZh: item.description.zh,
      descriptionEn: item.description.en,
      fileUrl: "#",
      fileType: item.fileType,
      fileSize: item.fileSize,
      version: item.version,
      status: "PUBLISHED" as const,
      sortOrder: item.sortOrder,
      categoryId: downloadCategory.id,
    };
    await db.downloadFile.upsert({ where: { slug: item.slug }, create: { slug: item.slug, ...data }, update: data });
  }

  console.log("→ Seeding gallery…");
  for (const [index, item] of galleryItems.entries()) {
    const url = `/media/gallery-${String(index + 1).padStart(2, "0")}.svg`;
    const existing = await db.galleryItem.findFirst({ where: { url } });
    const data = {
      titleZh: item.title.zh,
      titleEn: item.title.en,
      captionZh: item.caption.zh,
      captionEn: item.caption.en,
      url,
      mediaKind: item.mediaKind,
      album: item.album.zh,
      status: "PUBLISHED" as const,
      sortOrder: index,
    };
    if (existing) await db.galleryItem.update({ where: { id: existing.id }, data });
    else await db.galleryItem.create({ data });
  }

  console.log("→ Seeding partners…");
  for (const [index, partner] of partners.entries()) {
    const existing = await db.partner.findFirst({ where: { name: partner.name } });
    const data = { name: partner.name, sortOrder: index, active: true };
    if (existing) await db.partner.update({ where: { id: existing.id }, data });
    else await db.partner.create({ data });
  }

  console.log("→ Seeding site settings…");
  const settings: Record<string, string> = {
    contactPhone: "138-0000-0000",
    contactEmail: "info@starlink-auto.com",
    contactAddressZh: "广东省深圳市宝安区",
    contactAddressEn: "Bao'an District, Shenzhen, Guangdong, China",
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

  console.log("\n✓ Seed complete. 后台地址 / Admin: http://localhost:3000/admin\n");
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
