import type {
  GameDiscountEvent,
  GameDiscountEventListItem,
  GameDiscountEventListResponse,
} from './game-discount-event.types.ts';
import type { SteamGameSummary } from './steam-game.types.ts';
import { parseLimit } from './steam-game-search.ts';

export function listDiscountEvents(
  events: GameDiscountEvent[],
  games: SteamGameSummary[],
  limit: number | null | undefined,
  cursor?: string | null,
): GameDiscountEventListResponse {
  const gameMap = new Map<string, SteamGameSummary>();
  for (const game of games) {
    gameMap.set(game.steamId, game);
  }

  // Join events to games and exclude orphans
  const items: GameDiscountEventListItem[] = [];
  for (const event of events) {
    const game = gameMap.get(event.steamId);
    if (!game) {
      continue;
    }

    items.push({
      id: event.id,
      steamId: event.steamId,
      startAt: event.startAt,
      endAt: event.endAt,
      discountPercent: event.discountPercent,
      discountedPrice: event.discountedPrice,
      type: event.type,
      game: {
        steamId: game.steamId,
        nameEn: game.nameEn,
        nameZh: game.nameZh,
        capsuleImage: game.capsuleImage,
      },
    });
  }

  // Sort by startAt descending
  items.sort(
    (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
  );

  // Paginate using offset pattern
  const total = items.length;
  const normalizedLimit = parseLimit(limit);
  const offset = cursor ? Number.parseInt(cursor, 10) : 0;
  const effectiveOffset = Number.isNaN(offset) ? 0 : offset;
  const sliced = items.slice(
    effectiveOffset,
    effectiveOffset + normalizedLimit,
  );

  const nextOffset = effectiveOffset + normalizedLimit;
  const hasNextPage = nextOffset < total;

  return {
    items: sliced,
    pageInfo: {
      limit: normalizedLimit,
      nextCursor: hasNextPage ? String(nextOffset) : null,
      hasNextPage,
    },
    total,
  };
}
