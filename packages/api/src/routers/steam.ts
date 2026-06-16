import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getAllDiscountEvents } from '../steam/game-discount-event.mock.ts';
import { listDiscountEvents } from '../steam/game-discount-event-search.ts';
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
    .query(async ({ input }) => {
      const allEvents = getAllDiscountEvents();
      const allGames = getAllGames();
      return listDiscountEvents(allEvents, allGames, input.limit, input.cursor);
    }),
});
