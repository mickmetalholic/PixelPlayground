import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type {
  SteamGameDetail,
  SteamGameListResponse,
} from '@pixel-playground/api';
import {
  SteamAppdetailsParseError,
  SteamAppdetailsTransportError,
} from './steam-appdetails.client';
import {
  SteamCollectionNotFoundError,
  SteamGameNotFoundError,
  type SteamMetadataService,
} from './steam-metadata.service';

@Controller('steam/games')
export class SteamMetadataController {
  constructor(private readonly service: SteamMetadataService) {}

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ): Promise<SteamGameListResponse> {
    const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    return this.service.getGames(q, parsedLimit, cursor);
  }

  @Get(':steamId')
  async detail(@Param('steamId') steamId: string): Promise<SteamGameDetail> {
    try {
      return this.service.getDetail(steamId);
    } catch (err) {
      if (err instanceof SteamGameNotFoundError) {
        throw new HttpException(
          { code: 'STEAM_GAME_NOT_FOUND', message: err.message },
          HttpStatus.NOT_FOUND,
        );
      }
      throw err;
    }
  }

  @Post('collect')
  async collect(@Query('steamId') steamId: string): Promise<SteamGameDetail> {
    if (!steamId || !/^\d+$/.test(steamId)) {
      throw new HttpException(
        {
          code: 'STEAM_INVALID_APPID',
          message: `Invalid AppID: "${steamId}". Must be a numeric string.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.service.collect(steamId);
    } catch (err) {
      if (err instanceof SteamCollectionNotFoundError) {
        throw new HttpException(
          { code: 'STEAM_GAME_NOT_FOUND', message: err.message },
          HttpStatus.NOT_FOUND,
        );
      }
      if (
        err instanceof SteamAppdetailsTransportError ||
        err instanceof SteamAppdetailsParseError
      ) {
        throw new HttpException(
          {
            code: 'STEAM_UPSTREAM_FAILURE',
            message: `Steam upstream failure for AppID ${steamId}.`,
          },
          HttpStatus.BAD_GATEWAY,
        );
      }
      throw err;
    }
  }
}
