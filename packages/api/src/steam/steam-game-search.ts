import type { PageInfo, SteamGameSummary } from './steam-game.types.ts';

function normalizeQuery(text: string): string {
  return text.trim().toLowerCase();
}

export function searchGames(
  games: SteamGameSummary[],
  query: string,
): SteamGameSummary[] {
  const q = normalizeQuery(query);
  if (!q) return games;

  return games.filter((game) => {
    if (game.steamId.toLowerCase().includes(q)) return true;
    if (game.nameEn.toLowerCase().includes(q)) return true;
    if (game.nameZh.toLowerCase().includes(q)) return true;
    return false;
  });
}

export function paginateGames(
  games: SteamGameSummary[],
  limit: number,
  cursor: string | null,
): { items: SteamGameSummary[]; pageInfo: PageInfo; total: number } {
  const total = games.length;
  const offset = cursor ? Number.parseInt(cursor, 10) : 0;
  const effectiveOffset = Number.isNaN(offset) ? 0 : offset;
  const sliced = games.slice(effectiveOffset, effectiveOffset + limit);

  const nextOffset = effectiveOffset + limit;
  const hasNextPage = nextOffset < total;

  return {
    items: sliced,
    pageInfo: {
      limit,
      nextCursor: hasNextPage ? String(nextOffset) : null,
      hasNextPage,
    },
    total,
  };
}

export function parseLimit(value: number | null | undefined): number {
  if (value == null) return 20;
  if (value < 1) return 20;
  return Math.min(value, 100);
}

export function findGameById<T extends SteamGameSummary>(
  games: T[],
  steamId: string,
): T | undefined {
  return games.find((g) => g.steamId === steamId);
}
