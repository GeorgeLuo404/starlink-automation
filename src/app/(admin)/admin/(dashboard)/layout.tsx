import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * Authenticated admin shell.
 *
 * The proxy already verifies the session cookie, but the layout re-checks it —
 * route handlers and server components must never rely on the proxy alone.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  let newInquiries = 0;
  const db = getPrisma();
  if (db) {
    try {
      newInquiries = await db.inquiry.count({ where: { status: "NEW" } });
    } catch {
      newInquiries = 0;
    }
  }

  return (
    <AdminShell
      session={{ name: session.name, email: session.email, role: session.role }}
      counts={{ inquiries: newInquiries }}
    >
      {children}
    </AdminShell>
  );
}
