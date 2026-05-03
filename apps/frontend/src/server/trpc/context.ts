import type { AppContext, AppRouter } from '@pixel-playground/api';
import type { TRPCClient } from '@trpc/client';
import { getNestOriginFromEnv } from '@/lib/nest/nest-origin';
import { createBackendTrpcClient } from './backend-client';

type BackendClientFactory = (nestOrigin: string) => TRPCClient<AppRouter>;

type FrontendTrpcContextOptions = {
  createBackendClient?: BackendClientFactory;
  getNestOrigin?: () => string;
};

export async function createFrontendTrpcContext(
  client?: TRPCClient<AppRouter>,
  options: FrontendTrpcContextOptions = {},
): Promise<AppContext> {
  const createBackendClient =
    options.createBackendClient ?? createBackendTrpcClient;
  const getNestOrigin = options.getNestOrigin ?? getNestOriginFromEnv;
  let backendClient = client;

  const getBackendClient = () => {
    backendClient ??= createBackendClient(getNestOrigin());
    return backendClient;
  };

  return {
    services: {
      home: {
        getSummary: async () => {
          const result = await getBackendClient().home.summary.query();
          return result.summary;
        },
      },
    },
  };
}
