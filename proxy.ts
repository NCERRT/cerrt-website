import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "sessionId";

// Public auth routes that unauthenticated users need access to
const PUBLIC_ADMIN_ROUTES = [
  "/cerrt-ops/login",
  "/cerrt-ops/forgot-password",
  "/cerrt-ops/reset-password",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Hard 404 for any legacy /admin requests (makes old path completely dead & hidden)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.rewrite(new URL("/not-found", request.url), {
      status: 404,
    });
  }

  // 2. Protect /cerrt-ops routes
  if (pathname === "/cerrt-ops" || pathname.startsWith("/cerrt-ops/")) {
    // Always allow public auth routes
    if (PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check for valid session cookie
    const hasSession = request.cookies.has(SESSION_COOKIE);

    // If unauthenticated, return a 404 (appears non-existent to scanners/unauthenticated users)
    if (!hasSession) {
      return NextResponse.rewrite(new URL("/not-found", request.url), {
        status: 404,
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/cerrt-ops/:path*", "/cerrt-ops"],
};
