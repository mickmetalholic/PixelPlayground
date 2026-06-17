import type { GameDiscountEvent } from './game-discount-event.types';

export const mockDiscountEvents: GameDiscountEvent[] = [
  {
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
  },
  {
    id: 'disc-002',
    steamId: '2507950',
    startAt: '2026-05-01T00:00:00Z',
    endAt: '2026-05-15T00:00:00Z',
    discountPercent: 10,
    discountedPrice: {
      currency: 'USD',
      final: 3599,
      finalFormatted: '$35.99',
    },
    type: 'nonHistoricLow',
  },
  {
    id: 'disc-003',
    steamId: '271590',
    startAt: '2025-12-20T00:00:00Z',
    endAt: '2026-01-05T00:00:00Z',
    discountPercent: 50,
    discountedPrice: {
      currency: 'USD',
      final: 1499,
      finalFormatted: '$14.99',
    },
    type: 'historicLow',
  },
  {
    id: 'disc-004',
    steamId: '413150',
    startAt: '2025-11-01T00:00:00Z',
    endAt: '2025-11-07T00:00:00Z',
    discountPercent: 0,
    discountedPrice: {
      currency: 'USD',
      final: 1499,
      finalFormatted: '$14.99',
    },
    type: 'nonHistoricLow',
  },
  {
    id: 'disc-orphan',
    steamId: '999999',
    startAt: '2026-01-01T00:00:00Z',
    endAt: '2026-01-15T00:00:00Z',
    discountPercent: 10,
    discountedPrice: {
      currency: 'USD',
      final: 999,
      finalFormatted: '$9.99',
    },
    type: 'nonHistoricLow',
  },
];

export function getAllDiscountEvents(): GameDiscountEvent[] {
  return mockDiscountEvents;
}
