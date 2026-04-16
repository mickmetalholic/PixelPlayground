import type { AppRouter } from '@pixel-playground/api';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

export const createBrowserTrpcClient = () =>
  trpc.createClient({
    links: [httpBatchLink({ url: '/api/trpc' })],
    transformer: superjson,
  });
