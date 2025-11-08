# @finora/trpc

Type-safe API layer using tRPC with TanStack React Query integration for the Finora monorepo.

## Features

- 🔒 End-to-end type safety
- ⚡ React Query integration
- 🔄 Request batching and caching
- 🛡️ Built-in authentication middleware
- 📦 Superjson transformer for Date, Map, Set support
- 🎯 Next.js App Router compatible

## Installation

```bash
bun install
```

## Quick Start

### 1. Set up the API Route (Next.js App Router)

Create an API route handler in your Next.js app:

```typescript
// apps/web/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createContext } from '@finora/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
```

### 2. Add tRPC Provider to Your App

Wrap your app with the TRPCProvider:

```typescript
// apps/web/app/layout.tsx
import { TRPCProvider } from '@finora/trpc/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider
          config={{
            url: 'http://localhost:3000/api/trpc',
            headers: async () => ({
              // Add auth headers here
              // authorization: `Bearer ${token}`,
            }),
          }}
        >
          {children}
        </TRPCProvider>
      </body>
    </html>
  );
}
```

### 3. Use tRPC in Your Components

```typescript
// apps/web/app/page.tsx
'use client';

import { trpc } from '@finora/trpc/react';

export default function HomePage() {
  const { data, isLoading } = trpc.example.hello.useQuery({
    name: 'Finora',
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{data?.greeting}</div>;
}
```

## Creating Your Own Routers

### 1. Define a Router

Create a new router file:

```typescript
// packages/trpc/src/routers/user.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../server';

export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Fetch user from database
      return { id: input.id, name: 'John Doe' };
    }),

  updateProfile: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ctx.userId is available and type-safe here
      // Update user in database
      return { success: true };
    }),
});
```

### 2. Add Router to App Router

```typescript
// packages/trpc/src/router.ts
import { router } from './server';
import { userRouter } from './routers/user';

export const appRouter = router({
  user: userRouter,
  // Add more routers...
});

export type AppRouter = typeof appRouter;
```

## Advanced Usage

### Server-Side Calls

Use the vanilla client for server-side calls:

```typescript
import { createClient } from '@finora/trpc/client';

const client = createClient('http://localhost:3000/api/trpc');
const result = await client.example.hello.query({ name: 'Server' });
```

### Type-Safe Inputs and Outputs

```typescript
import type { RouterInput, RouterOutput } from '@finora/trpc/types';

type HelloInput = RouterInput<'example', 'hello'>;
type HelloOutput = RouterOutput<'example', 'hello'>;
```

### Custom Context

Extend the context in `server.ts`:

```typescript
export interface Context {
  userId?: string;
  db: PrismaClient;
  req: Request;
}

export const createContext = async (opts: { req: Request }): Promise<Context> => {
  const userId = getUserFromRequest(opts.req);
  return {
    userId,
    db: prisma,
    req: opts.req,
  };
};
```

### Mutations

```typescript
// In your component
const mutation = trpc.user.updateProfile.useMutation({
  onSuccess: () => {
    console.log('Profile updated!');
  },
});

const handleUpdate = () => {
  mutation.mutate({ name: 'New Name' });
};
```

### Optimistic Updates

```typescript
const utils = trpc.useUtils();

const mutation = trpc.user.updateProfile.useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await utils.user.getById.cancel();

    // Snapshot previous value
    const previousData = utils.user.getById.getData();

    // Optimistically update
    utils.user.getById.setData({ id: '1' }, (old) => ({
      ...old,
      ...newData,
    }));

    return { previousData };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    utils.user.getById.setData({ id: '1' }, context?.previousData);
  },
});
```

## React Query Features

All React Query features are available:

```typescript
const { data, isLoading, error, refetch } = trpc.example.hello.useQuery(
  { name: 'World' },
  {
    enabled: true,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  }
);
```

## API Reference

### Server Exports

- `router` - Create a new tRPC router
- `publicProcedure` - Public procedure (no auth required)
- `protectedProcedure` - Protected procedure (auth required)
- `createContext` - Context creation function
- `loggerMiddleware` - Logging middleware

### Client Exports

- `createClient` - Create vanilla tRPC client
- `TRPCProvider` - React provider component
- `trpc` - React Query hooks

### Type Exports

- `RouterInputs` - All router input types
- `RouterOutputs` - All router output types
- `RouterInput<router, procedure>` - Specific input type
- `RouterOutput<router, procedure>` - Specific output type

## Learn More

- [tRPC Documentation](https://trpc.io)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Superjson](https://github.com/blitz-js/superjson)

## License

MIT

