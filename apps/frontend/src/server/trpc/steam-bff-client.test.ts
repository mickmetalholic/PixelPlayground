import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SteamMetadataBffClient } from './steam-bff-client';

describe('SteamMetadataBffClient', () => {
  const mockFetch = vi.fn();
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
    vi.restoreAllMocks();
  });

  it('getGames sends GET to /steam/games', async () => {
    const client = new SteamMetadataBffClient('http://localhost:3000');
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [],
          pageInfo: { limit: 20, hasNextPage: false, nextCursor: null },
          query: '',
          total: 0,
        }),
    });

    await client.getGames({ q: 'dota', limit: 10 });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/steam/games?q=dota&limit=10',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('getDetail sends GET to /steam/games/:steamId', async () => {
    const client = new SteamMetadataBffClient('http://localhost:3000');
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ steamId: '570', nameEn: 'Dota 2' }),
    });

    const result = await client.getDetail('570');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/steam/games/570',
      expect.any(Object),
    );
    expect(result.steamId).toBe('570');
  });

  it('collect sends POST to /steam/games/collect', async () => {
    const client = new SteamMetadataBffClient('http://localhost:3000');
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ steamId: '1091500', nameEn: 'Cyberpunk 2077' }),
    });

    const result = await client.collect('1091500');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/steam/games/collect?steamId=1091500',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.steamId).toBe('1091500');
  });

  it('maps STEAM_GAME_NOT_FOUND to TRPCError NOT_FOUND', async () => {
    const client = new SteamMetadataBffClient('http://localhost:3000');
    mockFetch.mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          code: 'STEAM_GAME_NOT_FOUND',
          message: 'Game not found',
        }),
    });

    await expect(client.getDetail('999999')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('maps STEAM_INVALID_APPID to TRPCError BAD_REQUEST', async () => {
    const client = new SteamMetadataBffClient('http://localhost:3000');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          code: 'STEAM_INVALID_APPID',
          message: 'Invalid AppID',
        }),
    });

    await expect(client.collect('abc')).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });

  it('maps STEAM_UPSTREAM_FAILURE to TRPCError BAD_GATEWAY', async () => {
    const client = new SteamMetadataBffClient('http://localhost:3000');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: () =>
        Promise.resolve({
          code: 'STEAM_UPSTREAM_FAILURE',
          message: 'Steam error',
        }),
    });

    await expect(client.collect('999999')).rejects.toMatchObject({
      code: 'BAD_GATEWAY',
    });
  });
});
