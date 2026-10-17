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
