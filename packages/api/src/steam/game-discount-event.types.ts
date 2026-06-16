import type { PageInfo } from './steam-game.types.ts';

export type GameDiscountEventType =
  | 'nonHistoricLow'
  | 'historicLow'
  | 'newHistoricLow';

export interface GameDiscountEvent {
  id: string;
  steamId: string;
  startAt: string;
  endAt: string;
  discountPercent: number;
  discountedPrice: {
    currency: string;
    final: number;
    finalFormatted: string;
  };
  type: GameDiscountEventType;
}

export interface GameDiscountEventListItem {
  id: string;
  steamId: string;
  startAt: string;
  endAt: string;
  discountPercent: number;
  discountedPrice: {
    currency: string;
    final: number;
    finalFormatted: string;
  };
  type: GameDiscountEventType;
  game: {
    steamId: string;
    nameEn: string;
    nameZh: string;
    capsuleImage: string;
  };
}

export interface GameDiscountEventListResponse {
  items: GameDiscountEventListItem[];
  pageInfo: PageInfo;
  total: number;
}
