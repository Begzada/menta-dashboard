import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("menta_session");
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === "/management/login") {
    if (session) {
      return NextResponse.redirect(
        new URL("/management/dashboard", request.url)
      );
    }
    return NextResponse.next();
  }

  // Protected routes
  if (pathname.startsWith("/management/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Redirect root to dashboard
  if (pathname === "/") {
    if (session) {
      return NextResponse.redirect(
        new URL("/management/dashboard", request.url)
      );
    }
    return NextResponse.redirect(new URL("/management/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login"],
};
