import { Injectable } from '@nestjs/common';
import type {
  SteamGameDetail,
  SteamGameListResponse,
} from '@pixel-playground/api';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime class references
import { SteamAppdetailsClient } from './steam-appdetails.client';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime class references
import { SteamMetadataNormalizer } from './steam-metadata.normalizer';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime class references
import { SteamMetadataRepository } from './steam-metadata.repository';

@Injectable()
export class SteamMetadataService {
  constructor(
    private readonly repository: SteamMetadataRepository,
    private readonly steamClient: SteamAppdetailsClient,
    private readonly normalizer: SteamMetadataNormalizer,
  ) {}

  getGames(q?: string, limit = 20, cursor?: string): SteamGameListResponse {
    let items = this.repository.list();
    const total = items.length;

    if (q) {
      items = this.repository.search(q, items);
    }

    const {
      items: pageItems,
      nextCursor,
      hasNextPage,
    } = this.repository.paginate(items, limit, cursor ?? null);

    return {
      items: pageItems.map(this.toSummary),
      pageInfo: { limit, nextCursor, hasNextPage },
      query: q ?? '',
      total,
    };
  }

  getDetail(steamId: string): SteamGameDetail {
    const game = this.repository.findById(steamId);
    if (!game) {
      throw new SteamGameNotFoundError(steamId);
    }
    return game;
  }

  async collect(steamId: string): Promise<SteamGameDetail> {
    const result = await this.steamClient.fetch(steamId);

    if (!result.success) {
      throw new SteamCollectionNotFoundError(steamId);
    }

    const normalized = this.normalizer.normalize(result.data, steamId);
    this.repository.upsert(normalized);
    const stored = this.repository.findById(steamId);
    if (!stored) {
      throw new Error(
        `INVARIANT: Steam game "${steamId}" missing after upsert`,
      );
    }
    return stored;
  }

  private toSummary(game: SteamGameDetail) {
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
      priceOverview: game.priceOverview,
      platforms: game.platforms,
      metadataStatus: game.metadataStatus,
      sourceLanguageFallback: game.sourceLanguageFallback,
      lastSyncedAt: game.lastSyncedAt,
    };
  }
}

export class SteamGameNotFoundError extends Error {
  constructor(steamId: string) {
    super(
      `STEAM_GAME_NOT_FOUND: Steam game with ID "${steamId}" was not found.`,
    );
    this.name = 'SteamGameNotFoundError';
  }
}

export class SteamCollectionNotFoundError extends Error {
  constructor(steamId: string) {
    super(
      `STEAM_GAME_NOT_FOUND: Steam app "${steamId}" was not found on Steam.`,
    );
    this.name = 'SteamCollectionNotFoundError';
  }
}
