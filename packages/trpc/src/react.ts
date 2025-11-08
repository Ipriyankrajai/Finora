/**
 * React Query + tRPC integration
 * Use this for React/Next.js applications
 */

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import type { AppRouter } from './router';

/**
 * Create tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Configuration options for tRPC provider
 */
export interface TRPCProviderConfig {
  url: string;
  headers?: () => Record<string, string> | Promise<Record<string, string>>;
}

/**
 * tRPC Provider component for React applications
 * Wrap your app with this provider to use tRPC hooks
 */
export function TRPCProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: TRPCProviderConfig;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000, // 5 seconds
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: config.url,
          headers: config.headers,
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

/**
 * Example usage in Next.js app:
 * 
 * import { TRPCProvider } from '@finora/trpc/react';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <TRPCProvider config={{ url: 'http://localhost:3000/api/trpc' }}>
 *           {children}
 *         </TRPCProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * 
 * Then in your components:
 * 
 * import { trpc } from '@finora/trpc/react';
 * 
 * export function MyComponent() {
 *   const { data } = trpc.example.hello.useQuery({ name: 'World' });
 *   return <div>{data?.greeting}</div>;
 * }
 */

