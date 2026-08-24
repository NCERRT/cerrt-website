import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "sessionId";
const PERSONAL_SESSION_COOKIE = "personalSessionId";
const MDA_SESSION_COOKIE = "mdaSessionId";

// Public auth routes that unauthenticated users need access to
const PUBLIC_ADMIN_ROUTES = [
  "/cerrt-ops/login",
  "/cerrt-ops/forgot-password",
  "/cerrt-ops/reset-password",
];

const PUBLIC_MDA_ROUTES = [
  "/mda-portal/login",
  "/mda-portal/register",
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

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

    // If unauthenticated, redirect smoothly to login with callbackUrl
    if (!hasSession) {
      const loginUrl = new URL("/cerrt-ops/login", request.url);
      const callbackPath = pathname + search;

      if (callbackPath !== "/cerrt-ops" && callbackPath !== "/cerrt-ops/") {
        loginUrl.searchParams.set("callbackUrl", callbackPath);
      }

      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect /my-reports/cases routes
  if (pathname === "/my-reports/cases" || pathname.startsWith("/my-reports/cases/")) {
    const hasPersonalSession = request.cookies.has(PERSONAL_SESSION_COOKIE);
    if (!hasPersonalSession) {
      return NextResponse.redirect(new URL("/my-reports", request.url));
    }
  }

  // 4. Protect /mda-portal routes (except /login and /register)
  if (pathname === "/mda-portal" || pathname.startsWith("/mda-portal/")) {
    if (PUBLIC_MDA_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    const hasMdaSession = request.cookies.has(MDA_SESSION_COOKIE);
    if (!hasMdaSession) {
      const loginUrl = new URL("/mda-portal/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/cerrt-ops/:path*",
    "/cerrt-ops",
    "/my-reports/cases/:path*",
    "/my-reports/cases",
    "/mda-portal/:path*",
    "/mda-portal",
  ],
};
