import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { isPublicPath } from "@/lib/public-path";

export function proxy(request: NextRequest) {
  const loggedIn = request.cookies.get(SESSION_COOKIE)?.value === "1";
  const pathname = request.nextUrl.pathname;

  if (!loggedIn && !isPublicPath(pathname)) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    login.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (loggedIn && pathname === "/login") {
    const next = request.nextUrl.searchParams.get("next");
    const url = request.nextUrl.clone();
    if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login")) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    url.pathname = "/cohorts";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!_next/|favicon.ico|icon|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|zip)$).*)"],
};
