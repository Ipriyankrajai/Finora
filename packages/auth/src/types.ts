import type { auth } from "./config";

// Infer types from Better Auth
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

// Custom types for your application
export interface AuthUser extends User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
}

export interface AuthSession {
  session: Session;
  user: AuthUser;
}

// Auth state types
export type AuthState = 
  | { status: "loading" }
  | { status: "authenticated"; session: AuthSession }
  | { status: "unauthenticated" };

// Sign in/up form types
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends SignInFormData {
  name: string;
  confirmPassword?: string;
}

// OAuth provider types
export type OAuthProvider = "google" | "github";

export interface OAuthConfig {
  provider: OAuthProvider;
  callbackURL?: string;
}

