import { Injectable } from '@nestjs/common';

const STEAM_APPDETAILS_URL = 'https://store.steampowered.com/api/appdetails';

export class SteamAppdetailsTransportError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SteamAppdetailsTransportError';
  }
}

export class SteamAppdetailsParseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SteamAppdetailsParseError';
  }
}

type SteamAppdetailsRawResponse = Record<
  string,
  {
    success: boolean;
    data?: Record<string, unknown>;
  }
>;

@Injectable()
export class SteamAppdetailsClient {
  async fetch(
    appId: string,
  ): Promise<
    { success: true; data: Record<string, unknown> } | { success: false }
  > {
    let response: Response;
    try {
      response = await fetch(`${STEAM_APPDETAILS_URL}?appids=${appId}`, {
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err) {
      throw new SteamAppdetailsTransportError(
        `Failed to fetch Steam appdetails for AppID ${appId}`,
        err,
      );
    }

    if (!response.ok) {
      throw new SteamAppdetailsTransportError(
        `Steam appdetails returned HTTP ${response.status} for AppID ${appId}`,
      );
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch (err) {
      throw new SteamAppdetailsParseError(
        `Failed to parse Steam appdetails response for AppID ${appId}`,
        err,
      );
    }

    const raw = json as SteamAppdetailsRawResponse;
    const entry = raw[appId];

    if (!entry || entry.success !== true || !entry.data) {
      return { success: false };
    }

    return { success: true, data: entry.data };
  }
}
