import { auth } from "./config";
import { headers } from "next/headers";

/**
 * Get the current session on the server side
 * Use this in Server Components, Server Actions, and API routes
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

/**
 * Require authentication - throws if not authenticated
 * Use this to protect server actions and API routes
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

/**
 * Get the current user or null
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Server-side sign out
 */
export async function serverSignOut() {
  await auth.api.signOut({
    headers: await headers(),
  });
}

