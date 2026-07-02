import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import type { NextFunction, Request, Response } from 'express';
import { AppService } from '../../app.service';
import { GameDiscountEventsModule } from '../game-discount-events/game-discount-events.module';
import { GameDiscountEventsService } from '../game-discount-events/game-discount-events.service';
import { GameDiscountNewsModule } from '../game-discount-news/game-discount-news.module';
import { GameDiscountNewsService } from '../game-discount-news/game-discount-news.service';
import { SteamMetadataModule } from '../steam-metadata/steam-metadata.module';
import { SteamMetadataService } from '../steam-metadata/steam-metadata.service';
import { createNestTrpcContext } from './trpc.context';
import { appRouter } from './trpc.router';

@Module({
  imports: [
    SteamMetadataModule,
    GameDiscountEventsModule,
    GameDiscountNewsModule,
  ],
  providers: [AppService],
})
export class TrpcModule implements NestModule {
  constructor(
    private readonly appService: AppService,
    private readonly steamMetadataService: SteamMetadataService,
    private readonly discountEventsService: GameDiscountEventsService,
    private readonly discountNewsService: GameDiscountNewsService,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(async (req: Request, res: Response, next: NextFunction) => {
        try {
          return createHTTPHandler({
            router: appRouter,
            createContext: createNestTrpcContext(
              this.appService,
              this.steamMetadataService,
              this.discountEventsService,
              this.discountNewsService,
            ),
          })(req, res);
        } catch (error) {
          next(error);
        }
      })
      .forRoutes('/trpc');
  }
}
