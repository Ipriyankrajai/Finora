/**
 * Vanilla tRPC client
 * Use this for non-React environments or server-side code
 */

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from './router';

/**
 * Create a vanilla tRPC client
 * @param url - The URL of your tRPC API endpoint
 * @param headers - Optional headers to include with requests
 */
export function createClient(url: string, headers?: Record<string, string>) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
        headers: async () => {
          return headers ?? {};
        },
        transformer: superjson,
      }),
    ],
  });
}

/**
 * Example usage:
 * const client = createClient('http://localhost:3000/api/trpc');
 * const result = await client.example.hello.query({ name: 'World' });
 */

