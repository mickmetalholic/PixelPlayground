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
  recommendations: number | null;
  screenshots: string[];
  storeUrl: string;
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
