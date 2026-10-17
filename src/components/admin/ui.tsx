import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

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

/** Square icon button for table rows (edit, delete …). */
export const iconAction = cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "text-muted-foreground hover:text-primary");
export const iconDanger = cn(
  buttonVariants({ variant: "outline", size: "icon-sm" }),
  "text-muted-foreground hover:border-destructive/40 hover:bg-destructive/8 hover:text-destructive-soft"
);

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-(--radius) border border-dashed border-border px-6 py-20 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  PUBLISHED: { label: "已发布", variant: "success" },
  DRAFT: { label: "草稿", variant: "outline" },
  ARCHIVED: { label: "已归档", variant: "signal" },
  NEW: { label: "新询盘", variant: "default" },
  IN_PROGRESS: { label: "跟进中", variant: "signal" },
  DONE: { label: "已完成", variant: "success" },
  SPAM: { label: "垃圾信息", variant: "destructive" },
};

export function StatusPill({ status }: { status: string }) {
  const entry = STATUS[status];
  return <Badge variant={entry?.variant ?? "outline"}>{entry?.label ?? status}</Badge>;
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
