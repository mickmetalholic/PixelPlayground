import type {
  AppContext,
  AppRouter,
  SteamServicePort,
} from '@pixel-playground/api';
import type { TRPCClient } from '@trpc/client';
import { getNestOriginFromEnv } from '@/lib/nest/nest-origin';
import { createBackendTrpcClient } from './backend-client';
import { SteamMetadataBffClient } from './steam-bff-client';

type BackendClientFactory = (nestOrigin: string) => TRPCClient<AppRouter>;

type FrontendTrpcContextOptions = {
  createBackendClient?: BackendClientFactory;
  getNestOrigin?: () => string;
};

function createLazySteamService(
  getNestOrigin: () => string,
): SteamServicePort | undefined {
  let client: SteamMetadataBffClient | undefined;

  function getClient(): SteamMetadataBffClient {
    if (!client) {
      client = new SteamMetadataBffClient(getNestOrigin());
    }
    return client;
  }

  try {
    getNestOrigin();
  } catch {
    return undefined;
  }

  return {
    getGames: (params) => getClient().getGames(params),
    getDetail: (steamId) => getClient().getDetail(steamId),
    collect: (steamId) => getClient().collect(steamId),
  };
}

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
      steam: createLazySteamService(getNestOrigin),
    },
  };
}
