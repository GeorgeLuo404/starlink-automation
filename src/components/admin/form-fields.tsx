"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FieldError, SubmitButton, useFieldError } from "@/components/admin/action-form";

// The editor (Tiptap + ProseMirror) is the heaviest thing in the admin, so it
// loads on its own after the rest of the form.
const RichTextEditor = dynamic(() => import("@/components/admin/rich-text-editor/editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-[22.5rem]" />,
});

/*
 * Field components for admin forms. They are client components so they can read
 * the validation state of the enclosing <ActionForm> and show inline errors.
 */

function errorProps(name: string, error: string | undefined) {
  return error ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {};
}

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-(--radius) border border-border bg-card p-6", className)}>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {description ? <p className="mt-1.5 text-xs text-muted-foreground">{description}</p> : null}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export function FormField({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  required,
  description,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  type?: string;
  required?: boolean;
  description?: string;
  className?: string;
}) {
  const error = useFieldError(name);
  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        {...errorProps(name, error)}
      />
      <FieldError name={name} />
      {description ? <p className="mt-2 text-xs text-faint">{description}</p> : null}
    </div>
  );
}

/**
 * Rich-text body field, stored as Markdown. The value is posted from a hidden
 * input that holds the original text until the editor changes it, so saving
 * before the editor has loaded never blanks the body.
 */
export function FormRichText({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  description,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
  description?: string;
}) {
  const error = useFieldError(name);
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <div>
      <Label id={`${name}-label`}>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <input type="hidden" name={name} value={value} />
      <RichTextEditor
        defaultValue={defaultValue ?? ""}
        onChange={setValue}
        placeholder={placeholder}
        labelledBy={`${name}-label`}
        describedBy={error ? `${name}-error` : undefined}
        invalid={Boolean(error)}
      />
      <FieldError name={name} />
      {description ? <p className="mt-2 text-xs text-faint">{description}</p> : null}
    </div>
  );
}

export function FormTextarea({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 6,
  required,
  description,
  mono,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  description?: string;
  mono?: boolean;
}) {
  const error = useFieldError(name);
  return (
    <div>
      <Label htmlFor={name}>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={cn("min-h-0 resize-y", mono && "font-mono text-xs")}
        {...errorProps(name, error)}
      />
      <FieldError name={name} />
      {description ? <p className="mt-2 text-xs text-faint">{description}</p> : null}
    </div>
  );
}

export function FormSelect({
  label,
  name,
  options,
  defaultValue,
  description,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  description?: string;
}) {
  const error = useFieldError(name);
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={defaultValue ?? options[0]?.value}>
        <SelectTrigger id={name} {...errorProps(name, error)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError name={name} />
      {description ? <p className="mt-2 text-xs text-faint">{description}</p> : null}
    </div>
  );
}

export function FormCheckbox({
  label,
  name,
  defaultChecked,
  description,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox id={name} name={name} defaultChecked={defaultChecked} className="mt-0.5 cursor-pointer" />
      <div>
        <Label htmlFor={name} className="mb-0 cursor-pointer font-sans text-sm tracking-normal text-foreground normal-case">
          {label}
        </Label>
        {description ? <p className="mt-1 text-xs text-faint">{description}</p> : null}
      </div>
    </div>
  );
}

export function FormActions({ cancelHref, submitLabel = "保存" }: { cancelHref: string; submitLabel?: string }) {
  return (
    <div className="sticky bottom-0 -mx-5 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-5 py-4 backdrop-blur-xl lg:-mx-8 lg:px-8">
      <Link href={cancelHref} className={buttonVariants({ variant: "ghost" })}>
        取消
      </Link>
      <SubmitButton className="px-6">{submitLabel}</SubmitButton>
    </div>
  );
}
