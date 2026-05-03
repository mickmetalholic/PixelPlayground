import type {
  SteamGameDetail,
  SteamGameListResponse,
  SteamServicePort,
} from '@pixel-playground/api';
import { SteamErrorCode } from '@pixel-playground/api';
import { TRPCError } from '@trpc/server';
import { getNestOriginFromEnv } from '@/lib/nest/nest-origin';

export class SteamMetadataBffClient implements SteamServicePort {
  constructor(private readonly nestOrigin: string) {}

  static fromEnv(): SteamMetadataBffClient {
    return new SteamMetadataBffClient(getNestOriginFromEnv());
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.nestOrigin}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const code = (body as { code?: string }).code;
      throw this.mapError(
        code ?? 'UNKNOWN',
        (body as { message?: string }).message ?? `HTTP ${response.status}`,
      );
    }

    return response.json() as Promise<T>;
  }

  private mapError(code: string, message: string): TRPCError {
    switch (code) {
      case 'STEAM_INVALID_APPID':
        return new TRPCError({
          code: 'BAD_REQUEST',
          message: `${SteamErrorCode.INVALID_APPID}: ${message}`,
        });
      case 'STEAM_GAME_NOT_FOUND':
        return new TRPCError({
          code: 'NOT_FOUND',
          message: `${SteamErrorCode.GAME_NOT_FOUND}: ${message}`,
        });
      case 'STEAM_UPSTREAM_FAILURE':
        return new TRPCError({
          code: 'BAD_GATEWAY',
          message: `${SteamErrorCode.UPSTREAM_FAILURE}: ${message}`,
        });
      default:
        return new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }

  async getGames(params: {
    q?: string;
    limit?: number;
    cursor?: string;
  }): Promise<SteamGameListResponse> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    const qs = searchParams.toString();
    return this.request<SteamGameListResponse>(
      `/steam/games${qs ? `?${qs}` : ''}`,
    );
  }

  async getDetail(steamId: string): Promise<SteamGameDetail> {
    return this.request<SteamGameDetail>(
      `/steam/games/${encodeURIComponent(steamId)}`,
    );
  }

  async collect(steamId: string): Promise<SteamGameDetail> {
    return this.request<SteamGameDetail>(
      `/steam/games/collect?steamId=${encodeURIComponent(steamId)}`,
      {
        method: 'POST',
      },
    );
  }
}
