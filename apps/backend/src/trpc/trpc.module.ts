import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { AppService } from '../app.service';
import { createNestTrpcContext } from './trpc.context';
import { loadAppRouter } from './trpc.router';

@Module({})
export class TrpcModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(async (req, res, next) => {
        try {
          const appService = req.app.get(AppService);
          const appRouter = await loadAppRouter();
          return createHTTPHandler({
            router: appRouter,
            createContext: createNestTrpcContext(appService),
          })(req, res);
        } catch (error) {
          next(error);
        }
      })
      .forRoutes('/trpc');
  }
}
