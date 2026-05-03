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

export type AppContext = {
  services: {
    home: HomeServicePort;
    steam?: SteamServicePort;
  };
};
