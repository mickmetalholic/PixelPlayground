import type {
  AppContext,
  AppRouter,
  DiscountEventsServicePort,
  DiscountNewsServicePort,
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

function createLazyDiscountEventsService(
  getBackendClient: () => TRPCClient<AppRouter>,
  canReachBackend: () => boolean,
): DiscountEventsServicePort | undefined {
  if (!canReachBackend()) return undefined;

  return {
    getDiscountEvents: (params) =>
      getBackendClient().steam.discountEvents.query(params),
    getCurrentDiscountEvents: (params) =>
      getBackendClient().steam.currentDiscountEvents.query(params),
    getDiscountEventById: async (discountEventId) => {
      const result = await getBackendClient().steam.discountEvents.query({
        limit: 100,
      });
      return result.items.find((item) => item.id === discountEventId) ?? null;
    },
  };
}

function createLazyDiscountNewsService(
  getBackendClient: () => TRPCClient<AppRouter>,
  canReachBackend: () => boolean,
): DiscountNewsServicePort | undefined {
  if (!canReachBackend()) return undefined;

  return {
    createDraft: (params) =>
      getBackendClient().steam.discountNews.createDraft.mutate(params),
    listEntries: () => getBackendClient().steam.discountNews.entries.query(),
    getCandidates: (newsEntryId, params) =>
      getBackendClient().steam.discountNews.candidates.query({
        newsEntryId,
        limit: params?.limit,
      }),
    updateSelectedEvents: (newsEntryId, selectedDiscountEventIds) =>
      getBackendClient().steam.discountNews.updateSelectedEvents.mutate({
        newsEntryId,
        selectedDiscountEventIds,
      }),
    updateStatus: (newsEntryId, status) =>
      getBackendClient().steam.discountNews.updateStatus.mutate({
        newsEntryId,
        status,
      }),
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
  const canReachBackend = () => {
    try {
      getNestOrigin();
      return true;
    } catch {
      return false;
    }
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
      discountEvents: createLazyDiscountEventsService(
        getBackendClient,
        canReachBackend,
      ),
      discountNews: createLazyDiscountNewsService(
        getBackendClient,
        canReachBackend,
      ),
    },
  };
}
