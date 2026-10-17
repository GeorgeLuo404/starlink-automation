import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Next.js 16 proxy (the successor to middleware.ts): gates the admin area
 * behind the session cookie.
 *
 * The token is fully verified here (not merely presence-checked) so an
 * expired or tampered cookie cannot cause a redirect loop with the
 * dashboard layout's own session check.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
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

export default proxy;

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
