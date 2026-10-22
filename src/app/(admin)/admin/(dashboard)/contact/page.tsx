import { PAGES } from "@/content/page-sections";
import { PageContentScreen } from "@/components/admin/page-content/page-screen";

export const dynamic = "force-dynamic";

export default function AdminContactPage() {
  return <PageContentScreen page={PAGES.contact} />;
}
