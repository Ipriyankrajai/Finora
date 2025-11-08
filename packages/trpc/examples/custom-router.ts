/**
 * Example: Creating a Custom Router
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@finora/trpc';

export const userRouter = router({
  // Public query - anyone can call
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Fetch from database
      return {
        id: input.id,
        name: 'John Doe',
        email: 'john@example.com',
      };
    }),

  // Public query with complex input
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      // Search users in database
      return {
        items: [],
        total: 0,
        hasMore: false,
      };
    }),

  // Protected mutation - requires authentication
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // ctx.userId is guaranteed to exist here
      // Update user in database
      return {
        id: ctx.userId,
        ...input,
      };
    }),

  // Protected mutation with file upload
  uploadAvatar: protectedProcedure
    .input(
      z.object({
        base64: z.string(),
        filename: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Upload file to storage
      const url = 'https://example.com/avatar.jpg';
      return { url };
    }),

  // Subscription example (requires WebSocket setup)
  onUserUpdate: publicProcedure
    .input(z.object({ id: z.string() }))
    .subscription(async function* ({ input }) {
      // Subscribe to user updates
      // yield { id: input.id, name: 'Updated Name' };
    }),
});

/**
 * Nested router example
 */
export const postsRouter = router({
  // Nested queries
  list: publicProcedure
    .input(
      z.object({
        authorId: z.string().optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      return {
        posts: [],
        total: 0,
      };
    }),

  // Nested mutations
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create post in database
      return {
        id: 'post-123',
        authorId: ctx.userId,
        ...input,
        createdAt: new Date(),
      };
    }),
});

