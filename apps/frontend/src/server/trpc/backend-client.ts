import type { AppRouter } from '@pixel-playground/api';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

export function createBackendTrpcClient(nestOrigin: string) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${nestOrigin.replace(/\/$/, '')}/trpc`,
        transformer: superjson,
      }),
    ],
  });
}
