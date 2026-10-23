import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { AdminPageHeader, SetupNotice } from "@/components/admin/ui";
import { PasswordForm } from "@/components/admin/forms/password-form";

export const dynamic = "force-dynamic";

export default async function AdminPasswordPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <AdminPageHeader
        title="修改密码"
        description="修改后，下次登录使用新密码。忘记密码时，请开发者在本机运行 pnpm admin:create 重置（见部署文档）。"
      />
      {getPrisma() ? (
        <PasswordForm email={session.email} />
      ) : (
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可修改密码。</p>
        </SetupNotice>
      )}
    </>
  );
}
