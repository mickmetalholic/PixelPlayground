import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getAllGames } from '../steam/steam-game.mock.ts';
import type { SteamGameSummary } from '../steam/steam-game.types.ts';
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
  games: publicProcedure.input(gamesInputSchema).query(async ({ input }) => {
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

  detail: publicProcedure.input(detailInputSchema).query(async ({ input }) => {
    const allGames = getAllGames();
    const game = findGameById(allGames, input.steamId);

    if (!game) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `STEAM_GAME_NOT_FOUND: Steam game with ID "${input.steamId}" was not found.`,
      });
    }

    return game;
  }),
});
