import type { AppContext } from '@pixel-playground/api';
import type { AppService } from '../../app.service';
import type { GameDiscountEventsService } from '../game-discount-events/game-discount-events.service';
import type { GameDiscountNewsService } from '../game-discount-news/game-discount-news.service';
import type { SteamMetadataService } from '../steam-metadata/steam-metadata.service';

export const createNestTrpcContext =
  (
    appService: AppService,
    steamMetadataService: SteamMetadataService,
    discountEventsService: GameDiscountEventsService,
    discountNewsService: GameDiscountNewsService,
  ) =>
  async (): Promise<AppContext> => ({
    services: {
      home: {
        getSummary: async () => appService.getHello(),
      },
      steam: {
        getGames: async (params) =>
          steamMetadataService.getGames(params.q, params.limit, params.cursor),
        getDetail: async (steamId) => steamMetadataService.getDetail(steamId),
        collect: async (steamId) => steamMetadataService.collect(steamId),
      },
      discountEvents: {
        getDiscountEvents: async (params) =>
          discountEventsService.getDiscountEvents(params),
        getCurrentDiscountEvents: async (params) =>
          discountEventsService.getCurrentDiscountEvents(params),
        getDiscountEventById: async (discountEventId) =>
          discountEventsService.getDiscountEventById(discountEventId),
      },
      discountNews: {
        createDraft: async (params) => discountNewsService.createDraft(params),
        listEntries: async () => discountNewsService.listEntries(),
        getCandidates: async (newsEntryId, params) =>
          discountNewsService.getCandidates(newsEntryId, params),
        updateSelectedEvents: async (newsEntryId, selectedDiscountEventIds) =>
          discountNewsService.updateSelectedEvents(
            newsEntryId,
            selectedDiscountEventIds,
          ),
        updateStatus: async (newsEntryId, status) =>
          discountNewsService.updateStatus(newsEntryId, status),
      },
    },
  });
