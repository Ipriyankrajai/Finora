/**
 * Server-side tRPC initialization and context creation
 * Use this file to create your tRPC router and procedures
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

/**
 * Context type - extend this based on your needs
 * Add user session, database client, etc.
 */
export interface Context {
  userId?: string;
  // Add other context properties like db, session, etc.
}

/**
 * Create context for tRPC requests
 * This runs for every request
 */
export const createContext = async (opts?: {
  req?: Request;
}): Promise<Context> => {
  // Extract user from headers, session, etc.
  // Example: const userId = opts?.req?.headers.get('user-id');
  
  return {
    // userId,
    // db: prisma,
    // ... other context
  };
};

/**
 * Initialize tRPC with superjson transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && 'issues' in error.cause
            ? error.cause.issues
            : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * Protected procedure - requires authentication
 * Throws UNAUTHORIZED error if user is not authenticated
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // Infers that userId is non-nullable
      userId: ctx.userId,
    },
  });
});

/**
 * Middleware example - logging
 */
export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  
  console.log(`[tRPC] ${type} ${path} - ${durationMs}ms`);
  
  return result;
});

