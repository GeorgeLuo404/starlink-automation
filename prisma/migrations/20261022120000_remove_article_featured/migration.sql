-- 去掉文章的「精选」：前台从未使用，首页与新闻列表只看「置顶」和发布日期。
-- Drop Article.featured — the site never used it; 置顶 (pinned) and the date decide the order.

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "featured";

