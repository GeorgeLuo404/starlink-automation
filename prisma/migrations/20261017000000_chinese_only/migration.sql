-- 站点改为仅提供中文内容 / The site now serves Chinese content only.
--
-- 中文列改为通用列名（titleZh → title），删除英文列，并把原先的双语数据还原为中文：
--   · Project.location / Project.scope 由 "中文||English" 打包格式还原为纯中文；
--   · Project.metrics 的 label、Service.faq 的 q / a 由 {zh, en} 对象还原为字符串；
--   · Service.features / deliverables 由 JSON 数组改为 TEXT[]；
--   · 站点设置 contactAddressZh 改名为 contactAddress，删除 contactAddressEn。
-- 重命名而非删除重建，已有内容不会丢失。

-- Category -------------------------------------------------------------------
ALTER TABLE "Category" RENAME COLUMN "nameZh" TO "name";
ALTER TABLE "Category" DROP COLUMN "nameEn";

-- Article --------------------------------------------------------------------
ALTER TABLE "Article" RENAME COLUMN "titleZh" TO "title";
ALTER TABLE "Article" RENAME COLUMN "excerptZh" TO "excerpt";
ALTER TABLE "Article" RENAME COLUMN "contentZh" TO "content";
ALTER TABLE "Article"
    DROP COLUMN "titleEn",
    DROP COLUMN "excerptEn",
    DROP COLUMN "contentEn";

-- Project --------------------------------------------------------------------
ALTER TABLE "Project" RENAME COLUMN "titleZh" TO "title";
ALTER TABLE "Project" RENAME COLUMN "clientZh" TO "client";
ALTER TABLE "Project" RENAME COLUMN "industryZh" TO "industry";
ALTER TABLE "Project" RENAME COLUMN "summaryZh" TO "summary";
ALTER TABLE "Project" RENAME COLUMN "contentZh" TO "content";
ALTER TABLE "Project"
    DROP COLUMN "titleEn",
    DROP COLUMN "clientEn",
    DROP COLUMN "industryEn",
    DROP COLUMN "summaryEn",
    DROP COLUMN "contentEn";

UPDATE "Project"
SET "location" = split_part("location", '||', 1)
WHERE "location" LIKE '%||%';

UPDATE "Project"
SET "scope" = ARRAY(
    SELECT split_part(entry, '||', 1)
    FROM unnest("scope") WITH ORDINALITY AS t(entry, position)
    ORDER BY position
)
WHERE array_to_string("scope", ',') LIKE '%||%';

UPDATE "Project"
SET "metrics" = COALESCE((
    SELECT jsonb_agg(
        jsonb_build_object(
            'value', metric -> 'value',
            'label', CASE WHEN jsonb_typeof(metric -> 'label') = 'object'
                          THEN metric -> 'label' -> 'zh'
                          ELSE metric -> 'label' END
        ) ORDER BY position
    )
    FROM jsonb_array_elements("metrics") WITH ORDINALITY AS t(metric, position)
), '[]'::jsonb)
WHERE jsonb_typeof("metrics") = 'array';

-- Service --------------------------------------------------------------------
ALTER TABLE "Service" RENAME COLUMN "titleZh" TO "title";
ALTER TABLE "Service" RENAME COLUMN "summaryZh" TO "summary";
ALTER TABLE "Service" RENAME COLUMN "contentZh" TO "content";
ALTER TABLE "Service"
    DROP COLUMN "titleEn",
    DROP COLUMN "summaryEn",
    DROP COLUMN "contentEn";

-- {zh, en} 对象或纯字符串组成的 JSON 数组 → TEXT[]
ALTER TABLE "Service"
    ADD COLUMN "features_zh" TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "deliverables_zh" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "Service"
SET "features_zh" = ARRAY(
    SELECT COALESCE(item ->> 'zh', item #>> '{}')
    FROM jsonb_array_elements("features") WITH ORDINALITY AS t(item, position)
    ORDER BY position
)
WHERE jsonb_typeof("features") = 'array';

UPDATE "Service"
SET "deliverables_zh" = ARRAY(
    SELECT COALESCE(item ->> 'zh', item #>> '{}')
    FROM jsonb_array_elements("deliverables") WITH ORDINALITY AS t(item, position)
    ORDER BY position
)
WHERE jsonb_typeof("deliverables") = 'array';

ALTER TABLE "Service"
    DROP COLUMN "features",
    DROP COLUMN "deliverables";
ALTER TABLE "Service" RENAME COLUMN "features_zh" TO "features";
ALTER TABLE "Service" RENAME COLUMN "deliverables_zh" TO "deliverables";

UPDATE "Service"
SET "faq" = COALESCE((
    SELECT jsonb_agg(
        jsonb_build_object(
            'q', CASE WHEN jsonb_typeof(entry -> 'q') = 'object' THEN entry -> 'q' -> 'zh' ELSE entry -> 'q' END,
            'a', CASE WHEN jsonb_typeof(entry -> 'a') = 'object' THEN entry -> 'a' -> 'zh' ELSE entry -> 'a' END
        ) ORDER BY position
    )
    FROM jsonb_array_elements("faq") WITH ORDINALITY AS t(entry, position)
), '[]'::jsonb)
WHERE jsonb_typeof("faq") = 'array';

-- DownloadFile ---------------------------------------------------------------
ALTER TABLE "DownloadFile" RENAME COLUMN "titleZh" TO "title";
ALTER TABLE "DownloadFile" RENAME COLUMN "descriptionZh" TO "description";
ALTER TABLE "DownloadFile"
    DROP COLUMN "titleEn",
    DROP COLUMN "descriptionEn";

-- GalleryItem ----------------------------------------------------------------
ALTER TABLE "GalleryItem" RENAME COLUMN "titleZh" TO "title";
ALTER TABLE "GalleryItem" RENAME COLUMN "captionZh" TO "caption";
ALTER TABLE "GalleryItem"
    DROP COLUMN "titleEn",
    DROP COLUMN "captionEn";

-- Inquiry --------------------------------------------------------------------
ALTER TABLE "Inquiry" DROP COLUMN "locale";

-- SiteSetting ----------------------------------------------------------------
DELETE FROM "SiteSetting" WHERE "key" = 'contactAddressEn';
UPDATE "SiteSetting" SET "key" = 'contactAddress'
WHERE "key" = 'contactAddressZh'
  AND NOT EXISTS (SELECT 1 FROM "SiteSetting" WHERE "key" = 'contactAddress');
DELETE FROM "SiteSetting" WHERE "key" = 'contactAddressZh';
