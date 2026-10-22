import { getSectionStates } from "@/lib/page-content";
import { HEADERS } from "@/content/page-sections";
import { PageHeaderButton } from "@/components/admin/page-content/header-button";

/** 页头文字 on a list page's admin screen, with that page's current header loaded. */
export async function ListHeaderButton({ page }: { page: keyof typeof HEADERS }) {
  const section = HEADERS[page];
  const state = (await getSectionStates([section.key]))[section.key]!;
  return <PageHeaderButton section={section} state={state} href={`/${page}`} />;
}
