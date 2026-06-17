import { Test, type TestingModule } from '@nestjs/testing';
import {
  SteamAppdetailsClient,
  SteamAppdetailsTransportError,
} from './steam-appdetails.client';
import { SteamMetadataNormalizer } from './steam-metadata.normalizer';
import { SteamMetadataRepository } from './steam-metadata.repository';
import {
  SteamCollectionNotFoundError,
  SteamGameNotFoundError,
  SteamMetadataService,
} from './steam-metadata.service';

describe('SteamMetadataService', () => {
  let service: SteamMetadataService;
  let repository: SteamMetadataRepository;
  let steamClient: SteamAppdetailsClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SteamMetadataService,
        SteamMetadataRepository,
        SteamAppdetailsClient,
        SteamMetadataNormalizer,
      ],
    }).compile();

    service = module.get<SteamMetadataService>(SteamMetadataService);
    repository = module.get<SteamMetadataRepository>(SteamMetadataRepository);
    steamClient = module.get<SteamAppdetailsClient>(SteamAppdetailsClient);

    repository.seed([
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
        shortDescription:
          'Every day, millions of players worldwide enter the battle.',
        detailedDescription: 'Dota 2 is a competitive game.',
        categories: ['Multi-player'],
        supportedLanguages: [],
        recommendations: 1980342,
        screenshots: [],
        storeUrl: 'https://store.steampowered.com/app/570',
      },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getGames', () => {
    it('lists all games', () => {
      const result = service.getGames();
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by search query', () => {
      const result = service.getGames('dota');
      expect(result.items).toHaveLength(1);

      const noResult = service.getGames('nonexistent');
      expect(noResult.items).toHaveLength(0);
    });
  });

  describe('getDetail', () => {
    it('returns detail for existing steamId', () => {
      const detail = service.getDetail('570');
      expect(detail.nameEn).toBe('Dota 2');
    });

    it('throws SteamGameNotFoundError for unknown steamId', () => {
      expect(() => service.getDetail('999999')).toThrow(SteamGameNotFoundError);
    });
  });

  describe('collect', () => {
    it('throws SteamCollectionNotFoundError when Steam returns success:false', async () => {
      vi.spyOn(steamClient, 'fetch').mockResolvedValue({ success: false });

      await expect(service.collect('999999')).rejects.toThrow(
        SteamCollectionNotFoundError,
      );
    });

    it('throws SteamAppdetailsTransportError on transport failure', async () => {
      vi.spyOn(steamClient, 'fetch').mockRejectedValue(
        new SteamAppdetailsTransportError('Network error'),
      );

      await expect(service.collect('999999')).rejects.toThrow(
        SteamAppdetailsTransportError,
      );
    });

    it('normalizes, upserts, and returns a game on successful collection', async () => {
      vi.spyOn(steamClient, 'fetch').mockResolvedValue({
        success: true,
        data: { type: 'game', name: 'New Game' },
      });

      const result = await service.collect('12345');
      expect(result.steamId).toBe('12345');
      expect(result.nameEn).toBe('New Game');

      const stored = service.getDetail('12345');
      expect(stored.steamId).toBe('12345');
    });
  });
});
