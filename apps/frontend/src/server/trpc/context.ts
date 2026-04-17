import type { AppContext, AppRouter } from '@pixel-playground/api';
import type { TRPCClient } from '@trpc/client';
import { getNestOriginFromEnv } from '@/lib/nest/nest-origin';
import { createBackendTrpcClient } from './backend-client';

export async function createFrontendTrpcContext(
  client?: TRPCClient<AppRouter>,
): Promise<AppContext> {
  const backendClient =
    client ?? createBackendTrpcClient(getNestOriginFromEnv());

  return {
    services: {
      home: {
        getSummary: async () => {
          const result = await backendClient.home.summary.query();
          return result.summary;
        },
      },
    },
  };
}
