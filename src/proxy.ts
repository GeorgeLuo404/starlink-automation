import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Next.js 16 proxy (the successor to middleware.ts).
 *
 * Two responsibilities:
 *   1. /admin  — gate the admin area behind the session cookie.
 *   2. locale  — redirect un-prefixed paths to /zh or /en and remember the choice.
 */

const PUBLIC_FILE = /\.[^/]+$/;
const LOCALE_HEADER = "x-starlink-locale";
const PATH_HEADER = "x-starlink-pathname";

function detectLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale as Locale;
  }
  const header = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (header.startsWith("en") || header.includes(",en")) return "en";
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // -- Admin area ---------------------------------------------------------
  // The token is fully verified here (not merely presence-checked) so an
  // expired or tampered cookie cannot cause a redirect loop with the
  // dashboard layout's own session check.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const isLogin = pathname === "/admin/login";
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

    if (!isLogin && !session) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      const response = NextResponse.redirect(url);
      if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    if (isLogin && session) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // -- Skip infrastructure and static asset paths -------------------------
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // -- Locale routing -----------------------------------------------------
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const hasLocale = !!first && (locales as readonly string[]).includes(first);

  if (!hasLocale) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, first);
  requestHeaders.set(PATH_HEADER, pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (request.cookies.get("NEXT_LOCALE")?.value !== first) {
    response.cookies.set("NEXT_LOCALE", first, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return response;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|webm|css|js|woff2?)$).*)",
  ],
};
