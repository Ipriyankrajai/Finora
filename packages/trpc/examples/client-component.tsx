/**
 * Example: Using tRPC in a Client Component
 */

'use client';

import { trpc } from '@finora/trpc/react';
import { useState } from 'react';

export function ExampleClientComponent() {
  const [name, setName] = useState('World');
  
  // Query example
  const { data, isLoading, error } = trpc.example.hello.useQuery({ name });
  
  // Mutation example
  const mutation = trpc.example.create.useMutation({
    onSuccess: (data) => {
      console.log('Created:', data);
    },
  });
  
  // Utils for cache manipulation
  const utils = trpc.useUtils();
  
  const handleRefresh = () => {
    // Invalidate and refetch
    utils.example.hello.invalidate();
  };
  
  const handleOptimisticUpdate = () => {
    // Optimistic update
    utils.example.hello.setData({ name }, (old) => ({
      ...old,
      greeting: 'Updating...',
    }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data?.greeting}</h1>
      
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
      />
      
      <button onClick={handleRefresh}>
        Refresh
      </button>
      
      <button onClick={() => mutation.mutate({ title: 'Test' })}>
        Create
      </button>
    </div>
  );
}

