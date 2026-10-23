import { usePathname } from "next/navigation";
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

/**
 * usePathname for the site's client components, with the home page always "/".
 * When Vercel regenerates the home page in the background (ISR), Next.js renders
 * it as "/index"; the browser then says "/", and the different active link breaks
 * hydration (React error 418) for the whole page.
 */
export function usePagePath() {
  const pathname = usePathname() ?? "/";
  return pathname === "/index" ? "/" : pathname;
}

/** What the header dropdown and footer need of each service (kept small: it is sent to the client). */
export type NavService = Pick<ServiceContent, "slug" | "title" | "summary" | "coverUrl">;
