"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { brandsSection, type PageDef, type SectionKey, type SectionState } from "@/content/page-sections";
import { SectionForm } from "@/components/admin/page-content/section-form";
import { useUnsavedSections } from "@/components/admin/unsaved-sections";
import { useSidebar } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * A page's editable sections, one shown at a time. The section comes from
 * `?section=` — set by the sidebar's sub-items (or, when the sidebar can't
 * show them, by the strip of tabs here) — without a reload, so unsaved edits
 * in the other sections are kept. Every section stays mounted; unsaved ones
 * are reported to the sidebar, and leaving the page with any asks first.
 */
export function PageEditor({
  page,
  states,
  brands,
}: {
  page: PageDef;
  states: Partial<Record<SectionKey, SectionState>>;
  /** The 品牌平台 list, for the home page's brands tab. */
  brands?: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get("section");
  const tab = page.sections.find((s) => s.key === requested)?.key ?? page.sections[0].key;
  const { unsaved, setUnsaved } = useUnsavedSections();
  const anyUnsaved = page.sections.some((s) => unsaved.has(s.key));
  // The sidebar lists the sections; on phones (a sheet) or collapsed to icons it can't, so the strip shows instead.
  const { isMobile, state } = useSidebar();
  const showStrip = isMobile || state === "collapsed";
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anyUnsaved) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyUnsaved]);

  // Keep the current tab in view in the strip.
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("[data-state=active]");
    if (list && active && list.scrollWidth > list.clientWidth) list.scrollLeft = active.offsetLeft - 16;
  }, [tab, showStrip]);

  function select(key: string) {
    // In the address without a navigation, so the sidebar follows and a reload reopens it.
    window.history.replaceState(null, "", `${pathname}?section=${key}`);
  }

  const reportTo = (key: string) => (dirty: boolean) => setUnsaved(key, dirty);

  return (
    <Tabs value={tab} onValueChange={select} className="gap-6">
      {showStrip ? (
        <TabsList ref={listRef} aria-label={`${page.title}的栏目`} className="h-auto w-full justify-start overflow-x-auto">
          {page.sections.map((section, i) => (
            <TabsTrigger key={section.key} value={section.key} className="flex-none gap-2 py-2">
              <span className="font-mono text-[0.625rem] text-faint tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              {section.title}
              {unsaved.has(section.key) ? <span className="size-1.5 shrink-0 rounded-full bg-signal" aria-label="有未保存的修改" /> : null}
            </TabsTrigger>
          ))}
        </TabsList>
      ) : null}

      {page.sections.map((section) => (
        <TabsContent key={section.key} value={section.key} forceMount className="data-[state=inactive]:hidden">
          {section.key === "brands" ? (
            <div className="space-y-8">
              <Panel>
                <SectionForm section={brandsSection} state={states[brandsSection.key]!} onDirtyChange={reportTo(section.key)} />
              </Panel>
              {brands}
            </div>
          ) : (
            <Panel>
              <SectionForm section={section} state={states[section.key]!} onDirtyChange={reportTo(section.key)} />
            </Panel>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-(--radius) border border-border bg-card p-5 sm:p-6">{children}</div>;
}
