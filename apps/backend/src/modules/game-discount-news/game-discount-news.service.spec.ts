import type {
  GameDiscountEventListItem,
  GameDiscountEventListResponse,
} from '@pixel-playground/api';
import { GameDiscountEventsService } from '../game-discount-events/game-discount-events.service';
import {
  GameDiscountNewsEntryNotFoundError,
  GameDiscountNewsInvalidSelectionError,
  GameDiscountNewsInvalidStatusTransitionError,
  GameDiscountNewsUnsupportedStrategyError,
} from './game-discount-news.errors';
import { GameDiscountNewsRepository } from './game-discount-news.repository';
import { GameDiscountNewsService } from './game-discount-news.service';

const baseGame = {
  steamId: '1091500',
  nameEn: 'Cyberpunk 2077',
  nameZh: '赛博朋克 2077',
  capsuleImage: 'capsule.jpg',
};

function event(
  overrides: Partial<GameDiscountEventListItem>,
): GameDiscountEventListItem {
  return {
    id: 'disc-001',
    steamId: '1091500',
    startAt: '2026-06-15T00:00:00Z',
    endAt: '2026-06-29T00:00:00Z',
    discountPercent: 50,
    discountedPrice: {
      currency: 'USD',
      final: 2999,
      finalFormatted: '$29.99',
    },
    type: 'newHistoricLow',
    game: baseGame,
    ...overrides,
  };
}

function createService(currentEvents: GameDiscountEventListItem[]) {
  const repository = new GameDiscountNewsRepository();
  const knownIds = new Set(currentEvents.map((item) => item.id));
  const discountEventsService = {
    getCurrentDiscountEvents: vi.fn(
      (): GameDiscountEventListResponse => ({
        items: currentEvents,
        pageInfo: { limit: 100, hasNextPage: false, nextCursor: null },
        total: currentEvents.length,
      }),
    ),
    hasDiscountEvent: vi.fn((id: string) => knownIds.has(id)),
  } as unknown as GameDiscountEventsService;

  const service = new GameDiscountNewsService(
    repository,
    discountEventsService,
  );

  return { service, repository, discountEventsService };
}

describe('GameDiscountNewsService', () => {
  it('creates daily-deal drafts with stable IDs and timestamps', () => {
    const { service } = createService([]);
    service.setNowProviderForTests(() => new Date('2026-07-01T00:00:00.000Z'));

    const draft = service.createDraft();

    expect(draft).toEqual({
      id: 'discount-news-0001',
      type: 'dailyDeal',
      status: 'draft',
      selectedDiscountEventIds: [],
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-01T00:00:00.000Z',
    });
  });

  it('rejects inactive draft types', () => {
    const { service } = createService([]);

    expect(() => service.createDraft({ type: 'genreSale' })).toThrow(
      GameDiscountNewsUnsupportedStrategyError,
    );
  });

  it('lists drafts by creation time descending', () => {
    const { service } = createService([]);
    service.setNowProviderForTests(() => new Date('2026-07-01T00:00:00Z'));
    const first = service.createDraft();
    service.setNowProviderForTests(() => new Date('2026-07-02T00:00:00Z'));
    const second = service.createDraft();

    expect(service.listEntries().items.map((entry) => entry.id)).toEqual([
      second.id,
      first.id,
    ]);
  });

  it('updates selected events with order preservation and timestamp changes', () => {
    const { service } = createService([
      event({ id: 'disc-001' }),
      event({ id: 'disc-002' }),
    ]);
    const draft = service.createDraft();
    service.setNowProviderForTests(() => new Date('2026-07-03T00:00:00Z'));

    const updated = service.updateSelectedEvents(draft.id, [
      'disc-002',
      'disc-001',
    ]);

    expect(updated.selectedDiscountEventIds).toEqual(['disc-002', 'disc-001']);
    expect(updated.updatedAt).toBe('2026-07-03T00:00:00.000Z');
  });

  it('rejects unknown drafts and unknown selected events', () => {
    const { service } = createService([event({ id: 'disc-001' })]);

    expect(() => service.updateSelectedEvents('missing', [])).toThrow(
      GameDiscountNewsEntryNotFoundError,
    );
    const draft = service.createDraft();
    expect(() => service.updateSelectedEvents(draft.id, ['missing'])).toThrow(
      GameDiscountNewsInvalidSelectionError,
    );
  });

  it('validates status transitions', () => {
    const { service } = createService([]);
    const draft = service.createDraft();

    const ready = service.updateStatus(draft.id, 'ready');

    expect(ready.status).toBe('ready');
    expect(() => service.updateStatus(draft.id, 'draft')).toThrow(
      GameDiscountNewsInvalidStatusTransitionError,
    );
  });

  it('ranks daily-deal candidates and includes score, reason, and selection state', () => {
    const { service } = createService([
      event({
        id: 'standard',
        type: 'nonHistoricLow',
        discountPercent: 80,
        endAt: '2026-06-20T00:00:00Z',
      }),
      event({
        id: 'historic',
        type: 'historicLow',
        discountPercent: 50,
        endAt: '2026-06-18T00:00:00Z',
      }),
      event({
        id: 'new-low',
        type: 'newHistoricLow',
        discountPercent: 10,
        endAt: '2026-06-30T00:00:00Z',
      }),
    ]);
    const draft = service.createDraft();
    service.updateSelectedEvents(draft.id, ['historic']);

    const result = service.getCandidates(draft.id, { limit: 3 });

    expect(result.items.map((item) => item.id)).toEqual([
      'new-low',
      'historic',
      'standard',
    ]);
    expect(result.items[1].alreadySelected).toBe(true);
    expect(result.items[0].score).toBeGreaterThan(0);
    expect(result.items[0].reason).toContain('new historic low');
  });

  it('excludes event IDs used by ready pools while allowing same-game future events', () => {
    const { service } = createService([
      event({ id: 'same-game-old', steamId: '1091500' }),
      event({ id: 'same-game-new', steamId: '1091500' }),
    ]);
    const readyDraft = service.createDraft();
    service.updateSelectedEvents(readyDraft.id, ['same-game-old']);
    service.updateStatus(readyDraft.id, 'ready');
    const nextDraft = service.createDraft();

    const result = service.getCandidates(nextDraft.id);

    expect(result.items.map((item) => item.id)).toEqual(['same-game-new']);
  });

  it('rejects inactive strategy entries explicitly', () => {
    const { service, repository } = createService([]);
    repository.insertForTests({
      id: 'inactive',
      type: 'genreSale',
      status: 'draft',
      selectedDiscountEventIds: [],
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-01T00:00:00.000Z',
    });

    expect(() => service.getCandidates('inactive')).toThrow(
      GameDiscountNewsUnsupportedStrategyError,
    );
  });

  it('applies candidate limit after ranking', () => {
    const { service } = createService([
      event({ id: 'first', type: 'newHistoricLow', discountPercent: 50 }),
      event({ id: 'second', type: 'historicLow', discountPercent: 90 }),
    ]);
    const draft = service.createDraft();

    const result = service.getCandidates(draft.id, { limit: 1 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('first');
    expect(result.total).toBe(2);
  });
});
