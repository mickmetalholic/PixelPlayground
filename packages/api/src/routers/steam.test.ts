import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import { appRouter } from './_app';

const baseCtx = {
  services: { home: { getSummary: vi.fn() } },
};

describe('steam.games', () => {
  it('returns all games with default pagination', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.games({});

    expect(result.items.length).toBeGreaterThanOrEqual(7);
    expect(result.total).toBeGreaterThanOrEqual(7);
    expect(result.query).toBe('');
    expect(result.pageInfo.limit).toBe(20);
  });

  it('filters by SteamID', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.games({ q: '1091500' });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].steamId).toBe('1091500');
  });

  it('filters by English name', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.games({ q: 'stardew' });

    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.items[0].nameEn).toBe('Stardew Valley');
  });

  it('filters by Chinese name', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.games({ q: '赛博朋克' });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].nameEn).toBe('Cyberpunk 2077');
  });

  it('respects limit', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.games({ limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('returns empty array for non-matching query', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.games({ q: 'zzznonexistent' });

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('validates limit bounds', async () => {
    const caller = appRouter.createCaller(baseCtx);

    await expect(caller.steam.games({ limit: 0 })).rejects.toThrow(TRPCError);
    await expect(caller.steam.games({ limit: 101 })).rejects.toThrow(TRPCError);
  });
});

describe('steam.detail', () => {
  it('returns detail for existing SteamID', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.detail({ steamId: '1091500' });

    expect(result.steamId).toBe('1091500');
    expect(result.nameEn).toBe('Cyberpunk 2077');
    expect(result.shortDescription).toBeTruthy();
    expect(result.detailedDescription).toBeTruthy();
    expect(result.supportedLanguages[0]).toEqual({
      name: 'English',
      interface: true,
      fullAudio: true,
      subtitles: true,
    });
  });

  it('returns detail for Dota 2', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.detail({ steamId: '570' });

    expect(result.nameEn).toBe('Dota 2');
    expect(result.isFree).toBe(true);
    expect(result.priceOverview).toBeNull();
  });

  it('throws NOT_FOUND for unknown SteamID', async () => {
    const caller = appRouter.createCaller(baseCtx);

    try {
      await caller.steam.detail({ steamId: 'unknown' });
      expect.unreachable('Expected TRPCError');
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe('NOT_FOUND');
      expect((error as TRPCError).message).toContain('STEAM_UNKNOWN_DETAIL');
    }
  });
});

describe('steam.discountEvents', () => {
  it('returns discount events with joined game summaries', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.discountEvents({});

    expect(result.items).toHaveLength(4);
    expect(result.total).toBe(4);
    expect(result.items[0]).toHaveProperty('game');
    expect(result.items[0].game.steamId).toBeTruthy();
    expect(result.items[0].game.nameEn).toBeTruthy();
    expect(result.items[0].game.nameZh).toBeTruthy();
    expect(result.items[0].game.capsuleImage).toBeTruthy();
  });

  it('items are sorted by startAt descending', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.discountEvents({});

    for (let i = 1; i < result.items.length; i++) {
      expect(
        new Date(result.items[i - 1].startAt).getTime(),
      ).toBeGreaterThanOrEqual(new Date(result.items[i].startAt).getTime());
    }
  });

  it('limit restricts count', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.discountEvents({ limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('orphan event is excluded from results', async () => {
    const caller = appRouter.createCaller(baseCtx);
    const result = await caller.steam.discountEvents({});

    const hasOrphan = result.items.some((item) => item.steamId === '999999');
    expect(hasOrphan).toBe(false);
  });
});

describe('steam.collect', () => {
  it('rejects blank steamId', async () => {
    const caller = appRouter.createCaller(baseCtx);

    await expect(caller.steam.collect({ steamId: '' })).rejects.toThrow(
      TRPCError,
    );
  });

  it('rejects non-numeric steamId', async () => {
    const caller = appRouter.createCaller(baseCtx);

    await expect(caller.steam.collect({ steamId: 'abc' })).rejects.toThrow(
      TRPCError,
    );
    await expect(caller.steam.collect({ steamId: '1091500a' })).rejects.toThrow(
      TRPCError,
    );
  });

  it('rejects collect when steam service is not available', async () => {
    const caller = appRouter.createCaller(baseCtx);

    try {
      await caller.steam.collect({ steamId: '1091500' });
      expect.unreachable('Expected TRPCError');
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe('INTERNAL_SERVER_ERROR');
    }
  });

  it('delegates to steam service when available', async () => {
    const mockService = {
      getGames: vi.fn(),
      getDetail: vi.fn(),
      collect: vi.fn().mockResolvedValue({ steamId: '1091500' }),
    };

    const ctx = {
      services: { home: { getSummary: vi.fn() }, steam: mockService },
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.steam.collect({ steamId: '1091500' });

    expect(result.steamId).toBe('1091500');
    expect(mockService.collect).toHaveBeenCalledWith('1091500');
  });

  it('delegates list and detail to steam service when available', async () => {
    const mockService = {
      getGames: vi.fn().mockResolvedValue({
        items: [],
        pageInfo: { limit: 20, hasNextPage: false, nextCursor: null },
        query: '',
        total: 0,
      }),
      getDetail: vi
        .fn()
        .mockRejectedValue(
          new TRPCError({ code: 'NOT_FOUND', message: 'STEAM_GAME_NOT_FOUND' }),
        ),
      collect: vi.fn(),
    };

    const ctx = {
      services: { home: { getSummary: vi.fn() }, steam: mockService },
    };

    const caller = appRouter.createCaller(ctx);
    const gamesResult = await caller.steam.games({ q: 'stardew' });

    expect(gamesResult.total).toBe(0);
    expect(mockService.getGames).toHaveBeenCalledWith({
      q: 'stardew',
      limit: 20,
      cursor: undefined,
    });

    await expect(
      caller.steam.detail({ steamId: 'unknown' }),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    expect(mockService.getDetail).toHaveBeenCalledWith('unknown');
  });
});
