import { Injectable } from '@nestjs/common';
import type {
  GameDiscountNewsEntry,
  NewsCycleStatus,
  NewsCycleType,
} from '@pixel-playground/api';

@Injectable()
export class GameDiscountNewsRepository {
  private sequence = 0;
  private readonly store = new Map<string, GameDiscountNewsEntry>();

  create(params: { type: NewsCycleType; now: Date }): GameDiscountNewsEntry {
    this.sequence += 1;
    const timestamp = params.now.toISOString();
    const entry: GameDiscountNewsEntry = {
      id: `discount-news-${String(this.sequence).padStart(4, '0')}`,
      type: params.type,
      status: 'draft',
      selectedDiscountEventIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.store.set(entry.id, entry);
    return entry;
  }

  list(): GameDiscountNewsEntry[] {
    return Array.from(this.store.values());
  }

  findById(id: string): GameDiscountNewsEntry | undefined {
    return this.store.get(id);
  }

  updateSelectedEvents(
    id: string,
    selectedDiscountEventIds: string[],
    now: Date,
  ): GameDiscountNewsEntry | undefined {
    const entry = this.store.get(id);
    if (!entry) {
      return undefined;
    }

    const updated = {
      ...entry,
      selectedDiscountEventIds,
      updatedAt: now.toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }

  updateStatus(
    id: string,
    status: NewsCycleStatus,
    now: Date,
  ): GameDiscountNewsEntry | undefined {
    const entry = this.store.get(id);
    if (!entry) {
      return undefined;
    }

    const updated = {
      ...entry,
      status,
      updatedAt: now.toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }

  clearForTests(): void {
    this.sequence = 0;
    this.store.clear();
  }

  insertForTests(entry: GameDiscountNewsEntry): void {
    this.store.set(entry.id, entry);
  }
}
