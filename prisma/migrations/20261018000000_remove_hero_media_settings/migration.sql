-- The home hero is now a canvas animation with no uploadable video or poster.
-- Drop the two settings rows that 后台 → 站点设置 used to store for it (data only, no schema change).
DELETE FROM "SiteSetting" WHERE "key" IN ('heroVideoUrl', 'heroPosterUrl');
