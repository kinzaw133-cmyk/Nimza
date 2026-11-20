import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip prefetch requests to prevent blocking Next.js client-side router prefetching
  if (
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("x-middleware-prefetch") === "1" ||
    request.headers.get("x-nextjs-data")
  ) {
    return NextResponse.next();
  }

  const roleCookie = request.cookies.get("sb-user-role")?.value;

  // 2. Server-side guard for all Admin pages and subroutes
  if (pathname.startsWith("/admin")) {
    // If no role cookie or not admin, redirect to login with return path
    if (roleCookie !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "admin");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Server-side guard for Chef Kitchen Pass portal
  if (pathname.startsWith("/chef")) {
    if (roleCookie !== "chef" && roleCookie !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "chef");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Server-side guard for Delivery Driver dispatch portal
  if (pathname.startsWith("/driver")) {
    if (roleCookie !== "delivery" && roleCookie !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "delivery");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match protected routes:
     * - /admin and all sub-routes
     * - /chef and all sub-routes
     * - /driver and all sub-routes
     */
    "/admin/:path*",
    "/chef/:path*",
    "/driver/:path*",
  ],
};
