"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Handshake,
  Images,
  Image as ImageIcon,
  Inbox,
  LogOut,
  Menu,
  Settings,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/site/logo";
import { logoutAction } from "@/lib/admin-actions";

type NavEntry = { href: string; label: string; icon: typeof Gauge; badge?: number };

export function AdminShell({
  children,
  session,
  counts,
}: {
  children: React.ReactNode;
  session: { name: string; email: string; role: string };
  counts: { inquiries: number };
}) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const groups: { title: string; items: NavEntry[] }[] = [
    {
      title: "概览",
      items: [{ href: "/admin", label: "仪表盘", icon: Gauge }],
    },
    {
      title: "内容管理",
      items: [
        { href: "/admin/articles", label: "文章 / 新闻", icon: FileText },
        { href: "/admin/cases", label: "项目案例", icon: Briefcase },
        { href: "/admin/services", label: "业务能力", icon: Wrench },
        { href: "/admin/gallery", label: "图库", icon: Images },
      ],
    },
    {
      title: "资源管理",
      items: [
        { href: "/admin/media", label: "媒体库", icon: ImageIcon },
        { href: "/admin/downloads", label: "下载资料", icon: Download },
      ],
    },
    {
      title: "客户与系统",
      items: [
        { href: "/admin/inquiries", label: "客户询盘", icon: Inbox, badge: counts.inquiries },
        { href: "/admin/partners", label: "合作伙伴", icon: Handshake },
        { href: "/admin/settings", label: "站点设置", icon: Settings },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#1b1f27] px-5">
        <LogoMark className="size-7" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">星链自动化</p>
          <p className="font-mono text-[0.5625rem] tracking-[0.2em] text-[#5c6472] uppercase">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-2 px-2 font-mono text-[0.5625rem] tracking-[0.2em] text-[#3d4552] uppercase">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-[#22e0ff]/10 text-[#22e0ff]"
                          : "text-[#8a929e] hover:bg-white/4 hover:text-white"
                      )}
                    >
                      <Icon className="size-4 shrink-0" strokeWidth={1.6} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-[#ffb020] px-1.5 py-0.5 font-mono text-[0.5625rem] font-semibold text-[#1a1200]">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[#1b1f27] p-3">
        <a
          href="/zh"
          target="_blank"
          rel="noreferrer"
          className="mb-1 flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm text-[#8a929e] transition-colors hover:bg-white/4 hover:text-white"
        >
          <ExternalLink className="size-4" strokeWidth={1.6} />
          查看前台网站
        </a>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm text-[#8a929e] transition-colors hover:bg-[#ff4d4f]/10 hover:text-[#ff8a8c]"
          >
            <LogOut className="size-4" strokeWidth={1.6} />
            退出登录
          </button>
        </form>
        <div className="mt-3 rounded-[var(--radius)] border border-[#1b1f27] px-3 py-2.5">
          <p className="truncate text-xs font-medium text-[#e8ebf0]">{session.name}</p>
          <p className="truncate font-mono text-[0.5625rem] text-[#5c6472]">{session.email}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#08090b]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[#1b1f27] bg-[#0a0b0e] lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-[#1b1f27] bg-[#0a0b0e]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10 inline-flex size-8 items-center justify-center rounded border border-[#1b1f27] text-[#8a929e]"
              aria-label="关闭"
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#1b1f27] bg-[#08090b]/90 px-5 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded border border-[#1b1f27]"
            aria-label="菜单"
          >
            <Menu className="size-4" />
          </button>
          <span className="text-sm font-semibold text-white">管理后台</span>
        </header>

        <main className="min-w-0 flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
