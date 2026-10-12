/**
 * 创建 / 重置管理员账号
 * Create or reset an administrator account.
 *
 *   ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='strong-password' pnpm admin:create
 *
 * Falls back to the values in .env when the environment variables are not set.
 */
import path from "node:path";
import { getPrisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // .env is optional.
}

async function main() {
  const db = getPrisma();
  if (!db) {
    console.error("\n✗ DATABASE_URL is not set. Configure .env first.\n");
    process.exit(1);
  }

  const email = (process.env.ADMIN_EMAIL || "admin@starlink-auto.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "系统管理员";

  if (password.length < 8) {
    console.error("\n✗ ADMIN_PASSWORD must be at least 8 characters.\n");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    await db.user.update({ where: { email }, data: { passwordHash, name, role: "ADMIN" } });
    console.log(`\n✓ Password reset for ${email}\n`);
  } else {
    await db.user.create({ data: { email, name, passwordHash, role: "ADMIN" } });
    console.log(`\n✓ Administrator created: ${email}\n`);
  }
}

main()
  .catch((error) => {
    console.error("\n✗ Failed:", error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
