import { appRouter } from '@pixel-playground/api';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createFrontendTrpcContext } from '@/server/trpc/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createFrontendTrpcContext(),
  });

export { handler as GET, handler as POST };
