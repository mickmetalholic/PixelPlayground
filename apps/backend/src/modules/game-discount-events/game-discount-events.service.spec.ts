import { Test, type TestingModule } from '@nestjs/testing';
import { mockGameRecords } from '../steam-metadata/steam-metadata.seed';
import { SteamMetadataRepository } from '../steam-metadata/steam-metadata.repository';
import { GameDiscountEventsRepository } from './game-discount-events.repository';
import { GameDiscountEventsService } from './game-discount-events.service';

describe('GameDiscountEventsService', () => {
  let service: GameDiscountEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameDiscountEventsRepository,
        GameDiscountEventsService,
        SteamMetadataRepository,
      ],
    }).compile();

    const metadataRepository = module.get<SteamMetadataRepository>(
      SteamMetadataRepository,
    );
    metadataRepository.seed(mockGameRecords);
    service = module.get<GameDiscountEventsService>(GameDiscountEventsService);
  });

  afterEach(() => {
    service.resetNowProviderForTests();
  });

  it('returns joined discount events and excludes orphan events', () => {
    const result = service.getDiscountEvents({ limit: 20 });

    expect(result.items).toHaveLength(4);
    expect(result.items.some((event) => event.id === 'disc-orphan')).toBe(
      false,
    );
    expect(result.items[0].game.nameEn).toBeTruthy();
  });

  it('preserves descending start date sort and pagination', () => {
    const result = service.getDiscountEvents({ limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.pageInfo.hasNextPage).toBe(true);
    expect(result.pageInfo.nextCursor).toBe('2');
    expect(new Date(result.items[0].startAt).getTime()).toBeGreaterThanOrEqual(
      new Date(result.items[1].startAt).getTime(),
    );
  });

  it('filters current discount events with test-controlled time', () => {
    service.setNowProviderForTests(() => new Date('2026-06-20T12:00:00Z'));

    const result = service.getCurrentDiscountEvents({ limit: 20 });

    expect(result.items.map((event) => event.id)).toEqual(['disc-001']);
  });

  it('finds joined discount event by ID', () => {
    const event = service.getDiscountEventById('disc-001');

    expect(event?.id).toBe('disc-001');
    expect(event?.game.steamId).toBe('1091500');
  });
});
