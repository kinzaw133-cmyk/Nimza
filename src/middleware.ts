import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("sb-user-role")?.value;

  // Server-side check for all Admin pages and routes: ONLY 'admin' allowed
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "admin");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Server-side check for Chef page: ONLY 'chef' (or 'admin') allowed
  if (pathname.startsWith("/chef")) {
    if (role !== "chef" && role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "chef");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Server-side check for Delivery Driver portal: ONLY 'delivery' (or 'admin') allowed
  if (pathname.startsWith("/driver")) {
    if (role !== "delivery" && role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "delivery");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/chef/:path*", "/driver/:path*"],
};
