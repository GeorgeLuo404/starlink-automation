import type { ServiceContent } from "@/content/defaults";

export type NavItem = {
  key: "home" | "services" | "cases" | "news" | "gallery" | "downloads" | "about" | "contact";
  href: string;
  hasMenu?: boolean;
};

export const navItems: NavItem[] = [
  { key: "home", href: "/" },
  { key: "services", href: "/services", hasMenu: true },
  { key: "cases", href: "/cases" },
  { key: "news", href: "/news" },
  { key: "gallery", href: "/gallery" },
  { key: "downloads", href: "/downloads" },
  { key: "about", href: "/about" },
];

/** What the header dropdown and footer need of each service (kept small: it is sent to the client). */
export type NavService = Pick<ServiceContent, "slug" | "title" | "summary" | "coverUrl">;
