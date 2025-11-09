import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieCache } from "@finora/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Configuration
  const protectedRoutes = ["/dashboard"];
  const publicRoutes = ["/login", "/signup"];
  const loginPath = "/login";
  const defaultRedirectPath = "/dashboard";

  // Verify session from cookie cache
  // getCookieCache validates the session token from the encrypted cookie cache
  // This is secure and works in Edge Runtime without database calls
  const session = await getCookieCache(request, {
    cookiePrefix: "finora", // Match the prefix from auth config
  });
  const hasSession = !!session;

  // Check if route is explicitly public (login, signup)
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route requires protection
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // RULE 2: If user has session, don't let them access login/signup pages
  // Redirect to dashboard
  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL(defaultRedirectPath, request.url));
  }

  // RULE 1: If no session and trying to access protected routes
  // Redirect to login
  if (!hasSession && isProtectedRoute) {
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // RULE 1: If no session and trying to access non-public routes
  // (anything that's not explicitly in publicRoutes)
  // Redirect to login
  if (!hasSession && !isPublicRoute) {
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access if authenticated or accessing public routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

