export type NavItem = {
  key: "home" | "services" | "cases" | "news" | "gallery" | "downloads" | "about" | "contact";
  href: string;
  hasMenu?: boolean;
};

/** Locale-less hrefs; the header prefixes /zh or /en at render time. */
export const navItems: NavItem[] = [
  { key: "home", href: "/" },
  { key: "services", href: "/services", hasMenu: true },
  { key: "cases", href: "/cases" },
  { key: "news", href: "/news" },
  { key: "gallery", href: "/gallery" },
  { key: "downloads", href: "/downloads" },
  { key: "about", href: "/about" },
];

export function localeHref(locale: string, href: string) {
  const clean = href === "/" ? "" : href;
  return `/${locale}${clean}` || `/${locale}`;
}
