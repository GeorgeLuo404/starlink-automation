import { cn } from "@/lib/utils";

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
    <section className={cn("rounded-(--radius) border border-[#1b1f27] bg-[#0d0f13] p-6", className)}>
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
  return (
    <div className={className}>
      <label className="field-label" htmlFor={name}>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="field"
      />
      {description ? <p className="mt-2 text-xs text-[#5c6472]">{description}</p> : null}
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
  return (
    <div>
      <label className="field-label" htmlFor={name}>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={cn("field resize-y leading-relaxed", mono && "font-mono text-xs")}
      />
      {description ? <p className="mt-2 text-xs text-[#5c6472]">{description}</p> : null}
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
  return (
    <div>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue ?? options[0]?.value} className="field appearance-none">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description ? <p className="mt-2 text-xs text-[#5c6472]">{description}</p> : null}
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
      <input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#22e0ff]"
      />
      <div>
        <label htmlFor={name} className="cursor-pointer text-sm text-[#e8ebf0]">
          {label}
        </label>
        {description ? <p className="mt-1 text-xs text-[#5c6472]">{description}</p> : null}
      </div>
    </div>
  );
}

export function FormActions({ cancelHref, submitLabel = "保存" }: { cancelHref: string; submitLabel?: string }) {
  return (
    <div className="sticky bottom-0 -mx-5 flex items-center justify-end gap-3 border-t border-[#1b1f27] bg-background/95 px-5 py-4 backdrop-blur-xl lg:-mx-8 lg:px-8">
      <a href={cancelHref} className="btn btn-ghost h-10 px-4">
        取消
      </a>
      <button type="submit" className="btn btn-primary h-10 px-6">
        {submitLabel}
      </button>
    </div>
  );
}
