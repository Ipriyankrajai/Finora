import { createAuthMiddleware } from "@finora/auth";

export const middleware = createAuthMiddleware({
  protectedRoutes: ["/dashboard"],
  publicRoutes: ["/", "/login", "/signup"],
  loginPath: "/login",
  defaultRedirectPath: "/dashboard",
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

