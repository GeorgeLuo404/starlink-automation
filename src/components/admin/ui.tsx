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
        {description ? <p className="mt-2 text-sm text-[#8a929e]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-[var(--radius)] border border-[#1b1f27] bg-[#0d0f13]", className)}
      {...props}
    />
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-[#1b1f27] px-6 py-20 text-center">
      <p className="text-sm font-medium text-[#e8ebf0]">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm text-[#8a929e]">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: "border-[#35d07f]/30 bg-[#35d07f]/10 text-[#35d07f]",
    DRAFT: "border-[#8a929e]/25 bg-white/5 text-[#8a929e]",
    ARCHIVED: "border-[#ffb020]/30 bg-[#ffb020]/10 text-[#ffb020]",
    NEW: "border-[#22e0ff]/30 bg-[#22e0ff]/10 text-[#22e0ff]",
    IN_PROGRESS: "border-[#ffb020]/30 bg-[#ffb020]/10 text-[#ffb020]",
    DONE: "border-[#35d07f]/30 bg-[#35d07f]/10 text-[#35d07f]",
    SPAM: "border-[#ff4d4f]/30 bg-[#ff4d4f]/10 text-[#ff4d4f]",
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
        map[status] ?? "border-[#1b1f27] text-[#8a929e]"
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

export function SetupNotice({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius)] border border-[#ffb020]/30 bg-[#ffb020]/6 p-6">
      <h2 className="text-sm font-semibold text-[#ffb020]">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#c3c9d4]">{children}</div>
    </div>
  );
}

export function AdminLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("text-[#22e0ff] underline-offset-4 hover:underline", className)}>
      {children}
    </Link>
  );
}
