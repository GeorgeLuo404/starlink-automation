-- 案例 / 新闻的多图与视频：新增 ContentMedia 表，取代 Project.gallery 与 Project.videoUrl

-- CreateTable
CREATE TABLE "ContentMedia" (
    "id" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "url" TEXT NOT NULL,
    "posterUrl" TEXT,
    "alt" TEXT,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT,
    "articleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentMedia_pkey" PRIMARY KEY ("id"),
    -- 每条媒体只属于一个案例或一篇文章
    CONSTRAINT "ContentMedia_one_owner" CHECK (num_nonnulls("projectId", "articleId") = 1)
);

-- CreateIndex
CREATE INDEX "ContentMedia_projectId_sortOrder_idx" ON "ContentMedia"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "ContentMedia_articleId_sortOrder_idx" ON "ContentMedia"("articleId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ContentMedia" ADD CONSTRAINT "ContentMedia_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentMedia" ADD CONSTRAINT "ContentMedia_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 迁移旧数据：视频排在第一位（用案例封面作视频封面），图库图片按原顺序排在后面
INSERT INTO "ContentMedia" ("id", "kind", "url", "posterUrl", "sortOrder", "projectId")
SELECT gen_random_uuid()::text, 'VIDEO', btrim(p."videoUrl"), p."coverUrl", 0, p."id"
FROM "Project" p
WHERE coalesce(btrim(p."videoUrl"), '') <> '';

INSERT INTO "ContentMedia" ("id", "kind", "url", "sortOrder", "projectId")
SELECT gen_random_uuid()::text, 'IMAGE', btrim(g.url), g.ord::int, p."id"
FROM "Project" p
CROSS JOIN LATERAL unnest(p."gallery") WITH ORDINALITY AS g(url, ord)
WHERE btrim(g.url) <> '';

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "gallery",
DROP COLUMN "videoUrl";
