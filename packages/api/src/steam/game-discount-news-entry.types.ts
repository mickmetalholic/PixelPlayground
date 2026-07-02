import type { GameDiscountEventListItem } from './game-discount-event.types.ts';

export type NewsCycleType =
  | 'dailyDeal'
  | 'seasonalSale'
  | 'publisherSale'
  | 'genreSale'
  | 'thematic';

export type NewsCycleStatus = 'draft' | 'ready';

export interface GameDiscountNewsEntry {
  id: string;
  type: NewsCycleType;
  status: NewsCycleStatus;
  selectedDiscountEventIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GameDiscountNewsEntryListResponse {
  items: GameDiscountNewsEntry[];
  total: number;
}

export interface GameDiscountNewsCandidate extends GameDiscountEventListItem {
  score: number;
  reason: string;
  alreadySelected: boolean;
}

export interface GameDiscountNewsCandidateResponse {
  items: GameDiscountNewsCandidate[];
  total: number;
  limit: number;
}

export const GameDiscountNewsErrorCode = {
  ENTRY_NOT_FOUND: 'DISCOUNT_NEWS_ENTRY_NOT_FOUND',
  INVALID_SELECTION: 'DISCOUNT_NEWS_INVALID_SELECTION',
  UNSUPPORTED_STRATEGY: 'DISCOUNT_NEWS_UNSUPPORTED_STRATEGY',
  SERVICE_UNAVAILABLE: 'DISCOUNT_NEWS_SERVICE_UNAVAILABLE',
} as const;
