/**
 * Main tRPC router
 * Add your procedure routers here
 */

import { router, publicProcedure } from './server';
import { z } from 'zod';

/**
 * Example router - replace with your actual routers
 */
export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'World'}!`,
      };
    }),
  
  getAll: publicProcedure.query(() => {
    return {
      items: ['item1', 'item2', 'item3'],
    };
  }),
});

/**
 * Main app router - compose all your routers here
 */
export const appRouter = router({
  example: exampleRouter,
  // Add more routers here:
  // user: userRouter,
  // post: postRouter,
  // etc.
});

// Export type definition of API
export type AppRouter = typeof appRouter;

