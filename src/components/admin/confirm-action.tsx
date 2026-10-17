"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { FormAction } from "@/components/admin/action-form";

/**
 * Destructive action behind a confirmation dialog (delete article, case, …).
 *
 * `children` is the trigger's content (usually an icon); the action receives a
 * FormData with the record `id`.
 */
export function ConfirmAction({
  action,
  id,
  title,
  description,
  confirmLabel = "删除",
  triggerLabel,
  triggerClassName,
  children,
}: {
  action: FormAction;
  id: string;
  title: string;
  description: string;
  confirmLabel?: string;
  triggerLabel: string;
  triggerClassName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, { ok: true });

  useEffect(() => {
    if (!state.ok && state.message) toast.error(state.message);
  }, [state]);

  function confirm() {
    const form = new FormData();
    form.set("id", id);
    startTransition(() => formAction(form));
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName} aria-label={triggerLabel}>
        {children}
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
        title={title}
        description={description}
        size="sm"
      >
        {!state.ok && state.message ? (
          <p role="alert" className="mb-4 text-sm text-destructive-soft">
            {state.message}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending} autoFocus>
            取消
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {confirmLabel}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
