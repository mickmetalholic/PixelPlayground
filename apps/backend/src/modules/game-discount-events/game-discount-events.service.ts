import { Injectable } from '@nestjs/common';
import {
  listDiscountEvents,
  type GameDiscountEvent,
  type GameDiscountEventListItem,
  type GameDiscountEventListResponse,
} from '@pixel-playground/api';
import { SteamMetadataRepository } from '../steam-metadata/steam-metadata.repository';
import { GameDiscountEventsRepository } from './game-discount-events.repository';

@Injectable()
export class GameDiscountEventsService {
  private nowProvider: () => Date = () => new Date();

  constructor(
    private readonly repository: GameDiscountEventsRepository,
    private readonly steamMetadataRepository: SteamMetadataRepository,
  ) {}

  setNowProviderForTests(nowProvider: () => Date): void {
    this.nowProvider = nowProvider;
  }

  resetNowProviderForTests(): void {
    this.nowProvider = () => new Date();
  }

  getDiscountEvents(params: {
    limit?: number;
    cursor?: string;
  }): GameDiscountEventListResponse {
    return this.toListResponse(this.repository.list(), params);
  }

  getCurrentDiscountEvents(params: {
    limit?: number;
    cursor?: string;
  }): GameDiscountEventListResponse {
    const now = this.nowProvider();
    return this.toListResponse(
      this.repository.list().filter((event) => this.isCurrent(event, now)),
      params,
    );
  }

  getDiscountEventById(id: string): GameDiscountEventListItem | null {
    const event = this.repository.findById(id);
    if (!event) {
      return null;
    }

    return (
      this.toListResponse([event], { limit: 1 }).items.find(
        (item) => item.id === id,
      ) ?? null
    );
  }

  hasDiscountEvent(id: string): boolean {
    return this.repository.findById(id) !== undefined;
  }

  private toListResponse(
    events: GameDiscountEvent[],
    params: { limit?: number; cursor?: string },
  ): GameDiscountEventListResponse {
    return listDiscountEvents(
      events,
      this.steamMetadataRepository.list(),
      params.limit,
      params.cursor,
    );
  }

  private isCurrent(event: GameDiscountEvent, now: Date): boolean {
    return new Date(event.startAt) <= now && new Date(event.endAt) > now;
  }
}
