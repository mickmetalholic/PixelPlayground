'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createBrowserTrpcClient, trpc } from './client';
import { createQueryClient } from './query-client';

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  const [trpcClient] = useState(() => createBrowserTrpcClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
