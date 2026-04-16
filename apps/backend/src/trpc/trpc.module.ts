import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import type { NextFunction, Request, Response } from 'express';
import { AppService } from '../app.service';
import { createNestTrpcContext } from './trpc.context';
import { appRouter } from './trpc.router';

@Module({
  providers: [AppService],
})
export class TrpcModule implements NestModule {
  constructor(private readonly appService: AppService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(async (req: Request, res: Response, next: NextFunction) => {
        try {
          return createHTTPHandler({
            router: appRouter,
            createContext: createNestTrpcContext(this.appService),
          })(req, res);
        } catch (error) {
          next(error);
        }
      })
      .forRoutes('/trpc');
  }
}
