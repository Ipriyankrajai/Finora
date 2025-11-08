/**
 * Shared types and utilities for tRPC
 */

import type { AppRouter } from './router';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

/**
 * Infer input types from router
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Infer output types from router
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Helper to get specific procedure input type
 * Example: RouterInput<'example', 'hello'>
 */
export type RouterInput<
  TRouter extends keyof RouterInputs,
  TProcedure extends keyof RouterInputs[TRouter]
> = RouterInputs[TRouter][TProcedure];

/**
 * Helper to get specific procedure output type
 * Example: RouterOutput<'example', 'hello'>
 */
export type RouterOutput<
  TRouter extends keyof RouterOutputs,
  TProcedure extends keyof RouterOutputs[TRouter]
> = RouterOutputs[TRouter][TProcedure];

