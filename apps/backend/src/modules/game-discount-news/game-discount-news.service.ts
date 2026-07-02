import { Injectable } from '@nestjs/common';
import type {
  GameDiscountEventListItem,
  GameDiscountNewsCandidate,
  GameDiscountNewsCandidateResponse,
  GameDiscountNewsEntry,
  GameDiscountNewsEntryListResponse,
  NewsCycleStatus,
  NewsCycleType,
} from '@pixel-playground/api';
import { GameDiscountEventsService } from '../game-discount-events/game-discount-events.service';
import {
  GameDiscountNewsEntryNotFoundError,
  GameDiscountNewsInvalidSelectionError,
  GameDiscountNewsInvalidStatusTransitionError,
  GameDiscountNewsUnsupportedStrategyError,
} from './game-discount-news.errors';
import { GameDiscountNewsRepository } from './game-discount-news.repository';
import { activeSelectionStrategies } from './selection-strategy';

const DEFAULT_CANDIDATE_LIMIT = 20;
const MAX_CANDIDATE_SOURCE_LIMIT = 100;
const SCORE_END_REFERENCE = Date.parse('2100-01-01T00:00:00.000Z');

@Injectable()
export class GameDiscountNewsService {
  private nowProvider: () => Date = () => new Date();
  private readonly strategies = new Map(
    activeSelectionStrategies.map((strategy) => [strategy.type, strategy]),
  );

  constructor(
    private readonly repository: GameDiscountNewsRepository,
    private readonly discountEventsService: GameDiscountEventsService,
  ) {}

  setNowProviderForTests(nowProvider: () => Date): void {
    this.nowProvider = nowProvider;
  }

  createDraft(params?: { type?: NewsCycleType }): GameDiscountNewsEntry {
    const type = params?.type ?? 'dailyDeal';
    this.assertStrategyIsActive(type);
    return this.repository.create({ type, now: this.nowProvider() });
  }

  listEntries(): GameDiscountNewsEntryListResponse {
    const items = this.repository
      .list()
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));

    return { items, total: items.length };
  }

  getCandidates(
    newsEntryId: string,
    params?: { limit?: number },
  ): GameDiscountNewsCandidateResponse {
    const entry = this.getEntryOrThrow(newsEntryId);
    const strategy = this.getStrategyOrThrow(entry.type);
    const readySelectedIds = this.getReadySelectedIdsExcluding(entry.id);
    const selectedIds = new Set(entry.selectedDiscountEventIds);
    const currentEvents = this.discountEventsService.getCurrentDiscountEvents({
      limit: MAX_CANDIDATE_SOURCE_LIMIT,
    }).items;

    const candidates = strategy
      .filter(currentEvents)
      .filter((event) => !readySelectedIds.has(event.id))
      .map((event) => this.toCandidate(event, selectedIds.has(event.id)))
      .toSorted(compareCandidates);

    const limit = params?.limit ?? DEFAULT_CANDIDATE_LIMIT;
    return {
      items: candidates.slice(0, limit),
      total: candidates.length,
      limit,
    };
  }

  updateSelectedEvents(
    newsEntryId: string,
    selectedDiscountEventIds: string[],
  ): GameDiscountNewsEntry {
    this.getEntryOrThrow(newsEntryId);

    for (const discountEventId of selectedDiscountEventIds) {
      if (!this.discountEventsService.hasDiscountEvent(discountEventId)) {
        throw new GameDiscountNewsInvalidSelectionError(discountEventId);
      }
    }

    const updated = this.repository.updateSelectedEvents(
      newsEntryId,
      selectedDiscountEventIds,
      this.nowProvider(),
    );

    if (!updated) {
      throw new GameDiscountNewsEntryNotFoundError(newsEntryId);
    }

    return updated;
  }

  updateStatus(
    newsEntryId: string,
    status: NewsCycleStatus,
  ): GameDiscountNewsEntry {
    const entry = this.getEntryOrThrow(newsEntryId);

    if (!this.canTransition(entry.status, status)) {
      throw new GameDiscountNewsInvalidStatusTransitionError(
        entry.status,
        status,
      );
    }

    const updated = this.repository.updateStatus(
      newsEntryId,
      status,
      this.nowProvider(),
    );

    if (!updated) {
      throw new GameDiscountNewsEntryNotFoundError(newsEntryId);
    }

    return updated;
  }

  private getEntryOrThrow(id: string): GameDiscountNewsEntry {
    const entry = this.repository.findById(id);
    if (!entry) {
      throw new GameDiscountNewsEntryNotFoundError(id);
    }
    return entry;
  }

  private assertStrategyIsActive(type: NewsCycleType): void {
    this.getStrategyOrThrow(type);
  }

  private getStrategyOrThrow(type: NewsCycleType) {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new GameDiscountNewsUnsupportedStrategyError(type);
    }
    return strategy;
  }

  private getReadySelectedIdsExcluding(newsEntryId: string): Set<string> {
    return new Set(
      this.repository
        .list()
        .filter((entry) => entry.id !== newsEntryId && entry.status === 'ready')
        .flatMap((entry) => entry.selectedDiscountEventIds),
    );
  }

  private canTransition(from: NewsCycleStatus, to: NewsCycleStatus): boolean {
    return from === to || (from === 'draft' && to === 'ready');
  }

  private toCandidate(
    event: GameDiscountEventListItem,
    alreadySelected: boolean,
  ): GameDiscountNewsCandidate {
    const score = getCandidateScore(event);
    return {
      ...event,
      score,
      reason: getCandidateReason(event),
      alreadySelected,
    };
  }
}

function compareCandidates(
  a: GameDiscountNewsCandidate,
  b: GameDiscountNewsCandidate,
): number {
  return (
    b.score - a.score ||
    new Date(a.endAt).getTime() - new Date(b.endAt).getTime() ||
    new Date(b.startAt).getTime() - new Date(a.startAt).getTime() ||
    a.id.localeCompare(b.id)
  );
}

function getCandidateScore(event: GameDiscountEventListItem): number {
  const typeScore =
    event.type === 'newHistoricLow' ? 3 : event.type === 'historicLow' ? 2 : 1;
  const endSoonScore =
    (SCORE_END_REFERENCE - new Date(event.endAt).getTime()) / 100_000_000;
  const newerStartScore = new Date(event.startAt).getTime() / 100_000_000_000;

  return Math.round(
    typeScore * 1_000_000 +
      event.discountPercent * 1_000 +
      endSoonScore +
      newerStartScore,
  );
}

function getCandidateReason(event: GameDiscountEventListItem): string {
  const typeReason =
    event.type === 'newHistoricLow'
      ? 'new historic low'
      : event.type === 'historicLow'
        ? 'historic low'
        : 'standard discount';

  return `${typeReason}, ${event.discountPercent}% off, ends ${formatDate(
    event.endAt,
  )}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
