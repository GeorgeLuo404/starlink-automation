import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h1>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-(--radius) border border-border bg-card", className)}
      {...props}
    />
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-(--radius) border border-dashed border-border px-6 py-20 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: "border-success/30 bg-success/10 text-success",
    DRAFT: "border-muted-foreground/25 bg-white/5 text-muted-foreground",
    ARCHIVED: "border-signal/30 bg-signal/10 text-signal",
    NEW: "border-primary/30 bg-primary/10 text-primary",
    IN_PROGRESS: "border-signal/30 bg-signal/10 text-signal",
    DONE: "border-success/30 bg-success/10 text-success",
    SPAM: "border-destructive/30 bg-destructive/10 text-destructive",
  };
  const labels: Record<string, string> = {
    PUBLISHED: "已发布",
    DRAFT: "草稿",
    ARCHIVED: "已归档",
    NEW: "新询盘",
    IN_PROGRESS: "跟进中",
    DONE: "已完成",
    SPAM: "垃圾信息",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[0.6875rem] whitespace-nowrap",
        map[status] ?? "border-border text-muted-foreground"
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

export function SetupNotice({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-(--radius) border border-signal/30 bg-signal/6 p-6">
      <h2 className="text-sm font-semibold text-signal">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-body">{children}</div>
    </div>
  );
}

export function AdminLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("text-primary underline-offset-4 hover:underline", className)}>
      {children}
    </Link>
  );
}
