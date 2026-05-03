export interface SteamPriceOverview {
  currency: string;
  initial: number;
  final: number;
  discountPercent: number;
  finalFormatted: string;
}

export interface SteamPlatforms {
  windows: boolean;
  mac: boolean;
  linux: boolean;
}

export interface SteamSupportedLanguage {
  name: string;
  interface: boolean;
  fullAudio: boolean;
  subtitles: boolean;
}

export interface SteamRequirements {
  minimum: string;
  recommended: string;
}

export interface SteamMovie {
  id: number;
  name: string;
  thumbnail: string;
  webm: { max: string; '480': string };
  mp4: { max: string; '480': string };
}

export interface SteamPackageGroup {
  name: string;
  title: string;
  description: string;
  selectionText: string;
  saveText: string;
  displayType: number;
  isSubscription: boolean;
  subs: {
    packageid: number;
    percent_savings_text: string;
    percent_savings: number;
    option_text: string;
    option_description: string;
    can_get_free_license: string;
    is_free_license: boolean;
    price_in_cents_with_discount: number;
  }[];
}

export interface SteamGameSummary {
  steamId: string;
  nameEn: string;
  nameZh: string;
  capsuleImage: string;
  headerImage: string;
  releaseDate: string;
  developers: string[];
  publishers: string[];
  genres: string[];
  isFree: boolean;
  priceOverview: SteamPriceOverview | null;
  platforms: SteamPlatforms;
  metadataStatus: 'ready' | 'fallback';
  sourceLanguageFallback: boolean;
  lastSyncedAt: string;
}

export interface SteamGameDetail extends SteamGameSummary {
  shortDescription: string;
  detailedDescription: string;
  categories: string[];
  supportedLanguages: SteamSupportedLanguage[];
  supportedLanguagesRaw?: string;
  recommendations: number | null;
  screenshots: string[];
  movies?: SteamMovie[];
  packages?: number[];
  packageGroups?: SteamPackageGroup[];
  pcRequirements?: SteamRequirements | null;
  macRequirements?: SteamRequirements | null;
  linuxRequirements?: SteamRequirements | null;
  storeUrl: string;
  rawSteamData?: Record<string, unknown>;
}

export interface PageInfo {
  limit: number;
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface SteamGameListResponse {
  items: SteamGameSummary[];
  pageInfo: PageInfo;
  query: string;
  total: number;
}

export const SteamErrorCode = {
  INVALID_APPID: 'STEAM_INVALID_APPID',
  GAME_NOT_FOUND: 'STEAM_GAME_NOT_FOUND',
  UPSTREAM_FAILURE: 'STEAM_UPSTREAM_FAILURE',
  UNKNOWN_DETAIL: 'STEAM_UNKNOWN_DETAIL',
} as const;
