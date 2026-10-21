-- 业务能力也使用 ContentMedia（详情页「现场影像」），取代 Service.videoUrl

-- AlterTable
ALTER TABLE "ContentMedia" ADD COLUMN "serviceId" TEXT;

-- CreateIndex
CREATE INDEX "ContentMedia_serviceId_sortOrder_idx" ON "ContentMedia"("serviceId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ContentMedia" ADD CONSTRAINT "ContentMedia_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 每条媒体只属于一个案例、一篇文章或一项业务
ALTER TABLE "ContentMedia" DROP CONSTRAINT "ContentMedia_one_owner",
ADD CONSTRAINT "ContentMedia_one_owner" CHECK (num_nonnulls("projectId", "articleId", "serviceId") = 1);

-- 迁移旧数据：介绍视频成为第一项（用业务封面作视频封面）
INSERT INTO "ContentMedia" ("id", "kind", "url", "posterUrl", "sortOrder", "serviceId")
SELECT gen_random_uuid()::text, 'VIDEO', btrim(s."videoUrl"), s."coverUrl", 0, s."id"
FROM "Service" s
WHERE coalesce(btrim(s."videoUrl"), '') <> '';

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "videoUrl";
