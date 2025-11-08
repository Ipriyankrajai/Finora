# tRPC Quick Start Guide

Get up and running with tRPC in your Finora app in 5 minutes.

## Step 1: Create API Route

In your Next.js app, create the tRPC API endpoint:

```typescript
// apps/web/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createContext } from '@finora/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ req }),
  });

export { handler as GET, handler as POST };
```

## Step 2: Add Provider

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
            url: process.env.NEXT_PUBLIC_APP_URL + '/api/trpc',
          }}
        >
          {children}
        </TRPCProvider>
      </body>
    </html>
  );
}
```

## Step 3: Use in Components

```typescript
'use client';

import { trpc } from '@finora/trpc/react';

export default function ExamplePage() {
  const { data } = trpc.example.hello.useQuery({ name: 'World' });
  
  return <h1>{data?.greeting}</h1>;
}
```

## Step 4: Add Your First Router

Create a new router for your feature:

```typescript
// packages/trpc/src/routers/posts.ts
import { z } from 'zod';
import { router, publicProcedure } from '../server';

export const postsRouter = router({
  getAll: publicProcedure.query(() => {
    return [
      { id: 1, title: 'Hello World' },
      { id: 2, title: 'tRPC is awesome' },
    ];
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return { id: input.id, title: 'Post ' + input.id };
    }),

  create: publicProcedure
    .input(z.object({ title: z.string() }))
    .mutation(({ input }) => {
      return { id: 3, title: input.title };
    }),
});
```

Register it in the main router:

```typescript
// packages/trpc/src/router.ts
import { router } from './server';
import { postsRouter } from './routers/posts';

export const appRouter = router({
  posts: postsRouter,
  // ... other routers
});

export type AppRouter = typeof appRouter;
```

## Step 5: Use Your New Router

Query:
```typescript
const { data } = trpc.posts.getAll.useQuery();
```

Mutation:
```typescript
const createPost = trpc.posts.create.useMutation();

const handleCreate = () => {
  createPost.mutate({ title: 'My New Post' });
};
```

## Next Steps

- Add authentication using `protectedProcedure`
- Integrate with your database
- Add input validation with Zod
- Implement error handling
- Add optimistic updates

Check out the full [README.md](./README.md) for more details!

