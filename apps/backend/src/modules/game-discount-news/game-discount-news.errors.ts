import { GameDiscountNewsErrorCode } from '@pixel-playground/api';
import type { NewsCycleStatus, NewsCycleType } from '@pixel-playground/api';

export class GameDiscountNewsEntryNotFoundError extends Error {
  constructor(id: string) {
    super(
      `${GameDiscountNewsErrorCode.ENTRY_NOT_FOUND}: Discount news entry "${id}" was not found.`,
    );
    this.name = 'GameDiscountNewsEntryNotFoundError';
  }
}

export class GameDiscountNewsInvalidSelectionError extends Error {
  constructor(discountEventId: string) {
    super(
      `${GameDiscountNewsErrorCode.INVALID_SELECTION}: Discount event "${discountEventId}" is not available.`,
    );
    this.name = 'GameDiscountNewsInvalidSelectionError';
  }
}

export class GameDiscountNewsUnsupportedStrategyError extends Error {
  constructor(type: NewsCycleType) {
    super(
      `${GameDiscountNewsErrorCode.UNSUPPORTED_STRATEGY}: News cycle type "${type}" is not active in this change.`,
    );
    this.name = 'GameDiscountNewsUnsupportedStrategyError';
  }
}

export class GameDiscountNewsInvalidStatusTransitionError extends Error {
  constructor(from: NewsCycleStatus, to: NewsCycleStatus) {
    super(`Invalid discount news status transition: ${from} -> ${to}.`);
    this.name = 'GameDiscountNewsInvalidStatusTransitionError';
  }
}
