/**
 * Example API route handler for Better Auth
 * Create this file in your Next.js app at: app/api/auth/[...all]/route.ts
 */

import { auth } from "@finora/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

/**
 * This automatically handles all authentication endpoints:
 * 
 * POST /api/auth/sign-in/email - Email/password sign in
 * POST /api/auth/sign-up/email - Email/password sign up
 * POST /api/auth/sign-out - Sign out
 * GET  /api/auth/session - Get current session
 * GET  /api/auth/callback/google - OAuth callback for Google
 * GET  /api/auth/callback/github - OAuth callback for GitHub
 * 
 * And many more endpoints for:
 * - Password reset
 * - Email verification
 * - Session management
 * - OAuth flows
 */

