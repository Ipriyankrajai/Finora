/**
 * Main entry point for @finora/trpc package
 * Export all public APIs
 */

// Server-side exports
export {
  router,
  publicProcedure,
  protectedProcedure,
  createContext,
  createCallerFactory,
  loggerMiddleware,
  type Context,
} from './server';

// Router exports
export { appRouter, type AppRouter } from './router';

// Client exports
export { createClient } from './client';

// React exports
export { trpc, TRPCProvider, type TRPCProviderConfig } from './react';

// Type exports
export type {
  RouterInputs,
  RouterOutputs,
  RouterInput,
  RouterOutput,
} from './types';

