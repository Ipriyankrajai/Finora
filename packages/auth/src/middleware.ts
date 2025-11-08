import { auth } from "./config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export interface AuthMiddlewareConfig {
  /**
   * Routes that require authentication
   */
  protectedRoutes?: string[];
  /**
   * Routes that are public (override protected routes)
   */
  publicRoutes?: string[];
  /**
   * Redirect path for unauthenticated users
   * @default "/login"
   */
  loginPath?: string;
  /**
   * Redirect path after successful login
   * @default "/dashboard"
   */
  defaultRedirectPath?: string;
}

/**
 * Create auth middleware with custom configuration
 */
export function createAuthMiddleware(config: AuthMiddlewareConfig = {}) {
  const {
    protectedRoutes = ["/dashboard"],
    publicRoutes = ["/login", "/signup", "/"],
    loginPath = "/login",
    defaultRedirectPath = "/dashboard",
  } = config;

  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if route is explicitly public
    const isPublicRoute = publicRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Check if route requires protection
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Allow public routes
    if (isPublicRoute && !isProtectedRoute) {
      return NextResponse.next();
    }

    // Get session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from login/signup
    if (
      session &&
      (pathname.startsWith("/login") || pathname.startsWith("/signup"))
    ) {
      return NextResponse.redirect(new URL(defaultRedirectPath, request.url));
    }

    return NextResponse.next();
  };
}

/**
 * Default auth middleware with common configuration
 */
export const authMiddleware = createAuthMiddleware();

