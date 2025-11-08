"use client";

import { useSession as useBetterAuthSession } from "./client";
import type { AuthState } from "./types";

/**
 * Custom hook to get the current auth state with proper typing
 */
export function useAuth(): AuthState {
  const { data: session, isPending } = useBetterAuthSession();

  if (isPending) {
    return { status: "loading" };
  }

  if (session) {
    return {
      status: "authenticated",
      session,
    };
  }

  return { status: "unauthenticated" };
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { status } = useAuth();
  return status === "authenticated";
}

/**
 * Hook to get the current user (null if not authenticated)
 */
export function useCurrentUser() {
  const { data: session } = useBetterAuthSession();
  return session?.user ?? null;
}

/**
 * Hook that requires authentication (returns null while loading)
 */
export function useRequireAuth() {
  const auth = useAuth();

  if (auth.status === "loading") {
    return null;
  }

  if (auth.status === "unauthenticated") {
    throw new Error("Authentication required");
  }

  return auth.session;
}

