/**
 * Example middleware configuration
 * Create this file in your Next.js app at: middleware.ts (root of app directory)
 */

import { createAuthMiddleware } from "@finora/auth/middleware";

// Option 1: Use default middleware
export { authMiddleware as middleware } from "@finora/auth/middleware";

// Option 2: Create custom middleware with your configuration
export const middleware = createAuthMiddleware({
  // Routes that require authentication
  protectedRoutes: [
    "/dashboard",
    "/profile",
    "/settings",
    "/api/protected",
  ],
  
  // Routes that are always public (even if they match protected routes)
  publicRoutes: [
    "/",
    "/login",
    "/signup",
    "/about",
    "/api/public",
  ],
  
  // Where to redirect unauthenticated users
  loginPath: "/login",
  
  // Where to redirect after successful login
  defaultRedirectPath: "/dashboard",
});

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

