import { redirect } from "next/navigation";

/** The brand list moved into the 首页 editor; keep old links working. */
export default function AdminPartnersPage() {
  redirect("/admin/home?section=brands");
}
