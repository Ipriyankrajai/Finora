/**
 * Example: Using tRPC in a Server Component
 * Server components can call tRPC procedures directly
 */

import { createCallerFactory } from '@finora/trpc';
import { appRouter } from '@finora/trpc';

// Create a server-side caller
const createCaller = createCallerFactory(appRouter);

export async function ExampleServerComponent() {
  // Create context for this request
  const caller = createCaller({
    userId: 'user-123', // Get from session
  });

  // Call procedures directly
  const data = await caller.example.hello({ name: 'Server' });
  const items = await caller.example.getAll();

  return (
    <div>
      <h1>{data.greeting}</h1>
      <ul>
        {items.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

