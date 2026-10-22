"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, RotateCcw, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { resetPageContent, savePageContent } from "@/lib/admin-actions";
import type { SectionDef, SectionState } from "@/content/page-sections";
import { cn } from "@/lib/utils";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { FieldInput, fromDraft, toDraft, type Draft } from "@/components/admin/page-content/fields";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Editor for one page section: its fields, 保存, 撤销修改 and 恢复默认. The
 * content goes to the server as JSON (savePageContent validates it against
 * the same field definitions). Unsaved edits survive saves of other sections
 * — the draft is only replaced when this section's saved content changes.
 */
export function SectionForm({
  section,
  state,
  previewHref,
  onDirtyChange,
  onSaved,
  headerClassName,
}: {
  section: SectionDef;
  state: SectionState;
  /** Public page to check the result on. */
  previewHref?: string;
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
  /** e.g. room for a dialog's close button. */
  headerClassName?: string;
}) {
  const serverJson = JSON.stringify(state.value);
  const [synced, setSynced] = useState(serverJson);
  const [draft, setDraft] = useState<Draft>(() => toDraft(section.fields, state.value));
  if (serverJson !== synced) {
    setSynced(serverJson);
    setDraft(toDraft(section.fields, state.value));
  }

  const json = JSON.stringify(fromDraft(section.fields, draft));
  // The saved content run through the same conversion, so untouched fields compare equal.
  const dirty = json !== JSON.stringify(fromDraft(section.fields, toDraft(section.fields, state.value)));

  const onDirty = useRef(onDirtyChange);
  useEffect(() => {
    onDirty.current = onDirtyChange;
  });
  useEffect(() => onDirty.current?.(dirty), [dirty]);
  // Leaving the editor clears its unsaved marks.
  useEffect(() => () => onDirty.current?.(false), []);

  return (
    <ActionForm
      action={savePageContent}
      onSuccess={(result) => {
        toast.success(result.message ?? "已保存");
        onSaved?.();
      }}
      className="space-y-6"
    >
      <input type="hidden" name="key" value={section.key} />
      <input type="hidden" name="data" value={json} />

      <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", headerClassName)}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
            {dirty ? (
              <Badge variant="signal">未保存</Badge>
            ) : state.saved ? (
              <Badge variant="outline">已自定义</Badge>
            ) : (
              <Badge variant="outline">默认内容</Badge>
            )}
          </div>
          {section.description ? <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{section.description}</p> : null}
        </div>
        {previewHref ? (
          <a href={previewHref} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ExternalLink />
            在前台查看
          </a>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {section.fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            path={field.name}
            value={draft[field.name]}
            onChange={(value) => setDraft((d) => ({ ...d, [field.name]: value }))}
          />
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        {state.saved ? (
          <ResetButton
            sectionKey={section.key}
            title={section.title}
            onReset={() => setDraft(toDraft(section.fields, state.defaults))}
          />
        ) : (
          <span className="text-xs text-faint">尚未修改过，显示的是网站默认文字。</span>
        )}
        <div className="flex items-center justify-end gap-2">
          {dirty ? (
            <Button type="button" variant="ghost" onClick={() => setDraft(toDraft(section.fields, state.value))}>
              <Undo2 />
              撤销修改
            </Button>
          ) : null}
          <SubmitButton className="px-6">保存</SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}

/** 恢复默认: drop the saved row so the site shows the bundled text again. */
function ResetButton({ sectionKey, title, onReset }: { sectionKey: string; title: string; onReset: () => void }) {
  const [pending, setPending] = useState(false);

  function reset() {
    setPending(true);
    startTransition(async () => {
      const result = await resetPageContent(sectionKey);
      setPending(false);
      if (!result.ok) {
        toast.error(result.message ?? "恢复失败");
        return;
      }
      onReset();
      toast.success(result.message ?? "已恢复默认内容");
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="self-start text-muted-foreground" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
          恢复默认
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>恢复「{title}」的默认内容？</AlertDialogTitle>
          <AlertDialogDescription>这里保存过的文字会被删除，网站改回显示最初的默认文字。此操作不可撤销。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={reset}>恢复默认</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
