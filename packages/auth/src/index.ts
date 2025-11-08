// Server exports
export { auth } from "./config";
export type { Auth } from "./config";
export {
  getSession,
  requireAuth,
  getCurrentUser,
  isAuthenticated,
  serverSignOut,
} from "./server";

// Client exports
export { authClient, signIn, signUp, signOut, useSession } from "./client";
export { useAuth, useIsAuthenticated, useCurrentUser, useRequireAuth } from "./hooks";

// Middleware exports
export { createAuthMiddleware, authMiddleware } from "./middleware";
export type { AuthMiddlewareConfig } from "./middleware";

// Type exports
export type {
  Session,
  User,
  AuthUser,
  AuthSession,
  AuthState,
  SignInFormData,
  SignUpFormData,
  OAuthProvider,
  OAuthConfig,
} from "./types";

