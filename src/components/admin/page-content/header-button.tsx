"use client";

import { useState } from "react";
import { PanelTop } from "lucide-react";
import type { SectionDef, SectionState } from "@/content/page-sections";
import { SectionForm } from "@/components/admin/page-content/section-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/** 页头文字: edit a list page's header (眉标、标题、说明) in a dialog from that list's admin page. */
export function PageHeaderButton({ section, state, href }: { section: SectionDef; state: SectionState; href: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="px-4">
          <PanelTop className="size-4" />
          页头文字
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogTitle className="sr-only">{section.title}</DialogTitle>
        <DialogBody className="p-6">
          <SectionForm section={section} state={state} previewHref={href} onSaved={() => setOpen(false)} headerClassName="pr-8" />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
