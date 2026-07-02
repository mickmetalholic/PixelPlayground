import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { DiscountNewsServicePort } from '../context.ts';
import { getAllDiscountEvents } from '../steam/game-discount-event.mock.ts';
import { listDiscountEvents } from '../steam/game-discount-event-search.ts';
import { GameDiscountNewsErrorCode } from '../steam/game-discount-news-entry.types.ts';
import { getAllGames } from '../steam/steam-game.mock.ts';
import type { SteamGameSummary } from '../steam/steam-game.types.ts';
import { SteamErrorCode } from '../steam/steam-game.types.ts';
import {
  findGameById,
  paginateGames,
  parseLimit,
  searchGames,
} from '../steam/steam-game-search.ts';
import { createRouter, publicProcedure } from '../trpc.ts';

const gamesInputSchema = z.object({
  q: z.string().optional().default(''),
  limit: z.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
});

const detailInputSchema = z.object({
  steamId: z.string().min(1, 'steamId is required'),
});

const collectInputSchema = z.object({
  steamId: z
    .string()
    .min(1, 'steamId is required')
    .regex(/^\d+$/, 'steamId must be a numeric string'),
});

const discountEventsInputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
});

const newsCycleStatusSchema = z.enum(['draft', 'ready']);

const createDraftInputSchema = z
  .object({
    type: z.literal('dailyDeal').optional(),
  })
  .optional();

const candidatesInputSchema = z.object({
  newsEntryId: z.string().min(1, 'newsEntryId is required'),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const updateSelectedEventsInputSchema = z.object({
  newsEntryId: z.string().min(1, 'newsEntryId is required'),
  selectedDiscountEventIds: z.array(z.string().min(1)).default([]),
});

const updateStatusInputSchema = z.object({
  newsEntryId: z.string().min(1, 'newsEntryId is required'),
  status: newsCycleStatusSchema,
});

function requireDiscountNewsService(
  service: DiscountNewsServicePort | undefined,
): DiscountNewsServicePort {
  if (!service) {
    throw new TRPCError({
      code: 'SERVICE_UNAVAILABLE',
      message: `${GameDiscountNewsErrorCode.SERVICE_UNAVAILABLE}: Discount news service is not available.`,
    });
  }

  return service;
}

async function callDiscountNews<T>(
  operation: (service: DiscountNewsServicePort) => Promise<T>,
  service: DiscountNewsServicePort | undefined,
): Promise<T> {
  try {
    return await operation(requireDiscountNewsService(service));
  } catch (error) {
    throw mapDiscountNewsError(error);
  }
}

function mapDiscountNewsError(error: unknown): unknown {
  if (!(error instanceof Error)) {
    return error;
  }

  if (error.message.includes(GameDiscountNewsErrorCode.ENTRY_NOT_FOUND)) {
    return new TRPCError({ code: 'NOT_FOUND', message: error.message });
  }

  if (
    error.message.includes(GameDiscountNewsErrorCode.INVALID_SELECTION) ||
    error.message.includes(GameDiscountNewsErrorCode.UNSUPPORTED_STRATEGY)
  ) {
    return new TRPCError({ code: 'BAD_REQUEST', message: error.message });
  }

  return error;
}

function toSummary(game: {
  steamId: string;
  nameEn: string;
  nameZh: string;
  capsuleImage: string;
  headerImage: string;
  releaseDate: string;
  developers: string[];
  publishers: string[];
  genres: string[];
  isFree: boolean;
  priceOverview: unknown;
  platforms: unknown;
  metadataStatus: string;
  sourceLanguageFallback: boolean;
  lastSyncedAt: string;
}): SteamGameSummary {
  return {
    steamId: game.steamId,
    nameEn: game.nameEn,
    nameZh: game.nameZh,
    capsuleImage: game.capsuleImage,
    headerImage: game.headerImage,
    releaseDate: game.releaseDate,
    developers: game.developers,
    publishers: game.publishers,
    genres: game.genres,
    isFree: game.isFree,
    priceOverview: game.priceOverview as SteamGameSummary['priceOverview'],
    platforms: game.platforms as SteamGameSummary['platforms'],
    metadataStatus: game.metadataStatus as SteamGameSummary['metadataStatus'],
    sourceLanguageFallback: game.sourceLanguageFallback,
    lastSyncedAt: game.lastSyncedAt,
  };
}

export const steamRouter = createRouter({
  games: publicProcedure
    .input(gamesInputSchema)
    .query(async ({ ctx, input }) => {
      if (ctx.services.steam) {
        return ctx.services.steam.getGames(input);
      }

      const allGames = getAllGames();
      const limit = parseLimit(input.limit);
      const summaries = allGames.map(toSummary);
      const filtered = searchGames(summaries, input.q);
      const { items, pageInfo, total } = paginateGames(
        filtered,
        limit,
        input.cursor ?? null,
      );

      return { items, pageInfo, query: input.q, total };
    }),

  detail: publicProcedure
    .input(detailInputSchema)
    .query(async ({ ctx, input }) => {
      if (ctx.services.steam) {
        return ctx.services.steam.getDetail(input.steamId);
      }

      const allGames = getAllGames();
      const game = findGameById(allGames, input.steamId);

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `${SteamErrorCode.UNKNOWN_DETAIL}: Steam game with ID "${input.steamId}" was not found.`,
        });
      }

      return game;
    }),

  collect: publicProcedure
    .input(collectInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.services.steam) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `${SteamErrorCode.UPSTREAM_FAILURE}: Steam collection is not available in this context.`,
        });
      }

      return ctx.services.steam.collect(input.steamId);
    }),

  discountEvents: publicProcedure
    .input(discountEventsInputSchema)
    .query(async ({ ctx, input }) => {
      if (ctx.services.discountEvents) {
        return ctx.services.discountEvents.getDiscountEvents(input);
      }

      const allEvents = getAllDiscountEvents();
      const allGames = getAllGames();
      return listDiscountEvents(allEvents, allGames, input.limit, input.cursor);
    }),

  currentDiscountEvents: publicProcedure
    .input(discountEventsInputSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.services.discountEvents) {
        throw new TRPCError({
          code: 'SERVICE_UNAVAILABLE',
          message:
            'DISCOUNT_EVENTS_SERVICE_UNAVAILABLE: Discount events service is not available.',
        });
      }

      return ctx.services.discountEvents.getCurrentDiscountEvents(input);
    }),

  discountNews: createRouter({
    createDraft: publicProcedure
      .input(createDraftInputSchema)
      .mutation(async ({ ctx, input }) => {
        return callDiscountNews(
          (service) => service.createDraft(input),
          ctx.services.discountNews,
        );
      }),

    entries: publicProcedure.query(async ({ ctx }) => {
      return callDiscountNews(
        (service) => service.listEntries(),
        ctx.services.discountNews,
      );
    }),

    candidates: publicProcedure
      .input(candidatesInputSchema)
      .query(async ({ ctx, input }) => {
        return callDiscountNews(
          (service) =>
            service.getCandidates(input.newsEntryId, { limit: input.limit }),
          ctx.services.discountNews,
        );
      }),

    updateSelectedEvents: publicProcedure
      .input(updateSelectedEventsInputSchema)
      .mutation(async ({ ctx, input }) => {
        return callDiscountNews(
          (service) =>
            service.updateSelectedEvents(
              input.newsEntryId,
              input.selectedDiscountEventIds,
            ),
          ctx.services.discountNews,
        );
      }),

    updateStatus: publicProcedure
      .input(updateStatusInputSchema)
      .mutation(async ({ ctx, input }) => {
        return callDiscountNews(
          (service) => service.updateStatus(input.newsEntryId, input.status),
          ctx.services.discountNews,
        );
      }),
  }),
});
