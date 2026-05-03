import { describe, expect, it } from 'vitest';
import type { SteamGameSummary } from './steam-game.types.ts';
import {
  findGameById,
  paginateGames,
  parseLimit,
  searchGames,
} from './steam-game-search.ts';

const testGames: SteamGameSummary[] = [
  {
    steamId: '1091500',
    nameEn: 'Cyberpunk 2077',
    nameZh: '赛博朋克 2077',
    capsuleImage: '',
    headerImage: '',
    releaseDate: '2020-12-10',
    developers: ['CD PROJEKT RED'],
    publishers: ['CD PROJEKT RED'],
    genres: ['RPG'],
    isFree: false,
    priceOverview: null,
    platforms: { windows: true, mac: false, linux: false },
    metadataStatus: 'ready',
    sourceLanguageFallback: false,
    lastSyncedAt: '2026-05-03T00:00:00Z',
  },
  {
    steamId: '570',
    nameEn: 'Dota 2',
    nameZh: '刀塔 2',
    capsuleImage: '',
    headerImage: '',
    releaseDate: '2013-07-09',
    developers: ['Valve'],
    publishers: ['Valve'],
    genres: ['MOBA'],
    isFree: true,
    priceOverview: null,
    platforms: { windows: true, mac: true, linux: true },
    metadataStatus: 'ready',
    sourceLanguageFallback: false,
    lastSyncedAt: '2026-05-03T00:00:00Z',
  },
  {
    steamId: '413150',
    nameEn: 'Stardew Valley',
    nameZh: '星露谷物语',
    capsuleImage: '',
    headerImage: '',
    releaseDate: '2016-02-27',
    developers: ['ConcernedApe'],
    publishers: ['ConcernedApe'],
    genres: ['RPG'],
    isFree: false,
    priceOverview: null,
    platforms: { windows: true, mac: true, linux: true },
    metadataStatus: 'ready',
    sourceLanguageFallback: false,
    lastSyncedAt: '2026-05-03T00:00:00Z',
  },
];

describe('searchGames', () => {
  it('returns all games when query is empty', () => {
    expect(searchGames(testGames, '')).toHaveLength(3);
  });

  it('searches by SteamID', () => {
    const results = searchGames(testGames, '1091500');
    expect(results).toHaveLength(1);
    expect(results[0].steamId).toBe('1091500');
  });

  it('searches by English name', () => {
    const results = searchGames(testGames, 'cyberpunk');
    expect(results).toHaveLength(1);
    expect(results[0].nameEn).toBe('Cyberpunk 2077');
  });

  it('searches by Chinese name', () => {
    const results = searchGames(testGames, '星露谷');
    expect(results).toHaveLength(1);
    expect(results[0].nameZh).toBe('星露谷物语');
  });

  it('returns empty for non-matching query', () => {
    expect(searchGames(testGames, 'nonexistent')).toHaveLength(0);
  });
});

describe('paginateGames', () => {
  it('returns all items with default pagination', () => {
    const { items, pageInfo, total } = paginateGames(testGames, 20, null);
    expect(items).toHaveLength(3);
    expect(total).toBe(3);
    expect(pageInfo.hasNextPage).toBe(false);
    expect(pageInfo.nextCursor).toBeNull();
  });

  it('respects limit', () => {
    const { items, pageInfo } = paginateGames(testGames, 2, null);
    expect(items).toHaveLength(2);
    expect(pageInfo.hasNextPage).toBe(true);
    expect(pageInfo.nextCursor).toBe('2');
  });

  it('handles cursor offset', () => {
    const { items } = paginateGames(testGames, 2, '2');
    expect(items).toHaveLength(1);
    expect(items[0].steamId).toBe('413150');
  });

  it('handles invalid cursor as 0', () => {
    const { items, pageInfo } = paginateGames(testGames, 20, 'invalid');
    expect(items).toHaveLength(3);
    expect(pageInfo.hasNextPage).toBe(false);
  });
});

describe('parseLimit', () => {
  it('returns default for null', () => {
    expect(parseLimit(null)).toBe(20);
  });

  it('returns default for undefined', () => {
    expect(parseLimit(undefined)).toBe(20);
  });

  it('uses valid number', () => {
    expect(parseLimit(10)).toBe(10);
  });

  it('caps at 100', () => {
    expect(parseLimit(200)).toBe(100);
  });

  it('returns default for values below 1', () => {
    expect(parseLimit(0)).toBe(20);
  });
});

describe('findGameById', () => {
  it('finds existing game', () => {
    const game = findGameById(testGames, '570');
    expect(game).toBeDefined();
    expect(game?.nameEn).toBe('Dota 2');
  });

  it('returns undefined for missing game', () => {
    expect(findGameById(testGames, '999999')).toBeUndefined();
  });
});
