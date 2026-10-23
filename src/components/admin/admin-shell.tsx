"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronRight,
  ChevronsUpDown,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  House,
  Images,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  LogOut,
  PhoneCall,
  Settings,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { PAGES, type PageDef } from "@/content/page-sections";
import { logoutAction } from "@/lib/admin-actions";
import { LogoMark } from "@/components/site/logo";
import { UnsavedSectionsProvider, useUnsavedSections } from "@/components/admin/unsaved-sections";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

/*
 * Admin layout on shadcn's Sidebar: collapses to icons (⌘/Ctrl + B, state kept
 * in a cookie), opens as a sheet on phones. 网站内容 follows the site's own
 * navigation, and the pages edited section by section (首页、关于我们、联系我们)
 * list their sections underneath, in page order.
 */

type NavEntry = { href: string; label: string; icon: LucideIcon; badge?: number; page?: PageDef };

/** The vermilion active state the admin has always used, on top of shadcn's defaults. */
const activeItem = "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-normal";

function navGroups(inquiries: number): { title: string; items: NavEntry[] }[] {
  return [
    {
      title: "概览",
      items: [
        { href: "/admin", label: "仪表盘", icon: Gauge },
        { href: "/admin/inquiries", label: "客户询盘", icon: Inbox, badge: inquiries },
      ],
    },
    {
      // Same order and names as the site's top navigation.
      title: "网站内容",
      items: [
        { href: "/admin/home", label: "首页", icon: House, page: PAGES.home },
        { href: "/admin/services", label: "业务能力", icon: Wrench },
        { href: "/admin/cases", label: "项目案例", icon: Briefcase },
        { href: "/admin/articles", label: "新闻动态", icon: FileText },
        { href: "/admin/gallery", label: "现场图库", icon: Images },
        { href: "/admin/downloads", label: "资料下载", icon: Download },
        { href: "/admin/about", label: "关于我们", icon: Building2, page: PAGES.about },
        { href: "/admin/contact", label: "联系我们", icon: PhoneCall, page: PAGES.contact },
      ],
    },
    {
      title: "资源与设置",
      items: [
        { href: "/admin/media", label: "媒体库", icon: ImageIcon },
        { href: "/admin/settings", label: "站点设置", icon: Settings },
      ],
    },
  ];
}

/** Reached from the account menu at the foot of the sidebar, not from the nav. */
const PASSWORD_PAGE = { href: "/admin/password", label: "修改密码" };

const matches = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

/** The section shown for a page: `?section=`, else its first one. */
function currentSection(page: PageDef, requested: string | null) {
  return page.sections.find((s) => s.key === requested)?.key ?? page.sections[0].key;
}

export function AdminShell({
  children,
  session,
  counts,
  defaultOpen,
}: {
  children: React.ReactNode;
  session: { name: string; email: string; role: string };
  counts: { inquiries: number };
  /** From the sidebar_state cookie, so a collapsed sidebar stays collapsed across reloads. */
  defaultOpen: boolean;
}) {
  const groups = navGroups(counts.inquiries);
  return (
    <UnsavedSectionsProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AdminSidebar groups={groups} session={session} />
        <SidebarInset className="min-w-0">
          <AdminTopBar groups={groups} />
          <div className="min-w-0 flex-1 p-5 lg:p-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </UnsavedSectionsProvider>
  );
}

function AdminSidebar({ groups, session }: { groups: ReturnType<typeof navGroups>; session: { name: string; email: string } }) {
  const pathname = usePathname() ?? "";
  const params = useSearchParams();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { unsaved } = useUnsavedSections();
  // Section lists folded or unfolded by hand on this page; otherwise only the current page's list is open.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [toggledOn, setToggledOn] = useState(pathname);
  if (pathname !== toggledOn) {
    setToggledOn(pathname);
    setToggled({});
  }
  const [leaving, setLeaving] = useState<string | null>(null);

  /**
   * A link inside the open page only switches the section (no reload, edits
   * kept); leaving a page with unsaved edits asks first.
   */
  function follow(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    setOpenMobile(false);
    if (href.split("?")[0] === pathname) {
      event.preventDefault();
      window.history.replaceState(null, "", href);
      window.scrollTo({ top: 0 });
    } else if (unsaved.size) {
      event.preventDefault();
      setLeaving(href);
    }
  }

  return (
    <Sidebar collapsible="icon">
      {/* Same height as the top bar, so their bottom borders line up. */}
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="星链自动化 · 管理后台"
              className="group-data-[collapsible=icon]:justify-center"
            >
              <Link href="/admin" onClick={(e) => follow(e, "/admin")}>
                {/* `!`: the menu button sizes every child svg to 16px; collapsed, the mark centres on the icon column. */}
                <LogoMark className="size-7! shrink-0 group-data-[collapsible=icon]:size-6!" />
                <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-semibold text-white">星链自动化</p>
                  <p className="font-mono text-[0.5625rem] tracking-[0.2em] text-faint uppercase">Admin</p>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="font-mono text-[0.5625rem] tracking-[0.2em] text-ghost uppercase">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = matches(pathname, item.href);
                const Icon = item.icon;
                const link = (
                  <SidebarMenuButton asChild isActive={active} tooltip={item.label} className={activeItem}>
                    <Link href={item.href} onClick={(e) => follow(e, item.href)}>
                      <Icon strokeWidth={1.6} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                );

                if (!item.page) {
                  return (
                    <SidebarMenuItem key={item.href}>
                      {link}
                      {item.badge ? (
                        <SidebarMenuBadge className="rounded-full bg-signal font-mono text-[0.5625rem] font-semibold text-signal-foreground peer-hover/menu-button:text-signal-foreground">
                          {item.badge}
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  );
                }

                const page = item.page;
                const section = active ? currentSection(page, params.get("section")) : null;
                const open = toggled[item.href] ?? active;
                return (
                  <Collapsible key={item.href} asChild open={open} className="group/collapsible">
                    <SidebarMenuItem>
                      {/* One target for the whole row, as in shadcn's nav: elsewhere it opens the
                          page with its sections unfolded; on the page it folds or unfolds them,
                          keeping the current section and any unsaved edits. */}
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label} className={activeItem}>
                        <Link
                          href={item.href}
                          aria-expanded={open}
                          onClick={(e) => {
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                            if (active) {
                              e.preventDefault();
                              setToggled((t) => ({ ...t, [item.href]: !open }));
                              return;
                            }
                            setToggled((t) => ({ ...t, [item.href]: true }));
                            follow(e, item.href);
                          }}
                        >
                          <Icon strokeWidth={1.6} />
                          <span>{item.label}</span>
                          <ChevronRight className="ml-auto text-faint transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </Link>
                      </SidebarMenuButton>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {page.sections.map((s, i) => {
                            const href = `${item.href}?section=${s.key}`;
                            return (
                              <SidebarMenuSubItem key={s.key}>
                                <SidebarMenuSubButton asChild isActive={s.key === section} className={activeItem}>
                                  <Link href={href} onClick={(e) => follow(e, href)}>
                                    <span className="font-mono text-[0.5625rem] text-faint tabular-nums">
                                      {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span>{s.title}</span>
                                    {active && unsaved.has(s.key) ? (
                                      <span className="ml-auto size-1.5 shrink-0 rounded-full bg-signal" aria-label="有未保存的修改" />
                                    ) : null}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="查看前台网站">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink strokeWidth={1.6} />
                <span>查看前台网站</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <UserMenu session={session} onNavigate={follow} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />

      <AlertDialog open={leaving !== null} onOpenChange={(open) => !open && setLeaving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>有未保存的修改</AlertDialogTitle>
            <AlertDialogDescription>离开这个页面后，还没保存的修改会丢失。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>留在本页</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (leaving) router.push(leaving);
                setLeaving(null);
              }}
            >
              仍然离开
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}

function UserMenu({
  session,
  onNavigate,
}: {
  session: { name: string; email: string };
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const { isMobile } = useSidebar();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent" tooltip={session.name}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-raised text-xs font-semibold text-foreground">
            {session.name.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-medium text-foreground">{session.name}</p>
            <p className="truncate font-mono text-[0.5625rem] text-faint">{session.email}</p>
          </div>
          <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" sideOffset={8} className="min-w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm text-foreground">{session.name}</p>
          <p className="truncate font-mono text-[0.625rem] text-faint">{session.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={PASSWORD_PAGE.href} onClick={(e) => onNavigate(e, PASSWORD_PAGE.href)}>
            <KeyRound />
            {PASSWORD_PAGE.label}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void logoutAction()} className="text-destructive-soft focus:text-destructive-soft">
          <LogOut />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The bar above every admin page: sidebar toggle, then where you are. */
function AdminTopBar({ groups }: { groups: ReturnType<typeof navGroups> }) {
  const pathname = usePathname() ?? "";
  const params = useSearchParams();
  const entry = groups.flatMap((g) => g.items).find((item) => matches(pathname, item.href));
  const section = entry?.page && pathname === entry.href ? currentSection(entry.page, params.get("section")) : null;
  const sectionTitle = section ? entry?.page?.sections.find((s) => s.key === section)?.title : null;
  const title = entry?.label ?? (matches(pathname, PASSWORD_PAGE.href) ? PASSWORD_PAGE.label : "管理后台");

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-4!" />
      <nav aria-label="当前位置" className="flex min-w-0 items-center gap-2 text-sm">
        <span className={sectionTitle ? "truncate text-muted-foreground" : "truncate text-foreground"}>{title}</span>
        {sectionTitle ? (
          <>
            <ChevronRight className="size-3.5 shrink-0 text-faint" />
            <span className="truncate text-foreground">{sectionTitle}</span>
          </>
        ) : null}
      </nav>
    </header>
  );
}
