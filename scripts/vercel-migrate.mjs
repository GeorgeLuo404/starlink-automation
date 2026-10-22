/**
 * Vercel 构建前置：生产部署时执行数据库迁移 / Migrate before production builds on Vercel
 *
 *   由 package.json 的 vercel-build 调用（vercel.json 指定）。
 *   Called by the vercel-build script (see vercel.json).
 *
 *   · production：执行 prisma migrate deploy（经 DIRECT_URL 连接）。迁移失败则构建失败，
 *     线上继续运行上一个版本。
 *     Runs prisma migrate deploy over DIRECT_URL; a failed migration fails the
 *     build, so the previous deployment keeps serving.
 *   · preview：跳过。预览与生产共用一个数据库，未合并的迁移不能提前落库。
 *     Skipped — previews share the production database, and a migration from an
 *     unmerged branch must not reach it.
 */
import { execFileSync } from "node:child_process";

const env = process.env.VERCEL_ENV;

if (env === "production") {
  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], { stdio: "inherit" });
} else {
  console.log(`[vercel-migrate] VERCEL_ENV=${env ?? "unset"} — skipping prisma migrate deploy`);
}
