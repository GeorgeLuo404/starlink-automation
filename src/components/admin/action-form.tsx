"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ActionState } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";

export type FormAction = (state: ActionState, form: FormData) => Promise<ActionState>;

type FormContextValue = { pending: boolean; fieldErrors?: Record<string, string[]> };

const FormContext = createContext<FormContextValue>({ pending: false });

/** First validation error for a field of the enclosing <ActionForm>, if any. */
export function useFieldError(name: string) {
  return useContext(FormContext).fieldErrors?.[name]?.[0];
}

/** Every validation error of the enclosing <ActionForm>, keyed by field name or path. */
export function useFormErrors() {
  return useContext(FormContext).fieldErrors;
}

export function useFormPending() {
  return useContext(FormContext).pending;
}

/**
 * Form bound to a server action that returns an ActionState.
 *
 * Validation errors are shown inline (via useFieldError), as a summary banner
 * and as a toast. The form is submitted manually so React does not reset the
 * uncontrolled fields when the action fails — the user keeps what they typed.
 * `onSuccess` runs when an action returns `{ ok: true }` rather than
 * redirecting (forms in a dialog).
 */
export function ActionForm({
  action,
  children,
  className,
  showSummary = true,
  onSuccess,
}: {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
  showSummary?: boolean;
  onSuccess?: (state: ActionState) => void;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: true });
  const initial = useRef(state);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  useEffect(() => {
    if (!state.ok && state.message) toast.error(state.message);
    else if (state.ok && state !== initial.current) onSuccessRef.current?.(state);
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        startTransition(() => formAction(new FormData(form, submitter)));
      }}
      aria-busy={pending}
      className={className}
    >
      {showSummary && !state.ok && state.message ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-(--radius) border border-destructive/30 bg-destructive/6 p-4"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive-soft">{state.message}</p>
        </div>
      ) : null}
      <FormContext.Provider value={{ pending, fieldErrors: state.ok ? undefined : state.fieldErrors }}>
        {children}
      </FormContext.Provider>
    </form>
  );
}

/** Submit button that shows a spinner and disables itself while the action runs. */
export function SubmitButton({
  children,
  className,
  size,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const pending = useFormPending();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending} size={size} variant={variant} className={className}>
      {pending ? <Loader2 className="animate-spin" /> : null}
      {children}
    </Button>
  );
}

/** Inline error under a field; renders nothing when the field is valid. */
export function FieldError({ name }: { name: string }) {
  const error = useFieldError(name);
  if (!error) return null;
  return (
    <p id={`${name}-error`} role="alert" className="mt-2 text-xs text-destructive-soft">
      {error}
    </p>
  );
}
