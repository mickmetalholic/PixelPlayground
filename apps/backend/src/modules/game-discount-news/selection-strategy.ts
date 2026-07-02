import type {
  GameDiscountEventListItem,
  NewsCycleType,
} from '@pixel-playground/api';

export interface SelectionStrategy {
  readonly type: NewsCycleType;
  filter(events: GameDiscountEventListItem[]): GameDiscountEventListItem[];
}

export class DailyDealSelectionStrategy implements SelectionStrategy {
  readonly type = 'dailyDeal' as const;

  filter(events: GameDiscountEventListItem[]): GameDiscountEventListItem[] {
    return events;
  }
}

export const activeSelectionStrategies: SelectionStrategy[] = [
  new DailyDealSelectionStrategy(),
];
