// Server exports
export { auth } from "./config";
export type { Auth } from "./config";


// Client exports
export { authClient, signIn, signUp, signOut, useSession } from "./client";
export { useAuth, useIsAuthenticated, useCurrentUser, useRequireAuth } from "./hooks";


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

export { getCookieCache } from "better-auth/cookies";

export {toNextJsHandler} from "better-auth/next-js";
