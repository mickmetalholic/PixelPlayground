import type {
  GameDiscountEventListItem,
  GameDiscountEventListResponse,
} from './steam/game-discount-event.types.ts';
import type {
  GameDiscountNewsCandidateResponse,
  GameDiscountNewsEntry,
  GameDiscountNewsEntryListResponse,
  NewsCycleStatus,
} from './steam/game-discount-news-entry.types.ts';
import type {
  SteamGameDetail,
  SteamGameListResponse,
} from './steam/steam-game.types.ts';

export type HomeServicePort = {
  getSummary: () => Promise<string>;
};

export type SteamServicePort = {
  getGames: (params: {
    q?: string;
    limit?: number;
    cursor?: string;
  }) => Promise<SteamGameListResponse>;
  getDetail: (steamId: string) => Promise<SteamGameDetail>;
  collect: (steamId: string) => Promise<SteamGameDetail>;
};

export type DiscountEventsServicePort = {
  getDiscountEvents: (params: {
    limit?: number;
    cursor?: string;
  }) => Promise<GameDiscountEventListResponse>;
  getCurrentDiscountEvents: (params: {
    limit?: number;
    cursor?: string;
  }) => Promise<GameDiscountEventListResponse>;
  getDiscountEventById: (
    discountEventId: string,
  ) => Promise<GameDiscountEventListItem | null>;
};

export type DiscountNewsServicePort = {
  createDraft: (params?: {
    type?: 'dailyDeal';
  }) => Promise<GameDiscountNewsEntry>;
  listEntries: () => Promise<GameDiscountNewsEntryListResponse>;
  getCandidates: (
    newsEntryId: string,
    params?: { limit?: number },
  ) => Promise<GameDiscountNewsCandidateResponse>;
  updateSelectedEvents: (
    newsEntryId: string,
    selectedDiscountEventIds: string[],
  ) => Promise<GameDiscountNewsEntry>;
  updateStatus: (
    newsEntryId: string,
    status: NewsCycleStatus,
  ) => Promise<GameDiscountNewsEntry>;
};

export type AppContext = {
  services: {
    home: HomeServicePort;
    steam?: SteamServicePort;
    discountEvents?: DiscountEventsServicePort;
    discountNews?: DiscountNewsServicePort;
  };
};
